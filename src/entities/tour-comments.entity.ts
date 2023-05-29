import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Tour } from "./tour.entity";
import { User } from "./user.entity";

@Entity()
export class TourComment extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    comment: string;

    @Column({ name: "create_at", default: () => "CURRENT_TIMESTAMP" })
    createAt: Date;

    @ManyToOne(() => Tour, (tour) => tour.comments, {
        onDelete: "CASCADE",
        eager: true,
    })
    tour: Tour;

    @ManyToOne(() => User, (user) => user.comments, {
        onDelete: "CASCADE",
        eager: true,
    })
    user: User;
}
