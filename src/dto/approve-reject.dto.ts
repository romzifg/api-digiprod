import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";

export class ApproveRejectDto {
    @IsNumber()
    @IsNotEmpty()
    status: number;

    @IsString()
    @IsNotEmpty()
    @ValidateIf((o) => Number(o.status) === 300)
    note: string;

    @IsBoolean()
    @IsOptional()
    is_withdraw: boolean;

    @IsString()
    @ValidateIf((o) => o.is_withdraw === true)
    proof_image_key: string;
}