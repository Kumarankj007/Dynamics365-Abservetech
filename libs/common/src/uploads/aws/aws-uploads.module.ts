import { Module, Global } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { AwsUploadService } from "./aws-uploads.service";
import { memoryStorage } from "multer";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Settings } from "libs/database/src/entities/settings.entity";

@Global()
@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(), 
    }),
    TypeOrmModule.forFeature([Settings])
  ],
  providers: [AwsUploadService],
  exports: [MulterModule, AwsUploadService],
})
export class AwsUploadsModule {}
