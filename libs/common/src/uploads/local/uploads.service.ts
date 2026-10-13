import { Injectable } from "@nestjs/common";

@Injectable()
export class UploadService {
  getUploadPath(filename: string): string {
    return `/uploads/${filename}`;
  }
}
