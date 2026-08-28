import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

import { TransactionsStockMovement } from "./TransactionsStockMovement.js";

@Entity({ name: "master_movement_type" })
export class MasterMovementType {

    @PrimaryGeneratedColumn({
        name: "movement_type_id",
        type: "integer"
    })
    movement_type_id!: number;

    @Column({
        name: "code",
        type: "varchar",
        unique: true
    })
    code!: string;

    @Column({
        name: "description",
        type: "varchar",
        nullable: true
    })
    description!: string | null;

    @Column({
        name: "is_active",
        type: "boolean",
        default: true
    })
    is_active!: boolean;

    @OneToMany(
        () => TransactionsStockMovement,
        stockMovement => stockMovement.movementType
    )
    stockMovements!: TransactionsStockMovement[];
}