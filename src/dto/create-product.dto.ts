import { IsNotEmpty, IsString, ValidateIf } from "class-validator"
import { typeConstant } from "src/constants/type.constant"
import { ProductDto } from "./product.dto"

export class CreateProductDto extends ProductDto {
    @IsString()
    @IsNotEmpty()
    image_key: string

    @IsString()
    @IsNotEmpty()
    @ValidateIf(o => o.type_code == typeConstant.EBOOK)
    ebook_link: string
}