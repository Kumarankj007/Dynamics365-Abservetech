import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Settings } from "libs/database/src/entities/settings.entity";
import { SettingsService } from "./settings.service";
import { SettingsController } from "./settings.controller";
import { JwtStrategy } from "libs/access/src/strategies/jwt.strategy";


@Module({
    imports: [
        TypeOrmModule.forFeature([Settings]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET') || 'dynamics365-secret-key';
                const expiresIn = (configService.get<string>('JWT_EXPIRES_IN') || '7d') as import('ms').StringValue;
                return {
                    secret,
                    signOptions: {
                        expiresIn,
                    },
                };
            },
       }),
    ],
    providers: [SettingsService, JwtStrategy],
    controllers: [SettingsController],
    exports: [SettingsService]
})

export class SettingsModule {}