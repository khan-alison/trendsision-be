import { ROLES } from "src/utils/constants";
import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Tour } from "./tour.entity";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: true, default: "phuongna" })
    name: string;

    @Column()
    email: string;

    @Column({ type: "enum", enum: ROLES, default: ROLES.USER })
    role: ROLES;

    @Column({ default: "avatar.jpg" })
    photo: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    reset_token: string;

    @Column({ type: "timestamp", nullable: true })
    reset_token_expire: Date;

    @ManyToOne(() => Tour, (tour) => tour.guides)
    tour: Tour;
}
