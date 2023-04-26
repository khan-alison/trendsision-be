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
export class Comments extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    userName: string;

    @Column()
    comment: string;

    @Column({ default: () => "CURRENT_TIMESTAMP" })
    timeStamp: Date;

    @ManyToOne(() => Tours, (tour) => tour.comments, { onDelete: "CASCADE" })
    tour: Tours;

    @ManyToOne(() => User, (user) => user.comments, { onDelete: "CASCADE" })
    user: User;
}
