import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    JoinColumn 
} from "typeorm"; 
 
//  import { Customer } from "./TransactionsCustomer.ts"; 
 
@Entity({name:"TransactionCustomer"}) 
export class Customer { 
 
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