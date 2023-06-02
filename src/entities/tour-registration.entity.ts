import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Tour } from "./tour.entity";

@Entity()
export class TourRegistration extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    registrationDate: Date;

    @Column({ nullable: true })
    fullName: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    dateOfBirth: Date;

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
    medicalConditions: string;

    @Column({ nullable: true })
    emergencyContactName: string;

    @Column({ nullable: true })
    emergencyContactPhone: string;

    @Column({ nullable: true })
    travelInsurancePolicy: string;

    @Column({ nullable: true, type: "text" })
    additionalPreferences: string;

    @Column({ nullable: true })
    numberOfAdults: number;

    @Column({ nullable: true })
    numberOfChildren: number;

    @Column({ nullable: true })
    numberOfInfants: number;

    @Column({ nullable: true, type: "json" })
    individualNotes: { [id: string]: string };

    @ManyToOne(() => User, (user) => user.tourRegistrations)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ name: "user_id" })
    userId: string;

    @ManyToOne(() => Tour, (tour) => tour.userRegistrations)
    @JoinColumn({ name: "tour_id" })
    tour: Tour;

    @Column({ name: "tour_id" })
    tourId: string;
}
