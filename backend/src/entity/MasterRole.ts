import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

import { User } from "./TransactionsUser.js";

@Entity({ name: "master_role" })
export class Role {

    @PrimaryGeneratedColumn({
        name: "role_id"
    })
    role_id!: number;

    @Column({
        name: "role_name",
        type: "varchar",
        unique: true
    })
    role_name!: string;

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


    @OneToMany(
        () => User,
        (user: User) => user.role
    )
    users!: User[];
}