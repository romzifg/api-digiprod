import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class OrderDto {
    @IsString()
    @IsNotEmpty()
    product_id: string;

    @IsString()
    @IsOptional()
    user_id?: string;

    @IsNumber()
    @IsNotEmpty()
    total_amount: number;

    @IsString()
    @IsNotEmpty()
    payment_method: string;

    @IsBoolean()
    @IsNotEmpty()
    use_voucer: boolean;
}