import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ApprovalQueueStatus } from "libs/database/src/entities/approval-queue.entity";


export class UpdateApprovalStatusDto {
    @ApiProperty({ description: 'Request Id', example: '0e41d1d8-bc07-40b5-af72-301a01f61b9a' })
    @IsNotEmpty()
    @IsString()
    requestId?: string

    @ApiPropertyOptional({ description: 'Status to update the approval queue request', enum: ApprovalQueueStatus })
    @IsEnum(ApprovalQueueStatus, { message: 'Status must be a valid request status'})
    status?: ApprovalQueueStatus
}