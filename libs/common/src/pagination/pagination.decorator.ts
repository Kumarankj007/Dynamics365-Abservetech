import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PaginationDto } from './pagination.dto';

export const PaginationQuery = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationDto => {
    const request = ctx.switchToHttp().getRequest();
    const { page = 1, limit = 10 } = request.query;

    return {
      page: Number(page),
      limit: Number(limit),
    };
  },
);
