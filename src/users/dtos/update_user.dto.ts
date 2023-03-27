import { IsString, IsEmail, IsEnum, IsNotEmpty } from "class-validator";
import { ROLES } from "../../entities/user.entity";

export class UpdateUserDto {
    @IsNotEmpty()
    @IsString()
    name?: string;

    @IsNotEmpty()
    @IsEmail()
    email?: string;

    @IsNotEmpty()
    @IsEnum(ROLES)
    role?: ROLES;

    @IsNotEmpty()
    @IsString()
    photo?: string;

    @IsNotEmpty()
    @IsString()
    password?: string;
}
