import {
    BaseEntity,
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { TourImage } from "./tour-image.entity";
import { TourGuide } from "../user/user.entity";

@Entity()
export class Tour extends BaseEntity {
    @PrimaryGeneratedColumn("uuid", { name: "task_id" })
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
    @OneToMany(() => TourImage, (tourImage) => tourImage.tour, {
        cascade: true,
        eager: true,
    })
    images: TourImage[];

    @OneToMany(() => TourGuide, (tourGuide) => tourGuide.tour)
    guides: string[];
}
