import { Injectable } from '@nestjs/common';

@Injectable()
export class QueryBuilderService {
  buildSearchQuery(search: string, searchableFields: string[]): any {
    if (!search) return {};
    const regex = new RegExp(search, 'i'); 
    return {
      $or: searchableFields.map((field) => ({ [field]: regex })),
    };
  }

  buildSortQuery(sortBy: string, order: 'asc' | 'desc' = 'asc') {
    if (!sortBy) return {};
    return { [sortBy]: order === 'asc' ? 1 : -1 };
  }
}
