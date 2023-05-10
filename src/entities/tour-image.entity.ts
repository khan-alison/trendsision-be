import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { TourEntity } from "./tour.entity";

@Entity("tour_images")
export class TourImageEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column({ default: "default.png" })
    image: string;

    @ManyToOne(() => TourEntity, (tour) => tour.images, {
        onDelete: "CASCADE",
    })
    tour: string;
}
