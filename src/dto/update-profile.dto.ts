import { Type } from "class-transformer";
import { IsDateString, IsEmail, IsNumber, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class UpdateUserProfileDto {
    @IsString()
    @IsOptional()
    @Matches(/^[a-zA-Z\s]+$/)
    name?: string;

    @IsEmail()
    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    @Matches(/^[0-9]+$/)
    phone_number?: string;

    @IsString()
    @IsOptional()
    bio?: string;

    @IsString()
    @IsOptional()
    @MinLength(8)
    password?: string;

    @IsString()
    @IsOptional()
    photo?: string | null;
}

export class UpdateCreatorProfileDto extends UpdateUserProfileDto {
    @IsString()
    @IsOptional()
    identity_number?: string;

    @IsDateString({ strict: true })
    @IsOptional()
    birth_date?: string

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    job_id: number

    @IsString()
    @IsOptional()
    address?: string
}
