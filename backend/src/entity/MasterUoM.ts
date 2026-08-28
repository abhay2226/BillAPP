import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

import { Product } from "./TransactionsProduct.js";

@Entity({ name: "master_uom" })
export class UoM {

    @PrimaryGeneratedColumn({
        name: "unit_id",
        type: "integer"
    })
    unit_id!: number;

    @Column({
        name: "unit_name",
        type: "varchar",
        unique: true
    })
    unit_name!: string;

    @Column({
        name: "unit_type",
        type: "varchar",
        unique: true
    })
    unit_type!: string;

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
        () => Product,
        (product) => product.uom
    )
    products!: Product[];
}