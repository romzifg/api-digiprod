import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class TypeDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsOptional()
    description: string;
}