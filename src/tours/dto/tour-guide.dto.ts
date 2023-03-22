import { IsNotEmpty } from "class-validator";

export class TourGuideDto {
    @IsNotEmpty()
    id: string;
}
