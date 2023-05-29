import { ROLES } from "src/utils/constants";

export interface SafeUser {
    id: string;
    email: string;
    role: ROLES;
    photo: string;
}

export interface LoginResponseData {
    accessToken: string;
    refreshToken: string;
    userData: SafeUser;
}

export interface GenerateAccessJWTData {
    accessToken: string;
}
