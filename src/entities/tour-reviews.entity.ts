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
    id: string;

    @Column("decimal", { precision: 2, scale: 1 })
    rating: number;

    @Column()
    comment: string;

    @ManyToOne(() => TourEntity, (tour) => tour.reviews)
    tour: TourEntity;

    @Column({ default: () => "CURRENT_TIMESTAMP" })
    createAt: Date;

    @Column()
    updateAt: Date;

    @ManyToOne(() => UserEntity, (user) => user.reviews, {
        cascade: true,
    })
    user: UserEntity;
}
