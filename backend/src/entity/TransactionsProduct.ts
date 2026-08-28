import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn
} from "typeorm";

import { Store } from "./TransactionsStore.js";
import { Type } from "./MasterProductType.js";
import { Brand } from "./MasterProductBrand.js";
import { Uom } from "./MasterUom.js";
import { Inventory } from "./TransactionsInventory.js";
// import { BillItem } from "./TransactionsBillItem.js";

@Entity({ name: "transactions_product" })
export class Product {

    @PrimaryGeneratedColumn({
        name: "product_id",
        type: "integer"
    })
    product_id!: number;

    @Column({
        name: "store_id",
        type: "integer"
    })
    store_id!: number;

    @Column({
        name: "product_name",
        type: "varchar"
    })
    product_name!: string;

    @Column({
        name: "type_id",
        type: "integer"
    })
    type_id!: number;

    @Column({
        name: "brand_id",
        type: "integer"
    })
    brand_id!: number;

    @Column({
        name: "unit_id",
        type: "integer"
    })
    unit_id!: number;

    @Column({
        name: "unit_quantity",
        type: "decimal",
        precision: 10,
        scale: 3
    })
    unit_quantity!: number;

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
        () => Store,
        store => store.product,
        {
            nullable: false
        }
    )
    @JoinColumn({
        name: "store_id",
        referencedColumnName: "store_id"
    })
    store!: Store;

    @ManyToOne(
        () => Type,
        type => type.products,
        {
            nullable: false
        }
    )
    @JoinColumn({
        name: "type_id",
        referencedColumnName: "type_id"
    })
    type!: Type;

    @ManyToOne(
        () => Brand,
        (brand : Brand) => brand.products,
        {
            nullable: false
        }
    )
    @JoinColumn({
        name: "brand_id",
        referencedColumnName: "brand_id"
    })
    brand!: Brand;

    @ManyToOne(
        () => Uom,
        uom => uom.products,
        {
            nullable: false
        }
    )
    @JoinColumn({
        name: "unit_id",
        referencedColumnName: "unit_id"
    })
    uom!: Uom;

    @OneToMany(
        () => Inventory,
        inventory => inventory.product
    )
    inventory!: Inventory[];

//     @OneToMany(
//         () => BillItem,
//         billItem => billItem.product
//     )
//     billItems!: BillItem[];
}