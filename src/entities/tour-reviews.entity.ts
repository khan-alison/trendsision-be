import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Tours } from "./tour.entity";
import { User } from "./user.entity";

@Entity()
export class Reviews extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    userName: string;

    @Column()
    rating: number;

    @Column()
    comments: string;

    @ManyToOne(() => Tours, (tour) => tour.reviews, { onDelete: "CASCADE" })
    tour: Tours;

    @ManyToOne(() => User, (user) => user.reviews, { onDelete: "CASCADE" })
    user: User;
}
