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
export class TourReview extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    userName: string;

    @Column()
    rating: number;

    @Column()
    comments: string;

    @ManyToOne(() => Tour, (tour) => tour.reviews, { onDelete: "CASCADE" })
    tour: Tour;

    @ManyToOne(() => User, (user) => user.reviews, { onDelete: "CASCADE" })
    user: User;
}
