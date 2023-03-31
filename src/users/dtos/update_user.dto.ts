import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { ROLES } from "src/utils/constants";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsEnum(ROLES)
    role?: ROLES;

    @IsOptional()
    @IsString()
    photo?: string;
}
