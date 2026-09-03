import { AppDataSource } from "../datasource.js";

import { Role } from "../entity/MasterRole.js";
import { Store } from "../entity/TransactionsStore.js";
import { User } from "../entity/TransactionsUser.js";

import { Product } from "../entity/TransactionsProduct.js";
import { Inventory } from "../entity/TransactionsInventory.js";
import { Bill } from "../entity/TransactionsBill.js";
import { Discount } from "../entity/TransactionsDiscount.js";
import { StockMovement } from "../entity/TransactionsStockMovement.js";

const billRepo = AppDataSource.getRepository(Bill);
const userRepo = AppDataSource.getRepository(User);
const storeRepo = AppDataSource.getRepository(Store);
const discountRepo = AppDataSource.getRepository(Discount);
const inventoryRepo = AppDataSource.getRepository(Inventory);
const productRepo = AppDataSource.getRepository(Product);

export interface BillItemInput {
    product_id: number;
    quantity: number;
}
export interface BillsData{
    store_id:number;
    customer_id: number;
    discount_id?: number; 
    // discount_id?: number || null;
    items:BillItemInput[];
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
        }
        
    });

    if (!existingBill) {
         throw new Error("User not found."); 
    }

    return existingBill;
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

