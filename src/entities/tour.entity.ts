import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { City } from "./city.entity";
import { TourImage } from "./tour-image.entity";
import { User } from "./user.entity";
import { TourReview } from "./tour-reviews.entity";
import { TourComment } from "./tour-comments.entity";

@Entity()
export class Tour extends BaseEntity {
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

    @ManyToOne(() => City, (city) => city.tours, {
        eager: true,
        cascade: true,
    })
    city: City;

    @OneToMany(() => User, (user) => user.staffTours, {
        cascade: true,
        eager: true,
    })
    guiders: User[];

    @OneToMany(() => User, (user) => user.clientTours, {
        cascade: true,
        eager: true,
    })
    customers: User[];

    @OneToMany(() => TourImage, (tourImage) => tourImage.tour, {
        cascade: ["insert", "update"],
        eager: true,
    })
    images: TourImage[];

    @OneToMany(() => TourComment, (comment) => comment.tour, { eager: true })
    comments: TourComment[];

    @OneToMany(() => TourReview, (review) => review.tour, { eager: true })
    reviews: TourReview[];
}
