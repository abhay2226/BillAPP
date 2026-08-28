import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
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

    @PrimaryGeneratedColumn({
        name: "inventory_id",
        type: "integer"
    })
    inventory_id!: number;

    @Column({
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
        name: "qty",
        type: "integer",
        default: 0
    })
    qty!: number;

    @Column({
        name: "cost_price",
        type: "decimal",
        precision: 12,
        scale: 2,
        nullable: true
    })
    cost_price!: number | null;

    @Column({
        name: "selling_price",
        type: "decimal",
        precision: 12,
        scale: 2
    })
    selling_price!: number;

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

    @OneToMany(
        () => DamagedGoods,
        damagedGoods => damagedGoods.inventory
    )
    damagedGoods!: DamagedGoods[];

    @OneToMany(
        () => StockMovement,
        stockMovement => stockMovement.inventory
    )
    stockMovements!: StockMovement[];
}