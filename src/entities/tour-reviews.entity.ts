import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Tour } from "./tour.entity";
import { User } from "./user.entity";

@Entity()
export class TourReview extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("decimal", { precision: 2, scale: 1 })
    rating: number;

    @Column()
    comment: string;

    @CreateDateColumn({ name: "create_at" })
    createAt: Date;

    @UpdateDateColumn({ name: "update_at" })
    updateAt: Date;

    @Column({ name: "user_id" })
    userId: string;

    @Column({ name: "tour_id" })
    tourId: string;

    @ManyToOne(() => User, (user) => user.reviews, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({
        name: "user_id",
    })
    user: User;

    @ManyToOne(() => Tour, (tour) => tour.reviews, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({
        name: "tour_id",
    })
    tour: Tour;
}
