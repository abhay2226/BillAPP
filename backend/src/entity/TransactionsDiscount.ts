import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn
} from "typeorm";

import { DiscountType } from "./MasterDiscountType.js"
import { Bill } from "./TransactionsBill.js"
import { Store } from "./TransactionsStore.js"

@Entity({name:"transaction_Discount"})

export class Discount{
    @PrimaryGeneratedColumn({name:"discount_id"})
    discount_id!: number;
    
    @Column({
        name:"discount_name",
        type: "varchar",
        nullable: false
    })
    discount_name!: string;

    @Column({
        name: "discount_value",
        type: "decimal",
        precision: 12,
        scale: 2,
        nullable: false
    })
    discount_value!: number;

    @Column({
        name: "min_bill_amount",
        type: "decimal",
        precision: 12,
        scale: 2,
        nullable: false
    })
    min_bill_amount!: number;

    @Column({
        name: "max_discount_amount",
        type: "decimal",
        precision: 12,
        scale: 2,
        nullable: false
    })
    max_discount_amount!: number;

    @Column({
        name: "discount_from",
        type: "datetime",
        nullable: false
    })
    discount_from!: Date;

    @Column({
        name: "discount_to",
        type: "datetime",
        nullable: true
    })
    discount_to!: Date;    

    @Column({
        name:"description",
        type:"varchar",
    })
    description!: string;

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

    @OneToMany(() => Bill, (bill:Bill) => bill.discount)
    bills!: Bill[];

    @ManyToOne(() => Store,(store) => store.discounts)
    @JoinColumn({name:"store_id",
        referencedColumnName:"store_id"
    })
    store_id!: Store;

    @ManyToOne(() => DiscountType,(discountType) => discountType.discounts)
    @JoinColumn({name:"discount_type_id",
        referencedColumnName:"discount_type_id"
    })
    discount_type_id!: DiscountType;

}