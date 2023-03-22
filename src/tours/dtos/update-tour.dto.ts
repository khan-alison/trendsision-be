import { IsNotEmpty } from "class-validator";

export class UpdateTourStatusDto {
    @IsNotEmpty()
    price: number;
}
