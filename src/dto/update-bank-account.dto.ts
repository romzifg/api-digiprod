import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateBankAccountDto {
    @IsString()
    @IsOptional()
    bank?: string;

    @IsString()
    @IsOptional()
    bank_account_name?: string;

    @IsString()
    @IsOptional()
    bank_account_number?: string;
}