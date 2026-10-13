import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { SubscriptionStatus } from 'libs/access/src/enums/course.enum';
import { Type } from 'class-transformer';

export class UpdateSubscriptionStatusDto {
  @ApiProperty({ enum: SubscriptionStatus })
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;
}


