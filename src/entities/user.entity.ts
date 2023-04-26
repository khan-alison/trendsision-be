import { ROLES } from "src/utils/constants";
import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Tours } from "./tour.entity";
import { Comments } from "./tour-comments.entity";
import { Reviews } from "./tour-reviews.entity";

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

    @Column({ nullable: true })
    reset_token: string;

    @ManyToOne(() => Tours, (tour) => tour.guiders)
    staffTours: Tours;

    @ManyToOne(() => Tours, (tour) => tour.customers)
    clientTours: Tours;

    @OneToMany(() => Comments, (comment) => comment.user)
    comments: Comments[];

    @OneToMany(() => Reviews, (review) => review.user)
    reviews: Reviews[];
}
