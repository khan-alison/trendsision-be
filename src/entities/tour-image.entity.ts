import {
    BaseEntity,
    Column,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Tour } from "./tour.entity";

@Entity("tour_images")
export class TourImage extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column({ default: "default.png" })
    image: string;

    @ManyToMany(() => Tour)
    tour: Tour[];
}
