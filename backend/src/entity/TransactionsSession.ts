import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";

import { User } from "./TransactionsUser.js";
import { Store } from "./TransactionsStore.js";

@Entity({ name: "transactions_session" })
export class Session {

    @PrimaryGeneratedColumn({
        name: "session_id",
        type: "integer"
    })
    session_id!: number;


    @Column({
        name: "user_id",
        type: "integer",
        nullable: false
    })
    user_id!: number;


    @Column({
        name: "store_id",
        type: "integer",
        nullable: false
    })
    store_id!: number;


    @Column({
        name: "login_at",
        type: "datetime",
        nullable: false
    })
    login_at!: Date;


    @Column({
        name: "logout_at",
        type: "datetime",
        nullable: true
    })
    logout_at!: Date | null;


    @Column({
        name: "expires_at",
        type: "datetime",
        nullable: true
    })
    expires_at!: Date | null;


    @Column({
        name: "last_active_at",
        type: "datetime",
        nullable: true
    })
    last_active_at!: Date | null;


    @Column({
        name: "ip_address",
        type: "varchar",
        nullable: true
    })
    ip_address!: string | null;


    @Column({
        name: "device_type",
        type: "varchar",
        nullable: true
    })
    device_type!: string | null;


    @Column({
        name: "device_info",
        type: "varchar",
        nullable: true
    })
    device_info!: string | null;


    @Column({
        name: "status",
        type: "varchar",
        nullable: false
    })
    status!: string;


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


    // Many Sessions -> One User

    @ManyToOne(
        () => User,
        (user) => user.sessions,
        {
            nullable: false
        }
    )
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "user_id"
    })
    user!: User;


    // Many Sessions -> One Store

    @ManyToOne(
        () => Store,
        (store) => store.sessions,
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
        () => User,
        (user) => user.sessions,
        {
            nullable: false
        }
    )
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "user_id"
    })
    users!: User;
}