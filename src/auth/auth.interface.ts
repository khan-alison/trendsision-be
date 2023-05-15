import { UserEntity } from "src/entities/user.entity";

export interface LoginResponseData {
    accessToken: string;
    refreshToken: string;
    userData: UserEntity;
}

export interface GenerateAccessJWTData {
    accessToken: string;
}
