import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class TourGuideDto {
    @IsNotEmpty()
    id: string;
    @IsString()
    name: string;
    @IsEmail()
    email: string;
    @IsString()
    tourId: string;
}
