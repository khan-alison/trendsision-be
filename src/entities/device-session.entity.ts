import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "./user.entity";

@Entity()
export class DeviceSessionEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    deviceId: string;

    @Column({ nullable: true })
    name: string;

    @Column()
    ua: string;

    @Column({ type: "longtext" })
    refreshToken: string;

    @Column()
    expiredAt: Date;

    @Column()
    ipAddress: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => UserEntity, (user) => user.deviceSessions, {
        eager: true,
        cascade: true,
    })
    user: UserEntity;
}
