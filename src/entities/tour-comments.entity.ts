import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Tour } from "./tour.entity";
import { User } from "./user.entity";

@Entity()
export class TourComment extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    userName: string;

    @Column()
    comment: string;

    @Column({ default: () => "CURRENT_TIMESTAMP" })
    timeStamp: Date;

    @ManyToOne(() => Tour, (tour) => tour.comments, { onDelete: "CASCADE" })
    tour: Tour;

    @ManyToOne(() => User, (user) => user.comments, { onDelete: "CASCADE" })
    user: User;
}
