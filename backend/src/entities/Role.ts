import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

import { User } from "./User.js";

@Entity({ name: "role" })
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

    @OneToMany(
        () => User,
        (user: User) => user.role
    )
    users!: User[];
}