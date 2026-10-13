import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class PayoutDto {
    @ApiProperty({ description: 'Amount to be paid out', example: 150.75 })
    @IsNotEmpty()
    @IsNumber()
    amount?: number;

    @ApiProperty({ description: 'Description for the payout', example: 'Payout for course sales in August' })
    @IsOptional()
    @IsString()
    description?: string;
}