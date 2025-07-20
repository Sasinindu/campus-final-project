import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Request, Response } from 'express';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fileService from '../services/fileService';
import { ResponseUtil } from '../utils/responseUtil';
import { CustomException } from '../exception/CustomException';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export default class FileController {
  static async downloadPdfFile(req: Request, res: Response): Promise<void> {
    const { fileName } = req.params;

    if (!fileName.trim()) {
      ResponseUtil.errorResponse(
        res,
        CustomException.UNKNOWN,
        'Invalid or missing fileName',
      );
      return;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${fileName}`,
      });

      const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes validity
      res.json({ url });
    } catch (error: any) {
      FileController.handleError(error, res);
    }
  }

  static async deleteUploadedFile(req: Request, res: Response): Promise<void> {
    const { fileName } = req.params;

    try {
      await fileService.deleteFile(fileName);
      ResponseUtil.successResponse(
        res,
        `File ${fileName} deleted successfully`,
      );
    } catch (error: any) {
      FileController.handleError(error, res);
    }
  }

  static async getPresignedUrl(req: Request, res: Response): Promise<void> {
    const { fileName, fileType } = req.body;
    const uploadId = uuidv4();

    if (!fileName.trim()) {
      return ResponseUtil.errorResponse(
        res,
        CustomException.UNKNOWN,
        'Invalid or missing fileName',
      );
    }

    const s3key = FileController.generateS3Key(fileType, uploadId, fileName);

    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: s3key,
        ContentType: fileType,
      };

      const command = new PutObjectCommand(params);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      res.json({ url, s3key });
    } catch (error: any) {
      FileController.handleError(error, res);
    }
  }

  private static generateS3Key(
    fileType: string,
    uploadId: string,
    fileName: string,
  ): string {
    switch (true) {
      case fileType === 'application/pdf':
        return `pdf-files/${uploadId}-${fileName}`;
      case fileType.startsWith('image/'):
        return `image-files/${uploadId}-${fileName}`;
      case fileType === 'application/msword' ||
        fileType ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return `word-files/${uploadId}-${fileName}`;
      default:
        return `video-files/${uploadId}-${fileName}`;
    }
  }

  private static handleError(error: any, res: Response): void {
    if (error instanceof CustomException) {
      ResponseUtil.customErrorResponse(res, error);
    } else {
      ResponseUtil.errorResponse(res, CustomException.UNKNOWN, error.message);
    }
  }
}
