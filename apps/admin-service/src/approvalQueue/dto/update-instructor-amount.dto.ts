import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class UpdateInstuctorAmountDto {
    @ApiProperty({ description: 'Queue Id', example: '0e41d1d8-bc07-40b5-af72-301a01f61b9a' })
    @IsNotEmpty()
    @IsString()
    queueId?: string

    @ApiProperty({ description: 'Amount', example: '20' })
    @IsString()
    instructorAmount?: string
}