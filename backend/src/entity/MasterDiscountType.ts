import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

import { Discount } from "./TransactionsDiscount.js"

@Entity({name:"MasterDiscountType"})

export class DiscountType{
    @PrimaryGeneratedColumn({name:"discount_type_id"})
    discount_type_id!: number;

    @Column({
        name: "code",
        type: "varchar",
        unique: true
    })
    code!: string;

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


    @OneToMany(() => Discount, (discount) => discount.discount_type_id)
    discounts!: Discount[];

}