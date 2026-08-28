import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Unique
} from "typeorm";

import { Store } from "./TransactionsStore.js";
import { Customer } from "./TransactionsCustomer.js";
import { Discount } from "./TransactionsDiscount.js";
// import { BillItem } from "./TransactionsBillItem.js";

@Entity({ name: "transactions_bill" })
// @Unique(
//     "UQ_bill_store_id_invoice_number",
//     ["store_id", "invoice_number"]
// )
export class Bill {

    @PrimaryGeneratedColumn({
        name: "bill_id",
        type: "integer"
    })
    bill_id!: number;

    @Column({
        name: "invoice_number",
        type: "varchar",
        unique: true
    })
    invoice_number!: string;

    @Column({
        name: "store_id",
        type: "integer"
    })
    store_id!: number;

    @Column({
        name: "customer_id",
        type: "integer"
    })
    customer_id!: number;

    @Column({
        name: "discount_id",
        type: "integer"
    })
    discount_id!: number;

    @Column({
        name: "subtotal",
        type: "decimal",
        precision: 12,
        scale: 2
    })
    subtotal!: number;

    @Column({
        name: "bill_discount_total",
        type: "decimal",
        precision: 12,
        scale: 2,
        default: 0
    })
    bill_discount_total!: number;

    @Column({
        name: "tax_total",
        type: "decimal",
        precision: 12,
        scale: 2,
        default: 0
    })
    tax_total!: number;

    @Column({
        name: "rounding_adjustment",
        type: "decimal",
        precision: 12,
        scale: 2,
        default: 0
    })
    rounding_adjustment!: number;

    @Column({
        name: "grand_total",
        type: "decimal",
        precision: 12,
        scale: 2
    })
    grand_total!: number;

    @Column({
        name: "status",
        type: "varchar"
    })
    status!: string;

    @Column({
        name: "is_active",
        type: "boolean",
        default: true
    })
    is_active!: boolean;

    @Column({
        name: "created_at",
        type: "datetime"
    })
    created_at!: Date;

    @Column({
        name: "created_by",
        type: "integer",
        nullable: true
    })
    created_by!: number | null;

    @Column({
        name: "updated_at",
        type: "datetime",
        nullable: true
    })
    updated_at!: Date | null;

    @Column({
        name: "updated_by",
        type: "integer",
        nullable: true
    })
    updated_by!: number | null;

    @ManyToOne(
        () => Store,
        store => store.bills,
        {
            nullable: false
        }
    )
    @JoinColumn({
        name: "store_id",
        referencedColumnName: "store_id"
    })
    store!: Store;

    @ManyToOne(
        () => Customer,
        customer => customer.bills,
        {
            nullable: false
        }
    )
    @JoinColumn({
        name: "customer_id",
        referencedColumnName: "customer_id"
    })
    customer!: Customer;

    @ManyToOne(
        () => Discount,
        discount => discount.bills,
        {
            nullable: false
        }
    )
    @JoinColumn({
        name: "discount_id",
        referencedColumnName: "discount_id"
    })
    discount!: Discount;

//     @OneToMany(
//         () => BillItem,
//         billItem => billItem.bill
//     )
//     billItems!: BillItem[];


 }