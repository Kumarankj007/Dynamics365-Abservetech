import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { Admin } from 'libs/database/src/entities/admin.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PaginationModule } from 'libs/common/src/pagination/pagination.module';
import { JwtStrategy } from 'libs/access/src/strategies/jwt.strategy'; 

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Admin]),
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
  providers: [AdminService, JwtStrategy],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
