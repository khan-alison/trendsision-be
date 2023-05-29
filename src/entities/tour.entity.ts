import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
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

    @Column({ name: "max_group_size" })
    maxGroupSize: number;

    @Column()
    difficulty: string;

    @Column({ name: "ratings_average", type: "double" })
    ratingsAverage: number;

    @Column({ name: "ratings_quantity" })
    ratingsQuantity: number;

    @Column()
    price: number;

    @Column()
    summary: string;

    @Column({ type: "text" })
    description: string;

    @Column({ name: "cover_image" })
    coverImage: string;

    @Column({
        name: "start_date",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
    })
    startDate: Date;

    @Column({
        name: "end_date",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
    })
    endDate: Date;

    @Column({ name: "city_id" })
    cityId: string;

    @ManyToOne(() => City, (city) => city.tours)
    @JoinColumn({ name: "city_id" })
    city: City;

    @OneToMany(() => User, (user) => user.staffTours)
    guiders: User[];

    @OneToMany(() => User, (user) => user.clientTours)
    customers: User[];

    @OneToMany(() => TourImage, (tourImage) => tourImage.tour)
    images: TourImage[];

    @OneToMany(() => TourComment, (comment) => comment.tour)
    comments: TourComment[];

    @OneToMany(() => TourReview, (review) => review.tour)
    reviews: TourReview[];
}
