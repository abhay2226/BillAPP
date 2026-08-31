import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn
} from "typeorm";

import { Role } from "./MasterRole.js";
import { Session } from "./TransactionsSession.js";
import { Store } from "./TransactionsStore.js";

@Entity({ name: " transactions_user" })
export class User {

    @PrimaryGeneratedColumn({
        name: "user_id"
    })
    user_id!: number;

    @Column({
        name: "firstname",
        type: "varchar"
    })
    firstname!: string;

    @Column({
        name: "lastname",
        type: "varchar",
        nullable: true
    })
    lastname!: string | null;

    @Column({
        name: "email",
        type: "varchar",
        unique: true
    })
    email!: string;

    @Column({
        name: "password_hash",
        type: "varchar"
    })
    password_hash!: string;

    @Column({
        name: "role_id",
        type: "integer",
        nullable: true
    })
    role_id!: number;
    @Column({
        name: "store_id",
        type: "integer"
    })
    store_id!: number;

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
        () => Role,
        (role: Role) => role.users
    )
    @JoinColumn({
        name: "role_id",
        referencedColumnName: "role_id"
    })
    role!: Role;


    @ManyToOne(
        () => Store,
        (store) => store.users,
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
        () => Session,
        (session: Session) => session.user
    )
    sessions!: Session[];
}