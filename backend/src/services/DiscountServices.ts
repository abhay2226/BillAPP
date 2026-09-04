import { AppDataSource } from "../datasource.js";
import { Discount } from "../entity/TransactionsDiscount.js";
import { DiscountType } from "../entity/MasterDiscountType.js";
import { Store } from "../entity/TransactionsStore.js";
import { User } from "../entity/TransactionsUser.js";
// import { Audit } from "../entity/TransactionsAudit.js"; 

const discountRepo = AppDataSource.getRepository(Discount);
const discountTypeRepo = AppDataSource.getRepository(DiscountType);
const storeRepo = AppDataSource.getRepository(Store);
const userRepo = AppDataSource.getRepository(User);
// const auditRepo = AppDataSource.getRepository(Audit); 


export interface DiscountData{
  store_id: number;
  discount_name: string;
  discount_type_id: number;
  discount_value: number;
  min_bill_amount?: number;
  max_discount_amount?: number | null;
  discount_from: Date;
  discount_to?: Date | null;
  description?: string | null;
}

export async function createDiscount(data:DiscountData , storeId:number){
    
}