import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { TourEntity } from "./tour.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class TourReviewEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    userName: string;

    @Column()
    rating: number;

    @Column()
    comments: string;

    @ManyToOne(() => TourEntity, (tour) => tour.reviews, {
        onDelete: "CASCADE",
    })
    tour: TourEntity;

    @ManyToOne(() => UserEntity, (user) => user.reviews, {
        onDelete: "CASCADE",
    })
    user: UserEntity;
}
