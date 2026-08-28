import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany
} from "typeorm";

import { User } from "./TransactionsUser.js";
import { Session } from "./TransactionsSession.js";
import { Discount } from "./TransactionsDiscount.js";
import { Bill } from "./TransactionsBill.js"

@Entity({ name: "transaction_store" })
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
        name: "owner_user_id",
        type: "integer"
    })
    owner_user_id!: number;

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


    // Relationship:
    // store.owner_user_id -> user.user_id

    @ManyToOne(
        () => User,
        {
            nullable: false
        }
    )
    @JoinColumn({
        name: "owner_user_id",
        referencedColumnName: "user_id"
    })
    owner!: User;


    // Relationship:
    // One Store -> Many Sessions

    @OneToMany(
        () => Discount,
        (discount) => discount.store_id
    )
    discounts!: Discount[];

    @OneToMany(
        () => Session,
        (session: Session) => session.store
    )
    sessions!: Session[];

    @OneToMany(
        () => Bill ,(bill) => bill.store
    )
    bills!: Bill[];

    
}