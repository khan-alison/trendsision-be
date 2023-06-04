import { TourLocation, TourType } from "src/utils/constants";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { City } from "./city.entity";
import { TourComment } from "./tour-comments.entity";
import { TourImage } from "./tour-image.entity";
import { TourRegistration } from "./tour-registration.entity";
import { TourReview } from "./tour-reviews.entity";

@Entity()
export class Tour extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    duration: number;

    @Column()
    maxTourGuider: number;

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

    @CreateDateColumn({ name: "create_at" })
    createAt: Date;

    @UpdateDateColumn({ name: "update_at" })
    updateAt: Date;

    @Column({ name: "tour_type", type: "enum", enum: TourType })
    tourType: TourType;

    @Column({ name: "tour_location", type: "enum", enum: TourLocation })
    tourLocation: TourLocation;

    @ManyToMany(() => City, (city) => city.tours)
    @JoinTable()
    cities: City[];

    @OneToMany(() => TourRegistration, (registration) => registration.tour)
    userRegistrations: TourRegistration[];

    @ManyToMany(() => TourImage, (tourImage) => tourImage.tour, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinTable()
    images: TourImage[];

    @OneToMany(() => TourComment, (comment) => comment.tour)
    comments: TourComment[];

    @OneToMany(() => TourReview, (review) => review.tour)
    reviews: TourReview[];
}
