import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Matches, ValidateIf, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { typeConstant } from "src/constants/type.constant";

export class EcourseSubMaterialDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    video_url: string;

    @IsNumber()
    @IsOptional()
    duration: number;
}

export class EcourseMaterialDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => EcourseSubMaterialDto)
    ecourse_sub_materials: EcourseSubMaterialDto[];
}

export class ProductDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    description: string

    @IsNumber()
    @IsNotEmpty()
    price: number

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    category_id: number

    @IsString()
    @IsNotEmpty()
    type_code: string

    @IsString()
    @IsNotEmpty()
    level: string

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    learn_points: string[]

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    audiences: string[]

    @IsArray()
    @ValidateIf((o) => o.type_code == typeConstant.ECOURSE)
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => EcourseMaterialDto)
    ecourse_materials: EcourseMaterialDto[]

    @ValidateIf((o) => o.type_code == typeConstant.EBOOK)
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    ebook_page_count: number

    @ValidateIf((o) => o.type_code == typeConstant.WEBINAR)
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    webinar_duration: number

    @ValidateIf((o) => o.type_code == typeConstant.WEBINAR)
    @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    @IsNotEmpty()
    webinar_time: string

    @ValidateIf((o) => o.type_code == typeConstant.WEBINAR)
    @IsNotEmpty()
    webinar_date: Date

    @ValidateIf((o) => o.type_code == typeConstant.WEBINAR)
    @IsNotEmpty()
    @IsUrl()
    webinar_link: string
}