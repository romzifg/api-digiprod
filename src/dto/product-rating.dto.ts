import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ProductRatingDto {
    @IsString()
    @IsNotEmpty()
    product_id: string;

    @IsNumber()
    @IsNotEmpty()
    rating: number;

    @IsString()
    @IsOptional()
    review?: string;
}