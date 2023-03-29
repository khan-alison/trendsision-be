import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
} from "class-validator";
import { ROLES } from "src/utils/constants";

export class CreateUserDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsEnum(ROLES)
    @IsOptional()
    role?: ROLES;

    @IsString()
    @IsOptional()
    photo?: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    passwordConfirm: string;
}
