import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tour } from "../tours/tour.entity";

enum ROLES {
    "USER",
    "GUIDE",
    "LEAD_GUIDE",
    "ADMIN",
}

@Entity()
export class TourGuide {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({ type: "enum", enum: ROLES, default: ROLES.USER })
    roles: ROLES;

    @ManyToOne(() => Tour, (tour) => tour.guides)
    tour: Tour;
}
