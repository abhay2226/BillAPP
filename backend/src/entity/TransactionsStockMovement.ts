import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";

import { Inventory } from "./TransactionsInventory.js";
import { MovementType } from "./MasterMovementType.js";


@Entity({ name: "transactions_stock_movement" })
export class StockMovement {

    @PrimaryGeneratedColumn({
        name: "movement_id",
        type: "integer"
    })
    movement_id!: number;


    @Column({
        name: "inventory_id",
        type: "integer"
    })
    inventory_id!: number;


    @Column({
        name: "movement_type_id",
        type: "integer"
    })
    movement_type_id!: number;


    @Column({
        name: "quantity_change",
        type: "integer"
    })
    quantity_change!: number;


    @Column({
        name: "reference_type",
        type: "varchar",
        nullable: true
    })
    reference_type!: string | null;


    @Column({
        name: "reference_id",
        type: "integer",
        nullable: true
    })
    reference_id!: number | null;


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
        inventory => inventory.stockMovements,
        {
            nullable: false
        }
    )
    @JoinColumn({
        name: "inventory_id",
        referencedColumnName: "inventory_id"
    })
    inventory!: Inventory;


    @ManyToOne(
        () => MovementType,
        movementType => movementType.stockMovements,
        {
            nullable: false
        }
    )
    @JoinColumn({
        name: "movement_type_id",
        referencedColumnName: "movement_type_id"
    })
    movementType!: MovementType;
}