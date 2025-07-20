import { AppDataSource } from '../config/database';
import { Attachment } from '../entities/Attachment';
import { User } from '../entities/User';
import {
  DoesNotExistException,
  InvalidInputException,
} from '../exception/CustomException';
import FileService from './fileService';

const attachmentRepository = AppDataSource.getRepository(Attachment);
const userRepository = AppDataSource.getRepository(User);

export default class AttachmentService {
  static async createAttachment(
    attachmentData: Partial<Attachment>,
  ): Promise<Attachment> {
    if (attachmentData.fileType) {
      const fileType = attachmentData.fileType.toLowerCase();
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
      if (allowedTypes.includes(fileType)) {
        attachmentData.isMediaFile = true;
      }
    }
    const attachment = attachmentRepository.create(attachmentData);
    return await attachmentRepository.save(attachment);
  }

  static async getAttachment(idInput: number): Promise<Attachment> {
    const id = Number(idInput);
    if (isNaN(id)) {
      throw new InvalidInputException('Invalid attachment ID provided');
    }
    const attachment = await attachmentRepository.findOne({ where: { id } });
    if (!attachment) {
      throw new DoesNotExistException('Attachment not found');
    }
    return attachment;
  }

  static async getAttachments(): Promise<Attachment[]> {
    return await attachmentRepository.find();
  }

  static async getMediaAttachmentWithURL(
    page: number = 1,
    limit: number = 10,
    fileDisplayName?: string | null,
  ): Promise<{
    message: string;
    totalCount: number;
    page: number;
    limit: number;
    data: Attachment[];
  }> {
    const queryBuilder = attachmentRepository
      .createQueryBuilder('attachment')
      .where('attachment.isMediaFile = :isMediaFile', { isMediaFile: true });

    if (typeof fileDisplayName === 'string' && fileDisplayName.trim() !== '') {
      queryBuilder.andWhere(
        'attachment.fileDisplayName LIKE :fileDisplayName',
        {
          fileDisplayName: `%${fileDisplayName.trim()}%`,
        },
      );
    }

    const totalCount = await queryBuilder.getCount();

    const attachments = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    await Promise.all(
      attachments.map(async (attachment) => {
        attachment.signedUrl = await FileService.getSignedUrl(
          attachment.fileName,
        );
      }),
    );

    return {
      message: 'Media attachments retrieved successfully',
      totalCount,
      page,
      limit,
      data: attachments,
    };
  }

  static async updateAttachment(
    idInput: number,
    updateData: Partial<Attachment>,
  ): Promise<Attachment> {
    const id = Number(idInput);
    if (isNaN(id)) {
      throw new InvalidInputException('Invalid attachment ID provided');
    }
    const attachment = await attachmentRepository.findOne({ where: { id } });
    if (!attachment) {
      throw new DoesNotExistException('Attachment not found');
    }
    // Merge new values into the existing entity
    attachmentRepository.merge(attachment, updateData);
    return await attachmentRepository.save(attachment);
  }

  static async deleteAttachment(fileName: string): Promise<void> {
    if (!fileName) {
      throw new InvalidInputException('Invalid file name provided');
    }

    await FileService.deleteFile(fileName);

    const attachment = await attachmentRepository.findOne({
      where: { fileName: fileName },
    });
    if (!attachment) {
      throw new DoesNotExistException('Attachment not found');
    }
    await attachmentRepository.remove(attachment);
  }

  static async getMediaAttachments(
    page: number = 1,
    limit: number = 10,
    fileDisplayName?: string | null,
  ) {
    const queryBuilder = attachmentRepository
      .createQueryBuilder('attachment')
      .where('attachment.isMediaFile = :isMediaFile', { isMediaFile: true });

    if (typeof fileDisplayName === 'string' && fileDisplayName.trim() !== '') {
      queryBuilder.andWhere(
        'attachment.fileDisplayName LIKE :fileDisplayName',
        {
          fileDisplayName: `%${fileDisplayName.trim()}%`,
        },
      );
    }

    const totalCount = await queryBuilder.getCount();

    const attachments = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      message: 'Media attachments retrieved successfully',
      totalCount,
      page,
      limit,
      data: attachments,
    };
  }
}
