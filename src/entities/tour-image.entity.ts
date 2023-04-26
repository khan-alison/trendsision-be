import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Tours } from "./tour.entity";

@Entity("tour_images")
export class TourImage extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column({ default: "default.png" })
    image: string;

    @ManyToOne(() => Tours, (tour) => tour.id, {
        onDelete: "CASCADE",
    })
    tour: string;
}
