import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

import { Session } from "./TransactionsSession.js";
import { User } from "./TransactionsUser.js";
import { Discount } from "./TransactionsDiscount.js";
import { Bill } from "./TransactionsBill.js";
import { Inventory } from "./TransactionsInventory.js";
import { Product } from "./TransactionsProduct.js"

@Entity({ name: "transactions_store" })
export class Store {

    @PrimaryGeneratedColumn({
        name: "store_id",
        type: "integer"
    })
    store_id!: number;

    @Column({
        name: "gst_no",
        type: "varchar",
        unique: true,
        nullable: true
    })
    gst_no!: string | null;

    @Column({
        name: "store_name",
        type: "varchar"
    })
    store_name!: string;

    @Column({
        name: "location",
        type: "varchar",
        nullable: true
    })
    location!: string | null;

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


    // One Store -> Many Discounts

    @OneToMany(
        () => User,
        (user) => user.store
    )
    users!: User[];

    @OneToMany(
        () => Discount,
        (discount) => discount.store_id
    )
    discounts!: Discount[];


    // One Store -> Many Sessions

    @OneToMany(
        () => Session,
        (session) => session.store
    )
    sessions!: Session[];


    // One Store -> Many Bills

    @OneToMany(
        () => Bill,
        (bill) => bill.store
    )
    bills!: Bill[];

    @OneToMany(
        () => Product ,(product) => product.store
    )
    products!: Product[];


    // One Store -> Many Inventory records

    @OneToMany(
        () => Inventory,
        (inventory) => inventory.store
    )
    inventory!: Inventory[];
}