import { IsOptional, IsString } from "class-validator";

export class GetToursFilterDto {
    @IsOptional()
    @IsString()
    price?: number;
    @IsOptional()
    @IsString()
    search?: string;
}
