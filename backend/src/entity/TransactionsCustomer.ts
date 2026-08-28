import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

import { Bill } from "./TransactionsBill.js";

@Entity({ name: "transactions_customer" })
export class Customer {

    @PrimaryGeneratedColumn({
        name: "customer_id",
        type: "integer"
    })
    customer_id!: number;

    @Column({
        name: "phone_no",
        type: "varchar",
        nullable: true,
    })
    phone_no!: string | null;

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

    @OneToMany(
        () => Bill,
        bill => bill.customer
    )
    bills!: Bill[];
}