import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
} from "class-validator";
import { ROLES } from "src/utils/constants";

export class CreateUserDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsEnum(ROLES)
    @IsOptional()
    role?: ROLES;

    @IsString()
    @IsOptional()
    photo?: string;

    @IsDateString()
    dateOfBirth: Date;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    passwordConfirm: string;
}
