import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors: ValidationError[]) => {
        const details = AppValidationPipe.flattenErrors(errors);
        return new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Certains champs sont invalides.',
          details,
        });
      },
    });
  }

  private static flattenErrors(
    errors: ValidationError[],
    parentPath = '',
  ): Array<{ field: string; messages: string[] }> {
    const result: Array<{ field: string; messages: string[] }> = [];

    for (const error of errors) {
      const path = parentPath ? `${parentPath}.${error.property}` : error.property;

      if (error.constraints) {
        result.push({ field: path, messages: Object.values(error.constraints) });
      }

      if (error.children && error.children.length > 0) {
        result.push(...AppValidationPipe.flattenErrors(error.children, path));
      }
    }

    return result;
  }
}