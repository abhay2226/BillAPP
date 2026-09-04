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
import { ActionType } from "./MasterActionType.js";

@Entity({ name: "transactions_audit" })
export class Audit {

    // ======================================================
    // PRIMARY KEY
    // ======================================================

    @PrimaryGeneratedColumn()
    audit_id!: number;


    // ======================================================
    // TABLE NAME
    // ======================================================

    @Column({
        type: "varchar",
        length: 100
    })
    table_name!: string;


    // ======================================================
    // RECORD ID
    // ======================================================

    @Column({
        type: "integer"
    })
    record_id!: number;


    // ======================================================
    // ACTION TYPE
    // ======================================================

     @Column({
        type: "integer",
        name: "action_type_id"
    })
    action_type_id!: number;
    
    @ManyToOne(
        () => ActionType,
        {
            nullable: false
        }
    )
    @JoinColumn({
        name: "action_type_id"
    })
    action_type!: ActionType;


   


    // ======================================================
    // UPDATED BY
    // ======================================================

    // @ManyToOne(
    //     () => User,
    //     {
    //         nullable: true
    //     }
    // )
    // @JoinColumn({
    //     name: "updated_by"
    // })
    // updated_by_user!: User;


    // @Column({
    //     type: "integer",
    //     nullable: true
    // })
    // updated_by!: number | null;


    // ======================================================
    // UPDATED AT
    // ======================================================

    // @Column({
    //     type: "datetime",
    //     default: () => "CURRENT_TIMESTAMP"
    // })
    // updated_at!: Date;


    // ======================================================
    // STORE
    // ======================================================

    @ManyToOne(
        () => Store,
        {
            nullable: true
        }
    )
    @JoinColumn({
        name: "store_id"
    })
    store!: Store;


    @Column({
        type: "integer",
        nullable: true
    })
    store_id!: number | null;


    // ======================================================
    // SESSION
    // ======================================================

    @ManyToOne(
        () => Session,
        {
            nullable: true
        }
    )
    @JoinColumn({
        name: "session_id"
    })
    session!: Session;


    @Column({
        type: "integer",
        nullable: true
    })
    session_id!: number | null;


    // ======================================================
    // IP ADDRESS
    // ======================================================

    @Column({
        type: "varchar",
        length: 45,
        nullable: true
    })
    ip_address!: string | null;


    // ======================================================
    // ACTIVE FLAG
    // ======================================================

    @Column({
        type: "boolean",
        default: true
    })
    is_active!: boolean;
}