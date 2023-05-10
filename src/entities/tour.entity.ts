import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { CityEntity } from "./city.entity";
import { TourImageEntity } from "./tour-image.entity";
import { UserEntity } from "./user.entity";
import { TourReviewEntity } from "./tour-reviews.entity";
import { TourCommentEntity } from "./tour-comments.entity";

@Entity()
export class TourEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    duration: number;

    @Column()
    maxGroupSize: number;

    @Column()
    difficulty: string;

    @Column()
    ratingsAverage: number;

    @Column()
    ratingsQuantity: number;

    @Column()
    price: number;

    @Column()
    summary: string;

    @Column({ type: "text" })
    description: string;

    @Column()
    coverImage: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    startDate: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    endDate: Date;

    @ManyToOne(() => CityEntity, (city) => city.tours, {
        eager: true,
        cascade: true,
    })
    city: CityEntity;

    @OneToMany(() => UserEntity, (user) => user.staffTours, {
        cascade: true,
        eager: true,
    })
    guiders: UserEntity[];

    @OneToMany(() => UserEntity, (user) => user.clientTours, {
        cascade: true,
        eager: true,
    })
    customers: UserEntity[];

    @OneToMany(() => TourImageEntity, (tourImage) => tourImage.tour, {
        cascade: ["insert", "update"],
        eager: true,
    })
    images: TourImageEntity[];

    @OneToMany(() => TourCommentEntity, (comment) => comment.tour, {
        eager: true,
    })
    comments: TourCommentEntity[];

    @OneToMany(() => TourReviewEntity, (review) => review.tour, { eager: true })
    reviews: TourReviewEntity[];
}
