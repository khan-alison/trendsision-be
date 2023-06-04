import {
    IsDateString,
    IsEmail,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    MaxLength,
    Min,
} from "class-validator";

export class RegisterTourDTO {
    @IsOptional()
    fullName: string;

    @IsEmail()
    @IsOptional()
    email: string;

    @IsPhoneNumber()
    @IsOptional()
    phoneNumber: string;

    @IsOptional()
    address: string;

    @IsDateString()
    @IsOptional()
    dateOfBirth: Date;

    @IsOptional()
    passportNumber: string;

    @IsDateString()
    @IsNotEmpty()
    passportIssueDate: Date;

    @IsDateString()
    @IsNotEmpty()
    passportExpiryDate: Date;

    @IsNotEmpty()
    passportCountryOfIssuance: string;

    @IsOptional()
    dietaryRestrictions: string;

    @IsOptional()
    medicalConditions: string;

    @IsNotEmpty()
    emergencyContactName: string;

    @IsPhoneNumber()
    @IsNotEmpty()
    emergencyContactPhone: string;

    @IsNotEmpty()
    travelInsurancePolicy: string;

    @IsOptional()
    @MaxLength(500)
    additionalPreferences: string;
    @IsOptional()
    @IsInt()
    @Min(0)
    numberOfAdults: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    numberOfChildren: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    numberOfInfants: number;

    @IsOptional()
    individualNotes: { [id: string]: string };
}
