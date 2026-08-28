import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";

import { User } from "./TransactionsUser.js";
import { Store } from "./TransactionsStore.js";
import { Session } from "./TransactionsSession.js";

@Entity({ name: "transactions_audit" })
export class Audit {

    @PrimaryGeneratedColumn({
        name: "audit_id",
        type: "integer"
    })
    audit_id!: number;

    @Column({
        name: "table_name",
        type: "varchar",
        nullable: false
    })
    table_name!: string;

    @Column({
        name: "record_id",
        type: "integer",
        nullable: false
    })
    record_id!: number;

    @Column({
        name: "action_type",
        type: "varchar",
        nullable: false
    })
    action_type!: string;

    @Column({
        name: "updated_by",
        type: "integer",
        nullable: false
    })
    updated_by!: number;

    @Column({
        name: "updated_at",
        type: "datetime",
        nullable: false
    })
    updated_at!: Date;

    @Column({
        name: "store_id",
        type: "integer",
        nullable: false
    })
    store_id!: number;

    @Column({
        name: "session_id",
        type: "integer",
        nullable: false
    })
    session_id!: number;

    @Column({
        name: "ip_address",
        type: "varchar",
        nullable: true
    })
    ip_address!: string | null;

    @Column({
        name: "is_active",
        type: "boolean",
        default: true
    })
    is_active!: boolean;


    // Audit -> User

    @ManyToOne(
        () => User,
        { nullable: false }
    )
    @JoinColumn({
        name: "updated_by",
        referencedColumnName: "user_id"
    })
    updatedByUser!: User;


    // Audit -> Store

    @ManyToOne(
        () => Store,
        { nullable: false }
    )
    @JoinColumn({
        name: "store_id",
        referencedColumnName: "store_id"
    })
    store!: Store;


    // Audit -> Session

    @ManyToOne(
        () => Session,
        { nullable: false }
    )
    @JoinColumn({
        name: "session_id",
        referencedColumnName: "session_id"
    })
    session!: Session;
}