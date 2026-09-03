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
    
}

export async function deleteBill() {
    
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

