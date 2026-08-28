import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    OneToOne,
    JoinColumn,
    Unique
} from "typeorm";

import { Product } from "./TransactionsProduct.js";
import { Store } from "./TransactionsStore.js";
import { DamagedGoods } from "./TransactionsDamagedGoods.js";
import { StockMovement } from "./TransactionsStockMovement.js";

@Entity({ name: "transactions_inventory" })
@Unique(
    "UQ_inventory_store_id_product_id",
    ["store_id", "product_id"]
)
export class Inventory {

    // Primary Key
    @PrimaryGeneratedColumn({
        name: "inventory_id",
        type: "integer"
    })
    inventory_id!: number;


    // Foreign Key → transactions_product.product_id
    @Column({
        name: "product_id",
        type: "integer",
        nullable: false
    })
    product_id!: number;


    // Foreign Key → transactions_store.store_id
    @Column({
        name: "store_id",
        type: "integer",
        nullable: false
    })
    store_id!: number;


    // Available quantity
    @Column({
        name: "qty",
        type: "integer",
        nullable: false,
        default: 0
    })
    qty!: number;


    // Cost price
    @Column({
        name: "cost_price",
        type: "decimal",
        precision: 12,
        scale: 2,
        nullable: true
    })
    cost_price!: number | null;


    // Selling price
    @Column({
        name: "selling_price",
        type: "decimal",
        precision: 12,
        scale: 2,
        nullable: false
    })
    selling_price!: number;


    // Active / inactive
    @Column({
        name: "is_active",
        type: "boolean",
        default: true,
        nullable: false
    })
    is_active!: boolean;


    // Created timestamp
    @Column({
        name: "created_at",
        type: "datetime",
        nullable: false
    })
    created_at!: Date;


    // Created by user
    @Column({
        name: "created_by",
        type: "integer",
        nullable: true
    })
    created_by!: number | null;


    // Updated timestamp
    @Column({
        name: "updated_at",
        type: "datetime",
        nullable: true
    })
    updated_at!: Date | null;


    // Updated by user
    @Column({
        name: "updated_by",
        type: "integer",
        nullable: true
    })
    updated_by!: number | null;


    // --------------------------------------------------
    // RELATIONSHIPS
    // --------------------------------------------------


    // One Product ↔ One Inventory
    @OneToOne(
        () => Product,
        product => product.inventory,
        {
            nullable: false
        }
    )
    @JoinColumn({
        name: "product_id",
        referencedColumnName: "product_id"
    })
    product!: Product;


    // Many Inventory records → One Store
    @ManyToOne(
        () => Store,
        store => store.inventory,
        {
            nullable: false
        }
    )
    @JoinColumn({
        name: "store_id",
        referencedColumnName: "store_id"
    })
    store!: Store;


    // One Inventory → Many Damaged Goods
    @OneToMany(
        () => DamagedGoods,
        damagedGoods => damagedGoods.inventory
    )
    damagedGoods!: DamagedGoods[];


    // One Inventory → Many Stock Movements
    @OneToMany(
        () => StockMovement,
        stockMovement => stockMovement.inventory
    )
    stockMovements!: StockMovement[];
}