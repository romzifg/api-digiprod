import { ArrayNotEmpty, IsArray, IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ProductVoucherDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    code: string;

    @IsNumber()
    @IsOptional()
    percentage: number;

    @IsDateString({ strict: true })
    @IsOptional()
    end_date: string;

    @IsBoolean()
    @IsNotEmpty()
    is_active: boolean;

    @IsArray()
    @IsNumber({}, { each: true })
    @ArrayNotEmpty()
    product: number[];
}

export class ValidateProductVoucherDto {
    @IsString()
    @IsOptional()
    code: string;

    @IsNumber()
    @IsOptional()
    product_id: number;
}