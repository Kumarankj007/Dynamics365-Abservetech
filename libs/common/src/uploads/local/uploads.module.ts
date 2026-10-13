import { Module, Global } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { UploadService } from "./uploads.service";
import { diskStorage } from "multer";
import { extname } from "path";
import { existsSync, mkdirSync } from "fs";

@Global()
@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadPath = './uploads';
            if (!existsSync(uploadPath)) {
              mkdirSync(uploadPath, { recursive: true });
            }

            cb(null, uploadPath);
          },
          filename: (req, file, cb) => {
            const filename = `${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}${extname(file.originalname)}`;
            cb(null, filename);
          },
        }),
      }),
    }),
  ],
  providers: [UploadService],
  exports: [MulterModule, UploadService],
})
export class UploadsModule {}
