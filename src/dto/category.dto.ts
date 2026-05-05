import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description: string;
}