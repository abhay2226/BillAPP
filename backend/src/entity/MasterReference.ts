import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

import { StockMovement } from "./TransactionsStockMovement.js";

@Entity({ name: "master_reference_type" })
export class ReferenceType {

    @PrimaryGeneratedColumn({
        name: "reference_type_id",
        type: "integer"
    })
    reference_type_id!: number;

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
        name: "updated_at",
        type: "datetime",
        nullable: true
    })
    updated_at!: Date | null;

    @OneToMany(
        () => StockMovement,
        (stockMovement) => stockMovement.referenceType
    )
    stockMovements!: StockMovement[];
}