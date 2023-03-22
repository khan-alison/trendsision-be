import { IsOptional, IsString } from "class-validator";

export class GetTaskFilterDto {
    @IsOptional()
    price?: number;

    @IsOptional()
    @IsString()
    search?: string;
}
