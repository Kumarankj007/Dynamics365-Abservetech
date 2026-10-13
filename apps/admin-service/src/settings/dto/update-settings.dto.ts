import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
    @ApiPropertyOptional({ example: 'Dynamics' })
    @IsOptional()
    @IsString()
    appName?: string;

    @ApiPropertyOptional({ example: 'https://dynamics365.com' })
    @IsOptional()
    @IsString()
    baseUrl?: string;

    @ApiPropertyOptional({
        description: 'Port (multipart sends string)',
        example: '4000',
    })
    @IsOptional()
    @IsString()
    port?: string; 

    @ApiPropertyOptional({
        description: 'SMTP config as JSON string',
        example:
            '{"host":"smtp.gmail.com","port":587,"user":"test@gmail.com","pass":"123","secure":false}',
    })
    @IsOptional()
    @IsString()
    smtp?: string;

    @ApiPropertyOptional({ description: 'Upload logo', type: 'string', format: 'binary' })
    @IsOptional()
    logo?: string

    @ApiPropertyOptional({ description: 'Upload favicon', type: 'string', format: 'binary' })
    @IsOptional()
    favicon?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    awsAccessKeyId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    awsSecretAccessKey?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    awsRegion?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    awsBucketName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value == 'true' || value == true)
    @IsBoolean()
    useAws?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    googleClientId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    googleClientSecret?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    stripeSecretKey?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    stripePublishableKey?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    stripeWebhookSecret?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    razorpayKeyId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    razorpayKeySecret?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    razorpayWebhookSecret?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    paypalClientId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    paypalClientSecret?: string;

    @ApiPropertyOptional({ description: "PayPal environment: 'sandbox' or 'live'", example: 'sandbox' })
    @IsOptional()
    @IsString()
    paypalMode?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    paypalWebhookId?: string;

}
