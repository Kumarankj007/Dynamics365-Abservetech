import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { CommissionService } from './commission.service';
import { CommissionController } from './commission.controller';
import { PaginationModule } from 'libs/common/src/pagination/pagination.module';
import { JwtStrategy } from 'libs/access/src/strategies/jwt.strategy'; 
import { Commission } from 'libs/database/src/entities/commission.entity';
import { User } from 'libs/database/src/entities/user.entity'

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Commission, User]),
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
  providers: [CommissionService, JwtStrategy],
  controllers: [CommissionController],
  exports: [CommissionService],
})
export class CommissionModule {}
