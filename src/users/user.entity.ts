import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Tour } from "../tours/tour.entity";

export enum ROLES {
    USER = "user",
    GUIDE = "guide",
    LEAD_GUIDE = "lead_guide",
    ADMIN = "admin",
}

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({ type: "enum", enum: ROLES, default: ROLES.USER })
    role: ROLES;

    @Column()
    photo: string;

    @Column()
    password: string;

    @ManyToOne(() => Tour, (tour) => tour.guides)
    tour: Tour;
}
