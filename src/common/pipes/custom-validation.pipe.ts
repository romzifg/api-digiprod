import { ArgumentMetadata, Injectable, PipeTransform, UnprocessableEntityException, ValidationError } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (value === null) return value;

    if (!metatype || !this.toValidate(metatype)) return value;

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: false,
      stopAtFirstError: false,
    })

    if (errors.length > 0) {
      const flattened = this.flattenValidationErrors(errors);
      throw new UnprocessableEntityException({
        message: 'Unprocessable Entity',
        errors: flattened
      });
    }

    return value;
  }

  private toValidate(metatype: any): boolean {
    const primitive: Function[] = [String, Boolean, Number, Array, Object];
    return !primitive.includes(<Function>metatype);
  }

  private flattenValidationErrors(errors: ValidationError[]) {
    const out: Array<{ field: string, message: string }> = [];
    const walk = (err: ValidationError) => {
      if (err.constraints) {
        for (const key in err.constraints) {
          if (Object.prototype.hasOwnProperty.call(err.constraints, key)) {
            out.push({ field: err.property, message: err.constraints[key] });
          }
        }
      }

      if (err?.children?.length) err.children.forEach(walk);
    }

    errors.forEach(walk);
    return out;
  }
}

