import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    JoinColumn 
} from "typeorm"; 
 
// import { Customer } from "./TransactionsCustomer.js"; 
 
@Entity({name:"TransactionCustomer"}) 
export class CustomerUser { 
 
    @PrimaryGeneratedColumn({ 
        name: "customer_user_id" 
    }) 
    customer_user_id!: number; 
 
    @Column({ 
        name: "customer_id", 
        type: "integer" 
    }) 
    customer_id!: number; 
 
    @Column({ 
        name: "user_id", 
        type: "integer" 
    }) 
    user_id!: number; 
 
    @Column({ 
        name: "is_active", 
        type: "boolean", 
        default: true 
    }) 
    is_active!: boolean; 
 
    
}