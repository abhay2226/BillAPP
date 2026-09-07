
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

import { Product } from "./TransactionsProduct.js";


@Entity({
    name: "master_uom"
})
export class UoM {

    // ======================================================
    // UNIT ID
    // ======================================================

    @PrimaryGeneratedColumn({
        name: "unit_id",
        type: "integer"
    })
    unit_id!: number;


    // ======================================================
    // UNIT NAME
    // Example: PCS, KG, L, BOX
    // ======================================================

    @Column({
        name: "unit_name",
        type: "varchar",
        unique: true
    })
    unit_name!: string;


    // ======================================================
    // UNIT TYPE
    // Example: COUNT, WEIGHT, VOLUME, PACKAGING
    // ======================================================

    @Column({
        name: "unit_type",
        type: "varchar"
    })
    unit_type!: string;


    // ======================================================
    // ACTIVE STATUS
    // ======================================================

    @Column({
        name: "is_active",
        type: "boolean",
        default: true
    })
    is_active!: boolean;


    // ======================================================
    // CREATED AT
    // ======================================================

    @Column({
        name: "created_at",
        type: "datetime",
        nullable: false
    })
    created_at!: Date;


    // ======================================================
    // CREATED BY
    // NULL ALLOWED FOR SYSTEM / SEEDED DATA
    // ======================================================

    @Column({
        name: "created_by",
        type: "integer",
        nullable: true
    })
    created_by!: number | null;


    // ======================================================
    // UPDATED AT
    // ======================================================

    @Column({
        name: "updated_at",
        type: "datetime",
        nullable: true
    })
    updated_at!: Date | null;


    // ======================================================
    // UPDATED BY
    // ======================================================

    @Column({
        name: "updated_by",
        type: "integer",
        nullable: true
    })
    updated_by!: number | null;


    // ======================================================
    // PRODUCT RELATION
    // ======================================================

    @OneToMany(
        () => Product,
        (product) => product.uom
    )
    products!: Product[];
}

