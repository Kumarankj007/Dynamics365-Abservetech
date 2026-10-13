import { PaginationModule } from "@dynamics-monorepo/common";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course } from "libs/database/src/entities/course.entity";
import { Enrollment } from "libs/database/src/entities/enrollments.entity";
import { Payout } from "libs/database/src/entities/payout.entity";
import { User } from "libs/database/src/entities/user.entity";
import { PayoutService } from "./payout.service";
import { JwtStrategy } from "libs/access/src/strategies/jwt.strategy";
import { PayoutController } from "./payout.controller";

@Module({
    imports:[
        ConfigModule,
        TypeOrmModule.forFeature([
            Payout,
            Course,
            Enrollment,
            User
        ]),
        PaginationModule,
        PassportModule.register({ defaultStrategy: 'jwt' }), 
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
    providers: [PayoutService, JwtStrategy],
    controllers: [PayoutController],
    exports: [PayoutService]
})
export class PayoutModule {}