import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

import { StockMovement } from "./TransactionsStockMovement.js";

@Entity({ name: "master_movement_type" })
export class MovementType {

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

    @Column({
        name: "created_at",
        type: "datetime",
        nullable: false
        
    })
    created_at!: Date;

    @Column({
        name: "created_by",
        type: "integer",
        nullable: false
    })
    created_by!: number ;

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
        () => StockMovement,
        (stockMovement) => stockMovement.movement_type_id
    )
    stockMovements!: StockMovement[];
}
