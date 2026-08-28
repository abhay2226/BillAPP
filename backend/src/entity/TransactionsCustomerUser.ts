// import {
//     Entity,
//     PrimaryGeneratedColumn,
//     Column,
//     ManyToOne,
//     JoinColumn,
//     Unique
// } from "typeorm";

// import { Customer } from "./TransactionsCustomer.js";
// import { User } from "./TransactionsUser.js";

// @Entity({ name: "transactions_customer_user" })
// @Unique(
//     "UQ_customer_user_customer_id_user_id",
//     ["customer_id", "user_id"]
// )
// export class CustomerUser {

//     @PrimaryGeneratedColumn({
//         name: "customer_user_id",
//         type: "integer"
//     })
//     customer_user_id!: number;

//     @Column({
//         name: "customer_id",
//         type: "integer"
//     })
//     customer_id!: number;

//     @Column({
//         name: "user_id",
//         type: "integer"
//     })
//     user_id!: number;

//     @Column({
//         name: "is_active",
//         type: "boolean",
//         default: true
//     })
//     is_active!: boolean;

//     @Column({
//         name: "created_at",
//         type: "datetime"
//     })
//     created_at!: Date;

//     @Column({
//         name: "created_by",
//         type: "integer",
//         nullable: true
//     })
//     created_by!: number | null;

//     // Customer relationship
//     @ManyToOne(
//         () => Customer,
//         customer => customer.customerUsers,
//         {
//             nullable: false
//         }
//     )
//     @JoinColumn({
//         name: "customer_id",
//         referencedColumnName: "customer_id"
//     })
//     customer!: Customer;

//     // User relationship
//     @ManyToOne(
//         () => User,
//         user => user.customerUsers,
//         {
//             nullable: false
//         }
//     )
//     @JoinColumn({
//         name: "user_id",
//         referencedColumnName: "user_id"
//     })
//     user!: User;
// }