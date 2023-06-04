import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateTourReviewDto {
    @IsNumber()
    @IsNotEmpty()
    ratingStar: number;

    @IsString()
    comment: string;

    @IsString()
    tourId: string;
}
