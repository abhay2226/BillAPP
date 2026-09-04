import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { Bill } from "./TransactionsBill.js";
import { Inventory } from "./TransactionsInventory.js";

@Entity({ name: "transactions_bill_item" })
export class BillItem {
    @PrimaryGeneratedColumn({
        name: "bill_item_id",
        type: "integer"
    })
    bill_item_id!: number;

    @Column({
        name: "bill_id",
        type: "integer"
    })
    bill_id!: number;

    @Column({
        name: "inventory_id",
        type: "integer"
    })
    inventory_id!: number;

    // Qty sold, frozen at time of sale
    @Column({
        name: "qty",
        type: "integer"
    })
    qty!: number;

    // Unit price frozen at time of sale (inventory.selling_price can change later)
    @Column({
        name: "unit_price",
        type: "decimal",
        precision: 12,
        scale: 2
    })
    unit_price!: number;

    @Column({
        name: "line_total",
        type: "decimal",
        precision: 12,
        scale: 2
    })
    line_total!: number;

    // Cumulative fields for partial returns against this line
    @Column({
        name: "return_qty",
        type: "integer",
        default: 0
    })
    return_qty!: number;

    @Column({
        name: "return_reason",
        type: "varchar",
        nullable: true
    })
    return_reason!: string | null;

    @Column({
        name: "refund_amount",
        type: "decimal",
        precision: 12,
        scale: 2,
        default: 0
    })
    refund_amount!: number;

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
        () => Bill,
        bill => bill.billItems,
        { nullable: false, onDelete: "CASCADE" }
    )
    @JoinColumn({
        name: "bill_id",
        referencedColumnName: "bill_id"
    })
    bill!: Bill;

    @ManyToOne(
        () => Inventory,
        { nullable: false }
    )
    @JoinColumn({
        name: "inventory_id",
        referencedColumnName: "inventory_id"
    })
    inventory!: Inventory;
}
