import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateReviewDto {
    @IsOptional()
    @IsString()
    comment: string;

    @IsOptional()
    @IsNumber()
    rating: number;
}
