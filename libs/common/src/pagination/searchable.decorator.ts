import { SetMetadata } from '@nestjs/common';

export const SEARCHABLE_FIELDS_KEY = 'searchableFields';
export const Searchable = (...fields: string[]) =>
  SetMetadata(SEARCHABLE_FIELDS_KEY, fields);
