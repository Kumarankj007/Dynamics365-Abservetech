import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { PayoutStatus } from "libs/database/src/entities/payout.entity";


export class UpdatePayoutStatusDto {
    @ApiProperty({ description: 'Payout Id', example: '0e41d1d8-bc07-40b5-af72-301a01f61b9a' })
    @IsNotEmpty()
    @IsString()
    payoutId?: string

    @ApiProperty({ description: 'Status to update the payout request', enum: PayoutStatus })
    @IsEnum(PayoutStatus, { message: 'Status must be a valid payout status' })
    status?: PayoutStatus
}