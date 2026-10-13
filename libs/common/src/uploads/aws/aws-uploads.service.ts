import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fileTypeFromBuffer } from "file-type";
import { InjectRepository } from "@nestjs/typeorm";
import { Settings } from "libs/database/src/entities/settings.entity";
import { Repository } from "typeorm";

@Injectable()
export class AwsUploadService {
  private s3: S3Client | null = null;

  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>
  ) {}

  private async getS3Client(): Promise<S3Client> {
    if (this.s3) return this.s3;

    const settings = await this.settingsRepository.find({
      order: { id: "ASC" },
      take: 1,
    }).then(res => res[0]);

    if (
      !settings?.awsAccessKeyId ||
      !settings?.awsSecretAccessKey ||
      !settings?.awsRegion
    ) {
      throw new InternalServerErrorException(
        "AWS credentials not configured in settings"
      );
    }

    this.s3 = new S3Client({
      region: settings.awsRegion,
      credentials: {
        accessKeyId: settings.awsAccessKeyId,
        secretAccessKey: settings.awsSecretAccessKey,
      },
    });

    return this.s3;
  }

  async uploadFile(file: Express.Multer.File, folder = "uploads"): Promise<string> {
    if (!file) throw new InternalServerErrorException("No file provided");
    let contentType = file.mimetype || "application/octet-stream";
    if (file.buffer) {
      const type = await fileTypeFromBuffer(file.buffer);
      if (type) contentType = type.mime;
    }

    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.originalname}`;

    try {
      const s3 = await this.getS3Client();

      const settings = await this.settingsRepository.find({
        order: { id: "ASC" },
        take: 1,
      }).then(res => res[0]);

      await s3.send(
        new PutObjectCommand({
          Bucket: settings?.awsBucketName!,
          Key: key,
          Body: file.buffer,
          ContentType: contentType,
          //ACL: 'public-read'
        }),
      );
      return key;
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new InternalServerErrorException("Failed to upload file");
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const s3 = await this.getS3Client();

      const settings = await this.settingsRepository.find({
        order: { id: "ASC" },
        take: 1,
      }).then(res => res[0]);

      return await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: settings?.awsBucketName!,
          Key: key,
        }),
        { expiresIn },
      );
    } catch (error) {
      console.error("S3 signed URL error:", error);
      throw new InternalServerErrorException("Failed to get signed URL");
    }
  }
}
