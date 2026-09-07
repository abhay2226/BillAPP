import { AppDataSource } from "../datasource.js";
import type { EntityManager, EntityTarget, ObjectLiteral } from "typeorm";

import { Bill } from "../entity/TransactionsBill.js";
import { BillItem } from "../entity/TransactionsBillItem.js";
import { Customer } from "../entity/TransactionsCustomer.js";
import { MovementType } from "../entity/MasterMovementType.js";
import { ReferenceType } from "../entity/MasterReference.js";
import { Store } from "../entity/TransactionsStore.js";
import { Inventory } from "../entity/TransactionsInventory.js";
import { Discount } from "../entity/TransactionsDiscount.js";
import { StockMovement } from "../entity/TransactionsStockMovement.js";

import { resolveDiscountAmount } from "./DiscountServices.js";
import { createAuditRecordService } from "../services/AuditServices.js";

const billRepo = AppDataSource.getRepository(Bill);
const billItemRepo = AppDataSource.getRepository(BillItem);

export interface BillItemInput {
  inventory_id: number;
  qty: number;
}

export interface CreateBillInput {
  store_id: number;
  customer_id: number;
  items: BillItemInput[];
  discount_id?: number | null;
  tax_total?: number;
}

export interface BillHistoryFilters {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  invoiceNumber?: string;
  customerPhone?: string;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const TEN_MINUTES_MS = 10 * 60 * 1000;

const getCode = async <T extends ObjectLiteral>(
  manager: EntityManager,
  entityClass: EntityTarget<T>,
  code: string,
  label: string
): Promise<T> => {
  const row = await manager.findOne(entityClass, { where: { code, is_active: true } as any });
  if (!row) {
    throw new Error(`${label} with code '${code}' not found or inactive.`);
  }
  return row;
};

const generateInvoiceNumber = async (manager: EntityManager, store_id: number) => {
  const today = new Date();
  const datePart = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const seq = await manager
    .createQueryBuilder(Bill, "bill")
    .where("bill.store_id = :store_id", { store_id })
    .andWhere("bill.created_at >= :startOfDay", { startOfDay })
    .getCount();

  return `INV-${store_id}-${datePart}-${String(seq + 1).padStart(4, "0")}`;
};

//=========================================================================
// validate + price cart items against live inventory (write-path helper)
//=========================================================================
async function validateAndPriceCartItems(manager: EntityManager, storeId: number, items: BillItemInput[]) {
  const sortedItems = [...items].sort((a, b) => a.inventory_id - b.inventory_id);

  const lineItems: { inventory: Inventory; qty: number; unit_price: number; line_total: number }[] = [];
  let subtotal = 0;

  for (const item of sortedItems) {
    const inventory = await manager.findOne(Inventory, {
      where: { inventory_id: item.inventory_id },
      relations: ["product"],
      lock: { mode: "pessimistic_write" },
    });
    if (!inventory) {
      throw new Error(`Inventory ${item.inventory_id} not found.`);
    }
    if (!inventory.is_active) {
      throw new Error(`Inventory ${item.inventory_id} (${inventory.product?.product_name ?? ""}) is inactive.`);
    }
    if (inventory.store_id !== storeId) {
      throw new Error(`Inventory ${item.inventory_id} does not belong to store ${storeId}.`);
    }
    if (inventory.qty < item.qty) {
      throw new Error(
        `Insufficient stock for ${inventory.product?.product_name ?? `inventory ${item.inventory_id}`}. Available: ${inventory.qty}, requested: ${item.qty}.`
      );
    }

    const unit_price = Number(inventory.selling_price);
    const line_total = round2(unit_price * item.qty);
    subtotal = round2(subtotal + line_total);

    lineItems.push({ inventory, qty: item.qty, unit_price, line_total });
  }

  return { lineItems, subtotal };
}

//=========================================================================
// create bill_item rows + reduce inventory + log stock movement (write-path)
// Audits at the same granularity your AuditServices/StockMovementServices
// already use elsewhere: one row per table touched, per line item.
//=========================================================================
async function createBillItemRows(
  manager: EntityManager,
  billId: number,
  storeId: number,
  lineItems: { inventory: Inventory; qty: number; unit_price: number; line_total: number }[],
  movementTypeId: number,
  referenceTypeId: number,
  userId: number,
  sessionId: number
) {
  const now = new Date();

  for (const line of lineItems) {
    const billItem = manager.create(BillItem, {
      bill_id: billId,
      inventory_id: line.inventory.inventory_id,
      product_name_snapshot: line.inventory.product?.product_name ?? "",
      qty: line.qty,
      unit_price: line.unit_price,
      line_total: line.line_total,
      is_active: true,
      created_at: now,
      created_by: userId,
      updated_at: null,
      updated_by: null,
    });
    const savedBillItem = await manager.save(BillItem, billItem);

    await createAuditRecordService(manager, {
      tableName: "transactions_bill_item",
      recordId: savedBillItem.bill_item_id,
      actionTypeCode: "INSERT",
      userId,
      storeId,
      sessionId,
    });

    line.inventory.qty -= line.qty;
    line.inventory.updated_at = now;
    line.inventory.updated_by = userId;
    await manager.save(Inventory, line.inventory);

    await createAuditRecordService(manager, {
      tableName: "transactions_inventory",
      recordId: line.inventory.inventory_id,
      actionTypeCode: "UPDATE",
      userId,
      storeId,
      sessionId,
    });

    const stockMovement = manager.create(StockMovement, {
      inventory_id: line.inventory.inventory_id,
      movement_type_id: movementTypeId,
      reference_type_id: referenceTypeId,
      quantity_change: -line.qty,
      reference_id: savedBillItem.bill_item_id,
      is_active: true,
      created_at: now,
      created_by: userId,
      updated_at: now,
      updated_by: userId,
    });
    const savedMovement = await manager.save(StockMovement, stockMovement);

    await createAuditRecordService(manager, {
      tableName: "transactions_stock_movement",
      recordId: savedMovement.movement_id,
      actionTypeCode: "INSERT",
      userId,
      storeId,
      sessionId,
    });
  }
}

//=========================================================================
// bill items of a bill, joined with product info (read-path, for display)
//=========================================================================
export async function getBillItemsForBill(billId: number) {
  const items = await billItemRepo.find({
    where: { bill_id: billId },
    relations: ["inventory", "inventory.product"],
    order: { bill_item_id: "ASC" },
  });

  return items.map((item) => ({
    billItemId: item.bill_item_id,
    inventoryId: item.inventory_id,
    productId: item.inventory?.product?.product_id ?? null,
    productName: item.product_name_snapshot || item.inventory?.product?.product_name || "Unknown product",
    qty: item.qty,
    unitPrice: Number(item.unit_price),
    lineTotal: Number(item.line_total),
  }));
}

//=========================================================================
// create bill
//=========================================================================
export const createBillService = async (input: CreateBillInput, userId: number, sessionId: number) => {
  if (!input.items || input.items.length === 0) {
    throw new Error("A bill needs at least one item.");
  }

  const seenInventoryIds = new Set<number>();
  for (const item of input.items) {
    if (!Number.isInteger(item.inventory_id) || item.inventory_id <= 0) {
      throw new Error("Every item needs a valid inventory_id.");
    }
    if (!Number.isInteger(item.qty) || item.qty <= 0) {
      throw new Error("Every item's qty must be a positive integer.");
    }
    if (seenInventoryIds.has(item.inventory_id)) {
      throw new Error(`inventory_id ${item.inventory_id} appears more than once — merge quantities into a single line before submitting.`);
    }
    seenInventoryIds.add(item.inventory_id);
  }
  if (input.tax_total !== undefined && input.tax_total < 0) {
    throw new Error("tax_total cannot be negative.");
  }

  return AppDataSource.transaction(async (manager) => {
    const store = await manager.findOne(Store, { where: { store_id: input.store_id, is_active: true } });
    if (!store) {
      throw new Error("Store not found or inactive.");
    }

    const customer = await manager.findOne(Customer, { where: { customer_id: input.customer_id, is_active: true } });
    if (!customer) {
      throw new Error("Customer not found or inactive.");
    }

    const movementType = await getCode(manager, MovementType, "SALE", "Movement type");
    const referenceType = await getCode(manager, ReferenceType, "BILCRE", "Reference type");

    const { lineItems, subtotal } = await validateAndPriceCartItems(manager, input.store_id, input.items);

    let bill_discount_total = 0;
    let discount: Discount | null = null;
    if (input.discount_id) {
      discount = await manager.findOne(Discount, {
        where: { discount_id: input.discount_id },
        relations: ["discountType", "store"],
      });
      if (!discount) {
        throw new Error("Discount not found.");
      }
      if (discount.store.store_id !== input.store_id) {
        throw new Error("This discount does not belong to the selling store.");
      }
      // resolveDiscountAmount already checks is_active, date range, and
      // min_bill_amount, and handles PERCENT vs FLAT + the max_discount_amount
      // cap — nothing needs duplicating here.
      bill_discount_total = await resolveDiscountAmount(discount as Discount & { discountType: any }, subtotal);
    }

    const tax_total = round2(input.tax_total ?? 0);
    const rawGrandTotal = subtotal - bill_discount_total + tax_total;
    const grand_total = Math.round(rawGrandTotal);
    const rounding_adjustment = round2(grand_total - rawGrandTotal);

    if (grand_total < 0) {
      throw new Error("Grand total cannot be negative — check discount configuration.");
    }

    const invoice_number = await generateInvoiceNumber(manager, input.store_id);
    const now = new Date();

    const bill = manager.create(Bill, {
      invoice_number,
      store_id: input.store_id,
      customer_id: input.customer_id,
      discount_id: discount ? discount.discount_id : null,
      subtotal,
      bill_discount_total,
      tax_total,
      rounding_adjustment,
      grand_total,
      status: "COMPLETED",
      is_active: true,
      created_at: now,
      created_by: userId,
      updated_at: null,
      updated_by: null,
    });
    const savedBill = await manager.save(Bill, bill);

    await createBillItemRows(
      manager,
      savedBill.bill_id,
      input.store_id,
      lineItems,
      movementType.movement_type_id,
      referenceType.reference_type_id,
      userId,
      sessionId
    );

    await createAuditRecordService(manager, {
      tableName: "transactions_bill",
      recordId: savedBill.bill_id,
      actionTypeCode: "INSERT",
      userId,
      storeId: savedBill.store_id,
      sessionId,
    });

    return manager.findOne(Bill, {
      where: { bill_id: savedBill.bill_id },
      relations: ["billItems", "customer", "store", "discount"],
    });
  });
};

//=========================================================================
// delete (void) bill — only within 10 minutes of creation, restores stock
//=========================================================================
export const deleteBillService = async (bill_id: number, userId: number, sessionId: number) => {
  return AppDataSource.transaction(async (manager) => {
    const bill = await manager.findOne(Bill, { where: { bill_id }, relations: ["billItems"] });
    if (!bill) {
      throw new Error("Bill not found.");
    }
    if (bill.status === "VOID") {
      throw new Error("This bill has already been cancelled.");
    }
    if (bill.status !== "COMPLETED") {
      throw new Error(`Bill in status '${bill.status}' cannot be cancelled.`);
    }

    const ageMs = Date.now() - bill.created_at.getTime();
    if (ageMs > TEN_MINUTES_MS) {
      throw new Error("Bills can only be cancelled within 10 minutes of creation.");
    }

    const movementType = await getCode(manager, MovementType, "RESTOCK", "Movement type");
    const referenceType = await getCode(manager, ReferenceType, "BILDEL", "Reference type");

    const now = new Date();
    const sortedItems = [...bill.billItems].sort((a, b) => a.inventory_id - b.inventory_id);

    for (const item of sortedItems) {
      const inventory = await manager.findOne(Inventory, {
        where: { inventory_id: item.inventory_id },
        lock: { mode: "pessimistic_write" },
      });
      if (!inventory) {
        throw new Error(`Inventory ${item.inventory_id} not found.`);
      }

      inventory.qty += item.qty;
      inventory.updated_at = now;
      inventory.updated_by = userId;
      await manager.save(Inventory, inventory);

      await createAuditRecordService(manager, {
        tableName: "transactions_inventory",
        recordId: inventory.inventory_id,
        actionTypeCode: "UPDATE",
        userId,
        storeId: inventory.store_id,
        sessionId,
      });

      const stockMovement = manager.create(StockMovement, {
        inventory_id: item.inventory_id,
        movement_type_id: movementType.movement_type_id,
        reference_type_id: referenceType.reference_type_id,
        quantity_change: item.qty,
        reference_id: item.bill_item_id,
        is_active: true,
        created_at: now,
        created_by: userId,
        updated_at: now,
        updated_by: userId,
      });
      const savedMovement = await manager.save(StockMovement, stockMovement);

      await createAuditRecordService(manager, {
        tableName: "transactions_stock_movement",
        recordId: savedMovement.movement_id,
        actionTypeCode: "INSERT",
        userId,
        storeId: inventory.store_id,
        sessionId,
      });
    }

    bill.status = "VOID";
    bill.is_active = false;
    bill.updated_at = now;
    bill.updated_by = userId;
    const savedBill = await manager.save(Bill, bill);

    await createAuditRecordService(manager, {
      tableName: "transactions_bill",
      recordId: savedBill.bill_id,
      actionTypeCode: "DELETE",
      userId,
      storeId: savedBill.store_id,
      sessionId,
    });

    return savedBill;
  });
};

//=========================================================================
// single bill by id, with its items
//=========================================================================
export async function getBillById(storeId: number, billId: number) {
  const existingBill = await billRepo.findOne({
    where: { store_id: storeId, bill_id: billId, is_active: true },
    relations: ["billItems", "customer"],
  });

  if (!existingBill) {
    throw new Error("Bill not found.");
  }

  return existingBill;
}

//=========================================================================
// bill history — filterable by date, invoice number, customer phone
//=========================================================================
export async function getBillHistory(storeId: number, filters: BillHistoryFilters) {
  const qb = billRepo
    .createQueryBuilder("bill")
    .leftJoinAndSelect("bill.customer", "customer")
    .where("bill.store_id = :storeId", { storeId });

  if (filters.invoiceNumber) {
    qb.andWhere("bill.invoice_number LIKE :invoiceNumber", { invoiceNumber: `%${filters.invoiceNumber}%` });
  }

  if (filters.customerPhone) {
    qb.andWhere("customer.phone_no LIKE :phone", { phone: `%${filters.customerPhone}%` });
  }

  if (filters.date) {
    const start = new Date(filters.date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    qb.andWhere("bill.created_at >= :start AND bill.created_at < :end", { start, end });
  } else {
    if (filters.dateFrom) {
      qb.andWhere("bill.created_at >= :dateFrom", { dateFrom: new Date(filters.dateFrom) });
    }
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setDate(end.getDate() + 1);
      qb.andWhere("bill.created_at < :dateTo", { dateTo: end });
    }
  }

  qb.orderBy("bill.created_at", "DESC");

  return qb.getMany();
}