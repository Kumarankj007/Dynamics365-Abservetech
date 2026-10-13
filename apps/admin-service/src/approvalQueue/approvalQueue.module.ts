import { PaginationModule } from "@dynamics-monorepo/common";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtStrategy } from "libs/access/src/strategies/jwt.strategy";
import { Course } from "libs/database/src/entities/course.entity";
import { User } from "libs/database/src/entities/user.entity";
import { ApprovalQueueController } from "./approvalQueue.controller";
import { ApprovalQueue } from "libs/database/src/entities/approval-queue.entity";
import { ApprovalQueueService } from "./approvalQueue.service";
import { Enrollment } from "libs/database/src/entities/enrollments.entity";
import { Payout } from "libs/database/src/entities/payout.entity";
import { Commission } from "libs/database/src/entities/commission.entity";
import { CommissionModule } from "../commission/commission.module";
import { CommissionHelper } from "libs/common/src/utils/commission/commission.helper";


@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([ApprovalQueue, Course, User, Enrollment, Payout, Commission]),
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
        CommissionModule
    ],
    providers: [ApprovalQueueService, JwtStrategy, CommissionHelper],
    controllers: [ApprovalQueueController],
    exports: [ApprovalQueueService, CommissionHelper]
})
export class ApprovalQueueModule {}