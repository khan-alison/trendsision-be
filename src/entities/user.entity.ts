import { ROLES } from "src/utils/constants";
import {
    BaseEntity,
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { DeviceSession } from "./device-session.entity";
import { TourComment } from "./tour-comments.entity";
import { TourRegistration } from "./tour-registration.entity";
import { TourReview } from "./tour-reviews.entity";

//TODO: complete tour status
@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    email: string;

    @Column({ type: "enum", enum: ROLES, default: ROLES.USER })
    role: ROLES;

    @Column({ nullable: true })
    passportNumber: string;

    @Column({ nullable: true })
    passportIssueDate: Date;

    @Column({ nullable: true })
    passportExpiryDate: Date;

    @Column({ nullable: true })
    passportCountryOfIssuance: string;

    @Column({ nullable: true })
    dietaryRestrictions: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ nullable: true })
    dateOfBirth: Date;

    @Column({ default: "avatar.jpg" })
    photo: string;

    @Column()
    password: string;

    @Column({ name: "refresh_token", nullable: true })
    resetToken: string;

    @OneToMany(() => TourRegistration, (registration) => registration.user)
    tourRegistrations: TourRegistration[];

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
