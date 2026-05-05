import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from "class-validator";

export class BaseRegisterDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-zA-Z\s]+$/)
    name: string;

    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional()
    @Matches(/^[0-9]+$/)
    phone_number?: string;

    @IsString()
    @IsOptional()
    role?: string;

    @IsString()
    @IsOptional()
    photo?: string | null;
}

export class RegisterCreatorDto extends BaseRegisterDto {
    @IsNumber()
    @IsNotEmpty()
    job_id: number;
}

export class RegisterUserDto extends BaseRegisterDto {
    @IsNumber()
    @IsOptional()
    job_id: number;
}