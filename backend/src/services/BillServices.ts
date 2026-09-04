import { AppDataSource } from "../datasource.js";


import { BillItem } from "../entity/TransactionsBillItem.js";
import { Customer } from "../entity/TransactionsCustomer.js";
import { MovementType } from "../entity/MasterMovementType.js";
import { ReferenceType } from "../entity/MasterReference.js";
import { Role } from "../entity/MasterRole.js";
import { Store } from "../entity/TransactionsStore.js";
import { User } from "../entity/TransactionsUser.js";
import { Product } from "../entity/TransactionsProduct.js";
import { Inventory } from "../entity/TransactionsInventory.js";
import { Bill } from "../entity/TransactionsBill.js";
import { Discount } from "../entity/TransactionsDiscount.js";
import { StockMovement } from "../entity/TransactionsStockMovement.js";

import { resolveDiscountAmount } from "./DiscountServices.js";

const billRepo = AppDataSource.getRepository(Bill);
const userRepo = AppDataSource.getRepository(User);
const storeRepo = AppDataSource.getRepository(Store);
const discountRepo = AppDataSource.getRepository(Discount);
const inventoryRepo = AppDataSource.getRepository(Inventory);
const productRepo = AppDataSource.getRepository(Product);



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

export async function getBills(storeId: number){
    const existingBills = await billRepo.find({
        where:{
            store_id:storeId,
            is_active: true
        },
        order:{
            bill_id:"ASC"
        },
    });

    return existingBills;
}

export async function getBillById(storeId:number,billId:number) {
    const existingBill = await billRepo.findOne({ 
        where: { 
            store_id:storeId,
            bill_id: billId,
            is_active:true
        },
        relations: ["billItems"],
        order: { created_at: "DESC" }
        
    });

    if (!existingBill) {
         throw new Error("User not found."); 
    }

    return existingBill;
}

export const getBillsByStoreService = async (store_id: number) => {
  return await billRepo.find({
    where: { store_id },
    relations: ["billItems"],
    order: { created_at: "DESC" }
  });
};

export async function getBillByDate(){

}

export async function createBill() {
// Core function: validate store and customer are active.
// Loop through items:
// Check inventory availability.
// Reduce stock.
// Log stock movement.
// Calculate line totals.
// Apply discount if provided.
// Calculate subtotal, tax, rounding, grand total.
// Save bill header.
// Return saved bill.
}

export async function deleteBill() {
// Core function: validate store and customer are active.
// check if the exiting bill 
// check if created time is not 5 mins from delete call
// access the stockmovements for each inventory deductions related to this bill
// then access inventory to make changes 
// check if discount was applied are not 
// Calculate subtotal,discount if any, tax, rounding, grand total.
// give alert to pay back the total amount
// deactivate bill
}

export async function getProductAvailability(){
    
}
export async function getProductsPrice(){

}

export async function calculateSubtotal() {
    
}

export async function calculateDiscountAmount() {
    
}

export async function calculateTaxAmount() {
    
}

export async function calculateRoundingAdj() {
    
}

export async function calculateGrandTotal() {
    
}







// Same lookup-by-code helper pattern used in the damaged goods service.
const getCode = async (
  manager: any,
  entityClass: any,
  code: string,
  label: string
) => {
  const row = await manager.findOne(entityClass, {
    where: { code, is_active: true }
  });
  if (!row) {
    throw new Error(`${label} with code '${code}' not found or inactive.`);
  }
  return row;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

const generateInvoiceNumber = async (
  manager: any,
  store_id: number
) => {
  const today = new Date();
  const datePart = `${today.getFullYear()}${String(
    today.getMonth() + 1
  ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const seq = await manager
    .createQueryBuilder(Bill, "bill")
    .where("bill.store_id = :store_id", { store_id })
    .andWhere("bill.created_at >= :startOfDay", { startOfDay })
    .getCount();

  return `INV-${store_id}-${datePart}-${String(seq + 1).padStart(4, "0")}`;
};

// ======================================================
// CREATE BILL
// ======================================================
export const createBillService = async (
  input: CreateBillInput,
  userId: number
) => {
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
      throw new Error(
        `inventory_id ${item.inventory_id} appears more than once — merge quantities into a single line before submitting.`
      );
    }
    seenInventoryIds.add(item.inventory_id);
  }
  if (input.tax_total !== undefined && input.tax_total < 0) {
    throw new Error("tax_total cannot be negative.");
  }

  return await AppDataSource.transaction(async (manager) => {
    const store = await manager.findOne(Store, {
      where: { store_id: input.store_id, is_active: true }
    });
    if (!store) {
      throw new Error("Store not found or inactive.");
    }

    const customer = await manager.findOne(Customer, {
      where: { customer_id: input.customer_id, is_active: true }
    });
    if (!customer) {
      throw new Error("Customer not found or inactive.");
    }

    const movementType = await getCode(
      manager,
      MovementType,
      "SALE",
      "Movement type"
    );
    const referenceType = await getCode(
      manager,
      ReferenceType,
      "BILCRE",
      "Reference type"
    );

    
    const sortedItems = [...input.items].sort(
      (a, b) => a.inventory_id - b.inventory_id
    );

    const lineItems: {
      inventory: Inventory;
      qty: number;
      unit_price: number;
      line_total: number;
    }[] = [];

    let subtotal = 0;

    for (const item of sortedItems) {
      const inventory = await manager.findOne(Inventory, {
        where: { inventory_id: item.inventory_id },
        relations: ["product"],
        lock: { mode: "pessimistic_write" }
      });
      if (!inventory) {
        throw new Error(`Inventory ${item.inventory_id} not found.`);
      }
      if (!inventory.is_active) {
        throw new Error(
          `Inventory ${item.inventory_id} (${inventory.product?.product_name ?? ""}) is inactive.`
        );
      }
      if (inventory.store_id !== input.store_id) {
        throw new Error(
          `Inventory ${item.inventory_id} does not belong to store ${input.store_id}.`
        );
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

    let bill_discount_total = 0;
    let discount: Discount | null = null;
    if (input.discount_id) {
      discount = await manager.findOne(Discount, {
        where: { discount_id: input.discount_id },
        // NOTE: on your Discount entity, the "store_id" property is
        // actually the ManyToOne relation object (typed Store), not a
        // plain number — same naming pattern as discount_type_id. It
        // has to be loaded as a relation to be checked.
        relations: ["discountType", "store"]
      });
      if (!discount) {
        throw new Error("Discount not found.");
      }
      if (discount.store_id !== input.store_id) {
        throw new Error("This discount does not belong to the selling store.");
      }
      bill_discount_total = await resolveDiscountAmount(
        discount ,
        subtotal
      );
    }

    // ---- Tax & rounding ----
    const tax_total = round2(input.tax_total ?? 0);
    const rawGrandTotal = subtotal - bill_discount_total + tax_total;
    const grand_total = Math.round(rawGrandTotal); // round to nearest whole currency unit
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
      discount_id: discount? discount.discount_id :null,
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
      updated_by: null
    });
    const savedBill = await manager.save(Bill, bill);

    for (const line of lineItems) {
      const billItem = manager.create(BillItem, {
        bill_id: savedBill.bill_id,
        inventory_id: line.inventory.inventory_id,
        product_name_snapshot: line.inventory.product?.product_name ?? "",
        qty: line.qty,
        unit_price: line.unit_price,
        line_total: line.line_total,
        is_active: true,
        created_at: now,
        created_by: userId,
        updated_at: null,
        updated_by: null
      });
      const savedBillItem = await manager.save(BillItem, billItem);

      line.inventory.qty -= line.qty;
      line.inventory.updated_at = now;
      line.inventory.updated_by = userId;
      await manager.save(Inventory, line.inventory);

      const stockMovement = manager.create(StockMovement, {
        inventory_id: line.inventory.inventory_id,
        movement_type_id: movementType.movement_type_id,
        reference_type_id: referenceType.reference_type_id,
        quantity_change: -line.qty,
        reference_id: savedBillItem.bill_item_id,
        is_active: true,
        created_at: now,
        created_by: userId,
        updated_at: now,
        updated_by: userId
      });
      await manager.save(StockMovement, stockMovement);
    }

    return await manager.findOne(Bill, {
      where: { bill_id: savedBill.bill_id },
      relations: ["billItems", "customer", "store", "discount"]
    });
  });
};

// ======================================================
// VOID BILL
// NOT a refund/return. Only reverses a bill that was just
// created in error — restores stock exactly, marks the bill
// VOID, and stops there. No partial-item voids, no reasoning
// about used/damaged goods, no time-window leniency baked in
// here (add that check in the controller if you want one,
// e.g. "only within 15 minutes of created_at").
// ======================================================
export const voidBillService = async (
  bill_id: number,
  userId: number
) => {
  return await AppDataSource.transaction(async (manager) => {
    const bill = await manager.findOne(Bill, {
      where: { bill_id },
      relations: ["billItems"]
    });
    if (!bill) {
      throw new Error("Bill not found.");
    }
    if (bill.status === "VOID") {
      throw new Error("This bill has already been voided.");
    }
    if (bill.status !== "COMPLETED") {
      throw new Error(`Bill in status '${bill.status}' cannot be voided.`);
    }

    const movementType = await getCode(
      manager,
      MovementType,
      "RESTOCK",
      "Movement type"
    );
    const referenceType = await getCode(
      manager,
      ReferenceType,
      "BILDEL",
      "Reference type"
    );

    const now = new Date();
    const sortedItems = [...bill.billItems].sort(
      (a, b) => a.inventory_id - b.inventory_id
    );

    for (const item of sortedItems) {
      const inventory = await manager.findOne(Inventory, {
        where: { inventory_id: item.inventory_id },
        lock: { mode: "pessimistic_write" }
      });
      if (!inventory) {
        throw new Error(`Inventory ${item.inventory_id} not found.`);
      }

      inventory.qty += item.qty;
      inventory.updated_at = now;
      inventory.updated_by = userId;
      await manager.save(Inventory, inventory);

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
        updated_by: userId
      });
      await manager.save(StockMovement, stockMovement);
    }

    bill.status = "VOID";
    bill.is_active = false;
    bill.updated_at = now;
    bill.updated_by = userId;
    return await manager.save(Bill, bill);
  });
};

// ======================================================
// READ HELPERS
// ======================================================



