import { Module } from '@nestjs/common';
import { PaginationService } from './pagination.service';
import { QueryBuilderService } from './querybuilder.service';

@Module({
  providers: [PaginationService, QueryBuilderService],
  exports: [PaginationService, QueryBuilderService]
})
export class PaginationModule {}
