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
import { TourCommentEntity } from "./tour-comments.entity";
import { TourReviewEntity } from "./tour-reviews.entity";
import { TourEntity } from "./tour.entity";
import { DeviceSessionEntity } from "./device-session.entity";

@Entity()
export class UserEntity extends BaseEntity {
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

    @Column({ nullable: true })
    reset_token: string;

    @ManyToOne(() => TourEntity, (tour) => tour.guiders)
    staffTours: TourEntity;

    @ManyToOne(() => TourEntity, (tour) => tour.customers)
    clientTours: TourEntity;

    @OneToMany(() => TourCommentEntity, (comment) => comment.user)
    comments: TourCommentEntity[];

    @OneToMany(() => TourReviewEntity, (review) => review.user)
    reviews: TourReviewEntity[];

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => DeviceSessionEntity, (deviceSession) => deviceSession.user)
    deviceSessions: DeviceSessionEntity[];
}
