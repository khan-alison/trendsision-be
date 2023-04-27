import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Tour } from "./tour.entity";

@Entity("tour_images")
export class TourImage extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column({ default: "default.png" })
    image: string;

    @ManyToOne(() => Tour, (tour) => tour.images, {
        onDelete: "CASCADE",
    })
    tour: string;
}
