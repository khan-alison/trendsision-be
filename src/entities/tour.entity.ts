import {
    BaseEntity,
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { TourImage } from "./tour-image.entity";
import { Reviews } from "./tour-reviews.entity";
import { User } from "./user.entity";
import { Comments } from "./tour-comments.entity";

@Entity()
export class Tours extends BaseEntity {
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

    @Column({ type: "longtext" })
    description: string;

    @Column()
    coverImage: string;

    @Column({ default: () => "CURRENT_TIMESTAMP" })
    startDate: Date;

    @Column({ default: () => "CURRENT_TIMESTAMP" })
    endDate: Date;

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

    @OneToMany(() => Comments, (comment) => comment.tour)
    comments: Comments[];

    @OneToMany(() => Reviews, (review) => review.tour)
    reviews: Reviews[];
}
