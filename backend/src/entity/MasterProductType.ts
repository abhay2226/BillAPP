import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

import { Product } from "./TransactionsProduct.js";

@Entity({ name: "master_product_type" })
export class Type {

    @PrimaryGeneratedColumn({
        name: "product_type_id",
        type: "integer"
    })
    product_type_id!: number;

    @Column({
        name: "type_name",
        type: "varchar",
        unique: true
    })
    type_name!: string;

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
        (product) => product.type
    )
    products!: Product[];
}