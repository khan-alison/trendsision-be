import {
    BaseEntity,
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { TourImage } from "./tour-image.entity";
import { User } from "./user.entity";

@Entity()
export class Tour extends BaseEntity {
    @PrimaryGeneratedColumn("uuid", { name: "tour_id" })
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
    imageCover: string;

    @OneToMany(() => TourImage, (tourImage) => tourImage.tour_id, {
        cascade: ["insert", "update"],

        eager: true,
    })
    images: TourImage[];

    @OneToMany(() => User, (tourGuide) => tourGuide.tour, {
        cascade: true,

        eager: true,
    })
    guides: string[];
}
