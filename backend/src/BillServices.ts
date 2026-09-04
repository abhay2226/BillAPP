import { AppDataSource } from "../datasource.js";
import { EntityManager } from "typeorm";
import { Bill } from "../entity/TransactionsBill.js";
import { BillItem } from "../entity/TransactionsBillItem.js";
import { Inventory } from "../entity/TransactionsInventory.js";
import { StockMovement } from "../entity/TransactionsStockMovement.js";
import { ReferenceType } from "../entity/MasterReference.js";
import { MovementType } from "../entity/MasterMovementType.js";
import { resolveDiscountForBillService } from "./DiscountServices.js";

const billRepository = AppDataSource.getRepository(Bill);

// Same lookup pattern used in DamagedGoods/Inventory services — resolves a
// master_reference_type row by its code inside the current transaction.
const getReferenceTypeId = async (
    entityManager: EntityManager,
    code: string
): Promise<number> => {
    const refType = await entityManager.findOne(ReferenceType, {
        where: { code, is_active: true }
    });
    if (!refType) {
        throw new Error(`Reference type with code '${code}' not found or inactive.`);
    }
    return refType.reference_type_id;
};

// Same idea, for master_movement_type.
const getMovementTypeId = async (
    entityManager: EntityManager,
    code: string
): Promise<number> => {
    const movementType = await entityManager.findOne(MovementType, {
        where: { code, is_active: true }
    });
    if (!movementType) {
        throw new Error(`Movement type with code '${code}' not found or inactive.`);
    }
    return movementType.movement_type_id;
};

// Placeholder numbering scheme — swap for whatever sequencing you land on
// (per-store counters, date-based series, etc.)
const generateInvoiceNumber = (storeId: number): string => {
    return `INV-${storeId}-${Date.now()}`;
};

export type BillItemInput = {
    inventoryId: number;
    qty: number;
};

export type CreateBillInput = {
    storeId: number;
    customerId: number;
    items: BillItemInput[];
    userId: number;
    discountId?: number;
    taxTotal?: number;
    roundingAdjustment?: number;
};

// CREATE BILL
// Locks every line's inventory row, prices it off the current selling_price,
// applies an optional bill-level discount, records the sale as stock
// movements, and persists the bill + its line items — all atomically.

export const createBillService = async (input: CreateBillInput) => {
    const {
        storeId,
        customerId,
        items,
        userId,
        discountId,
        taxTotal = 0,
        roundingAdjustment = 0
    } = input;

    if (!Number.isInteger(storeId) || storeId <= 0) {
        throw new Error("Valid store ID is required");
    }

    if (!Number.isInteger(customerId) || customerId <= 0) {
        throw new Error("Valid customer ID is required");
    }

    if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error("Valid user ID is required");
    }

    if (!items || items.length === 0) {
        throw new Error("A bill must contain at least one item");
    }

    for (const item of items) {
        if (!Number.isInteger(item.inventoryId) || item.inventoryId <= 0) {
            throw new Error("Valid inventory ID is required for every item");
        }
        if (!Number.isInteger(item.qty) || item.qty <= 0) {
            throw new Error("Quantity must be a positive integer for every item");
        }
    }

    if (!Number.isFinite(taxTotal) || taxTotal < 0) {
        throw new Error("Invalid tax total");
    }

    if (!Number.isFinite(roundingAdjustment)) {
        throw new Error("Invalid rounding adjustment");
    }

    return await AppDataSource.transaction(async (transactionalEntityManager) => {
        const referenceTypeId = await getReferenceTypeId(transactionalEntityManager, "BILCRE");
        const saleMovementTypeId = await getMovementTypeId(transactionalEntityManager, "SALE");
        const now = new Date();

        const lineItems: {
            inventoryId: number;
            qty: number;
            unitPrice: number;
            lineTotal: number;
        }[] = [];

        // Lock, validate and price every line before touching the Bill row
        for (const item of items) {
            const inventory = await transactionalEntityManager.findOne(Inventory, {
                where: { inventory_id: item.inventoryId },
                lock: { mode: "pessimistic_write" }
            });

            if (!inventory) {
                throw new Error(`Inventory record ${item.inventoryId} not found`);
            }

            if (!inventory.is_active) {
                throw new Error(`Inventory record ${item.inventoryId} is inactive`);
            }

            if (inventory.store_id !== storeId) {
                throw new Error(
                    `Inventory record ${item.inventoryId} does not belong to this store`
                );
            }

            if (inventory.qty < item.qty) {
                throw new Error(
                    `Insufficient stock for inventory ${item.inventoryId}. Available quantity: ${inventory.qty}`
                );
            }

            const unitPrice = inventory.selling_price;
            const lineTotal = Math.round(unitPrice * item.qty * 100) / 100;

            lineItems.push({
                inventoryId: item.inventoryId,
                qty: item.qty,
                unitPrice,
                lineTotal
            });

            inventory.qty -= item.qty;
            inventory.updated_at = now;
            inventory.updated_by = userId;
            await transactionalEntityManager.save(Inventory, inventory);
        }

        const subtotal = Math.round(
            lineItems.reduce((sum, li) => sum + li.lineTotal, 0) * 100
        ) / 100;

        let billDiscountTotal = 0;
        if (discountId !== undefined) {
            const { discountAmount } = await resolveDiscountForBillService(
                discountId,
                storeId,
                subtotal,
                transactionalEntityManager
            );
            billDiscountTotal = discountAmount;
        }

        const grandTotal = Math.round(
            (subtotal - billDiscountTotal + taxTotal + roundingAdjustment) * 100
        ) / 100;

        if (grandTotal < 0) {
            throw new Error(
                "Grand total cannot be negative — check discount, tax and rounding inputs"
            );
        }

        const bill = transactionalEntityManager.create(Bill, {
            invoice_number: generateInvoiceNumber(storeId),
            store_id: storeId,
            customer_id: customerId,
            // Needs Bill.discount_id marked nullable — see note alongside this file
            discount_id: discountId ?? null,
            subtotal,
            bill_discount_total: billDiscountTotal,
            tax_total: taxTotal,
            rounding_adjustment: roundingAdjustment,
            grand_total: grandTotal,
            status: "COMPLETED",
            is_active: true,
            created_at: now,
            created_by: userId,
            updated_at: null,
            updated_by: null
        });

        const savedBill = await transactionalEntityManager.save(Bill, bill);

        for (const li of lineItems) {
            const billItem = transactionalEntityManager.create(BillItem, {
                bill_id: savedBill.bill_id,
                inventory_id: li.inventoryId,
                qty: li.qty,
                unit_price: li.unitPrice,
                line_total: li.lineTotal,
                return_qty: 0,
                return_reason: null,
                refund_amount: 0,
                is_active: true,
                created_at: now,
                created_by: userId,
                updated_at: null,
                updated_by: null
            });

            const savedBillItem = await transactionalEntityManager.save(BillItem, billItem);

            const stockMovement = transactionalEntityManager.create(StockMovement, {
                inventory_id: li.inventoryId,
                movement_type_id: saleMovementTypeId,
                reference_type_id: referenceTypeId,
                reference_id: savedBillItem.bill_item_id,
                quantity_change: -li.qty,
                is_active: true,
                created_at: now,
                created_by: userId,
                updated_at: now,
                updated_by: userId
            });

            await transactionalEntityManager.save(StockMovement, stockMovement);
        }

        return savedBill;
    });
};

// GET BILL BY ID

export const getBillByIdService = async (billId: number) => {
    return await billRepository.findOne({
        where: { bill_id: billId },
        relations: [
            "store",
            "customer",
            "discount",
            "billItems",
            "billItems.inventory",
            "billItems.inventory.product"
        ]
    });
};

// GET ALL BILLS (optionally scoped to a store)

export const getAllBillsService = async (storeId?: number) => {
    return await billRepository.find({
        where: storeId ? { store_id: storeId, is_active: true } : { is_active: true },
        relations: ["store", "customer", "discount"],
        order: { bill_id: "DESC" }
    });
};

// VOID BILL
// Reverses stock for every unreturned line and marks the bill inactive.
// Only restocks qty that hasn't already come back through a separate
// return flow (return_qty), so it can't double-credit inventory.

export const voidBillService = async (billId: number, userId: number) => {
    if (!Number.isInteger(billId) || billId <= 0) {
        throw new Error("Valid bill ID is required");
    }

    if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error("Valid user ID is required");
    }

    return await AppDataSource.transaction(async (transactionalEntityManager) => {
        const bill = await transactionalEntityManager.findOne(Bill, {
            where: { bill_id: billId, is_active: true }
        });

        if (!bill) {
            throw new Error("Bill not found or already void");
        }

        const billItems = await transactionalEntityManager.find(BillItem, {
            where: { bill_id: billId, is_active: true }
        });

        const referenceTypeId = await getReferenceTypeId(transactionalEntityManager, "BILDEL");
        const restockMovementTypeId = await getMovementTypeId(transactionalEntityManager, "RESTOCK");
        const now = new Date();

        for (const billItem of billItems) {
            const restoreQty = billItem.qty - billItem.return_qty;
            if (restoreQty <= 0) {
                continue;
            }

            const inventory = await transactionalEntityManager.findOne(Inventory, {
                where: { inventory_id: billItem.inventory_id },
                lock: { mode: "pessimistic_write" }
            });

            if (!inventory) {
                throw new Error(`Inventory record ${billItem.inventory_id} not found`);
            }

            inventory.qty += restoreQty;
            inventory.updated_at = now;
            inventory.updated_by = userId;
            await transactionalEntityManager.save(Inventory, inventory);

            const stockMovement = transactionalEntityManager.create(StockMovement, {
                inventory_id: billItem.inventory_id,
                movement_type_id: restockMovementTypeId,
                reference_type_id: referenceTypeId,
                reference_id: billItem.bill_item_id,
                quantity_change: restoreQty,
                is_active: true,
                created_at: now,
                created_by: userId,
                updated_at: now,
                updated_by: userId
            });

            await transactionalEntityManager.save(StockMovement, stockMovement);
        }

        bill.is_active = false;
        bill.status = "VOIDED";
        bill.updated_at = now;
        bill.updated_by = userId;

        return await transactionalEntityManager.save(Bill, bill);
    });
};
