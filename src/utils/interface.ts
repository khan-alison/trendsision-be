import { User } from "src/entities/user.entity";

export interface Session {
    id: string;
    deviceId: string;
    name: string;
    ua: string;
    refreshToken: string;
    expiredAt: Date;
    ipAddress: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
