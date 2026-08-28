import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from "typeorm";

@Entity("transactions_audit")
export class Audit {

    @PrimaryGeneratedColumn()
    audit_id!: number;

    @Column({
        type: "varchar",
        length: 100,
    })
    table_name!: string;

    @Column({
        type: "integer",
    })
    record_id!: number;

    @Column({
        type: "varchar",
        length: 50,
    })
    action!: string;

    @Column({
        type: "integer",
        nullable: true,
    })
    user_id!: number | null;

    @Column({
        type: "text",
        nullable: true,
    })
    old_value!: string | null;

    @Column({
        type: "text",
        nullable: true,
    })
    new_value!: string | null;

    @CreateDateColumn({
        type: "datetime",
    })
    created_at!: Date;
}