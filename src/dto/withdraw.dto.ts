import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class WithdrawDto {
    @IsNumber()
    @IsNotEmpty()
    total_amount: number;
}