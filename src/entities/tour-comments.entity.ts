import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { TourEntity } from "./tour.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class TourCommentEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    userName: string;

    @Column()
    comment: string;

    @Column({ default: () => "CURRENT_TIMESTAMP" })
    timeStamp: Date;

    @ManyToOne(() => TourEntity, (tour) => tour.comments, {
        onDelete: "CASCADE",
    })
    tour: TourEntity;

    @ManyToOne(() => UserEntity, (user) => user.comments, {
        onDelete: "CASCADE",
    })
    user: UserEntity;
}
