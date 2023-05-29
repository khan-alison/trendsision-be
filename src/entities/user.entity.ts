import { ROLES } from "src/utils/constants";
import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { TourComment } from "./tour-comments.entity";
import { TourReview } from "./tour-reviews.entity";
import { Tour } from "./tour.entity";
import { DeviceSession } from "./device-session.entity";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: true, default: "khanhdzai" })
    name: string;

    @Column()
    email: string;

    @Column({ type: "enum", enum: ROLES, default: ROLES.USER })
    role: ROLES;

    @Column({ default: "avatar.jpg" })
    photo: string;

    @Column()
    password: string;

    @Column({ name: "refresh_token", nullable: true })
    resetToken: string;

    @ManyToOne(() => Tour, (tour) => tour.guiders, {
        cascade: true,
        eager: true,
    })
    staffTours: Tour;

    @ManyToOne(() => Tour, (tour) => tour.customers, {
        cascade: true,
        eager: true,
    })
    clientTours: Tour;

    @OneToMany(() => TourComment, (comment) => comment.user)
    comments: TourComment[];

    @OneToMany(() => TourReview, (review) => review.user)
    reviews: TourReview[];

    @Column({
        name: "create_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
    })
    createdAt: Date;

    @UpdateDateColumn({ name: "update_at" })
    updatedAt: Date;

    @OneToMany(() => DeviceSession, (deviceSession) => deviceSession.user)
    deviceSessions: DeviceSession[];
}
