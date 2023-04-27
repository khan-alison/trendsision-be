import { IsString } from "class-validator";

export class TourImageDto {
    @IsString()
    image: string;

    @IsString()
    tourId: string;
}
