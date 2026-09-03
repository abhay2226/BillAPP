import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";

import { Inventory } from "./TransactionsInventory.js";


@Entity({ name: "transactions_damaged_goods" })
export class DamagedGoods {

    @PrimaryGeneratedColumn({
        name: "damage_id",
        type: "integer"
    })
    damage_id!: number;


    @Column({
        name: "inventory_id",
        type: "integer"
    })
    inventory_id!: number;


    @Column({
        name: "qty",
        type: "integer"
    })
    qty!: number;


    @Column({
        name: "reason",
        type: "varchar",
        nullable: true
    })
    reason!: string | null;


    @Column({
        name: "unit_cost",
        type: "decimal",
        precision: 12,
        scale: 2
    })
    unit_cost!: number;


    @Column({
        name: "loss_value",
        type: "decimal",
        precision: 12,
        scale: 2
    })
    loss_value!: number;


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


    // UPDATED AT

    @Column({
        name: "updated_at",
        type: "datetime",
        nullable: true
    })
    updated_at!: Date | null;


    // UPDATED BY

    @Column({
        name: "updated_by",
        type: "integer",
        nullable: true
    })
    updated_by!: number | null;


    @ManyToOne(
        () => Inventory,
        inventory => inventory.damagedGoods,
        {
            nullable: false
        }
    )
    @JoinColumn({
        name: "inventory_id",
        referencedColumnName: "inventory_id"
    })
    inventory!: Inventory;
}