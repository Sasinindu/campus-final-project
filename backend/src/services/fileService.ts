import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { CustomException } from '../exception/CustomException';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

class FileService {
  static async getSignedUrl(fileKey: string): Promise<string> {
    if (!fileKey) {
      throw new Error('File key is required to generate signed URL');
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    return await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour
  }
  static async deleteFile(fileKey: string): Promise<void> {
    if (!fileKey || !fileKey.trim()) {
      throw new CustomException('Invalid or missing fileKey');
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
      });
      await s3.send(command);
    } catch (error: any) {
      throw new CustomException(error.message);
    }
  }
}

export default FileService;
