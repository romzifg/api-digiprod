import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UserActivityDto {
    @IsString()
    @IsNotEmpty()
    product_id: string;

    @IsString()
    @IsOptional()
    ecourse_sub_material_id: string;
}