import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
} from "typeorm";

import { Audit } from "./TransactionsAudit.js";

@Entity({ name: "master_action_type" })
export class ActionType {

    // ======================================================
    // PRIMARY KEY
    // ======================================================

    @PrimaryGeneratedColumn({ name: "action_type_id" })
    action_type_id!: number;


    // ======================================================
    // ACTION TYPE CODE
    // ======================================================

    @Column({
        name: "code",
        type: "varchar",
        unique: true,
        nullable: false,
    })
    code!: string;


    // ======================================================
    // DESCRIPTION
    // ======================================================

    @Column({
        name: "description",
        type: "varchar",
        nullable: true,
    })
    description!: string | null;


    // ======================================================
    // ACTIVE STATUS
    // ======================================================

    @Column({
        name: "is_active",
        type: "boolean",
        default: true,
    })
    is_active!: boolean;


    // ======================================================
    // CREATED DETAILS
    // ======================================================

    @Column({
        name: "created_at",
        type: "datetime",
        nullable: false,
    })
    created_at!: Date;


    // @Column({
    //     name: "created_by",
    //     type: "integer",
    //     nullable: false,
    // })
    // created_by!: number;


    // ======================================================
    // UPDATED DETAILS
    // ======================================================

    @Column({
        name: "updated_at",
        type: "datetime",
        nullable: true,
    })
    updated_at!: Date | null;


    // @Column({
    //     name: "updated_by",
    //     type: "integer",
    //     nullable: true,
    // })
    // updated_by!: number | null;


    // ======================================================
    // RELATION
    // master_action_type 1 ---- N transactions_audit
    // ======================================================

    @OneToMany(
        () => Audit,
        (audit) => audit.action_type
    )
    audits!: Audit[];
}