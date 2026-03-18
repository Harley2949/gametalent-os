/**
 * 验证异常拦截器
 *
 * 处理 class-validator 的验证错误，统一格式化
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ValidationError } from 'class-validator';

/**
 * 格式化验证错误
 */
export function formatValidationErrors(errors: ValidationError[]): Record<
  string,
  string[]
> {
  const formattedErrors: Record<string, string[]> = {};

  errors.forEach(error => {
    const constraints = error.constraints;
    const children = error.children;

    // 处理当前字段的约束
    if (constraints) {
      formattedErrors[error.property] = Object.values(constraints);
    }

    // 处理嵌套对象的验证错误
    if (children && children.length > 0) {
      const nestedErrors = formatValidationErrors(children);

      Object.keys(nestedErrors).forEach(nestedField => {
        const fieldPath = `${error.property}.${nestedField}`;
        formattedErrors[fieldPath] = nestedErrors[nestedField];
      });
    }
  });

  return formattedErrors;
}

/**
 * 验证异常拦截器
 */
@Injectable()
export class ValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        // 处理验证错误
        if (
          error.response &&
          error.response.message &&
          Array.isArray(error.response.message) &&
          error.status === 400
        ) {
          const validationErrors = error.response.message;
          const formattedErrors = formatValidationErrors(validationErrors);

          throw new BadRequestException({
            code: 'VALIDATION_ERROR',
            message: '请求参数验证失败',
            errors: formattedErrors,
          });
        }

        // 其他错误直接抛出
        throw error;
      }),
    );
  }
}
