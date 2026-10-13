import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class PaginationService {
  async paginate<T>(
    model: Model<T>,
    page: number,
    limit: number,
    filter: any = {},
    projection: any = '',
    sort: any = {},
  ) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      model.find(filter).select(projection).sort(sort).skip(skip).limit(limit).exec(),
      model.countDocuments(filter),
    ]);

    return {
      status: true,
      statusCode: 200,
      message: 'Data fetched successfully',
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
