import { Request, Response } from 'express';
import AttachmentService from '../services/attachmentService ';
import { ResponseUtil } from '../utils/responseUtil';
import {
  CustomException,
  InvalidInputException,
} from '../exception/CustomException';
import { AuthRequest } from '../middlewares/auth.middleware';

export default class AttachmentController {
  static async createAttachment(req: Request, res: Response) {
    try {
      const attachment = await AttachmentService.createAttachment(req.body);
      ResponseUtil.successResponse(
        res,
        attachment,
        'Attachment created successfully',
      );
    } catch (error: any) {
      if (error instanceof CustomException) {
        ResponseUtil.customErrorResponse(res, error);
      } else {
        ResponseUtil.errorResponse(res, CustomException.UNKNOWN, error.message);
      }
    }
  }

  static async getAttachment(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const attachment = await AttachmentService.getAttachment(id);
      ResponseUtil.successResponse(
        res,
        attachment,
        'Attachment retrieved successfully',
      );
    } catch (error: any) {
      if (error instanceof CustomException) {
        ResponseUtil.customErrorResponse(res, error);
      } else {
        ResponseUtil.errorResponse(res, CustomException.UNKNOWN, error.message);
      }
    }
  }

  static async getAttachments(req: Request, res: Response) {
    try {
      const attachments = await AttachmentService.getAttachments();
      ResponseUtil.successResponse(
        res,
        attachments,
        'Attachments retrieved successfully',
      );
    } catch (error: any) {
      if (error instanceof CustomException) {
        ResponseUtil.customErrorResponse(res, error);
      } else {
        ResponseUtil.errorResponse(res, CustomException.UNKNOWN, error.message);
      }
    }
  }

  static async getMediaAttachmentWithURL(req: Request, res: Response) {
    try {
      const { page, limit, fileDisplayName } = req.body;

      const result = await AttachmentService.getMediaAttachmentWithURL(
        page ? Number(page) : 1,
        limit ? Number(limit) : 10,
        fileDisplayName ? fileDisplayName : null,
      );

      return ResponseUtil.successResponse(res, result);
    } catch (error: any) {
      return ResponseUtil.errorResponse(
        res,
        error.code || CustomException.UNKNOWN,
        error.message,
      );
    }
  }

  static async updateAttachment(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const updatedAttachment = await AttachmentService.updateAttachment(
        id,
        req.body,
      );
      ResponseUtil.successResponse(
        res,
        updatedAttachment,
        'Attachment updated successfully',
      );
    } catch (error: any) {
      if (error instanceof CustomException) {
        ResponseUtil.customErrorResponse(res, error);
      } else {
        ResponseUtil.errorResponse(res, CustomException.UNKNOWN, error.message);
      }
    }
  }

  static async deleteAttachment(req: Request, res: Response) {
    try {
      const id = String(req.body.id);
      await AttachmentService.deleteAttachment(id);
      ResponseUtil.successResponse(
        res,
        null,
        'Attachment deleted successfully',
      );
    } catch (error: any) {
      if (error instanceof CustomException) {
        ResponseUtil.customErrorResponse(res, error);
      } else {
        ResponseUtil.errorResponse(res, CustomException.UNKNOWN, error.message);
      }
    }
  }

  static async getMediaAttachments(req: Request, res: Response) {
    try {
      const { page, limit, fileDisplayName } = req.body;

      const result = await AttachmentService.getMediaAttachments(
        page ? Number(page) : 1,
        limit ? Number(limit) : 10,
        fileDisplayName ? fileDisplayName : null,
      );

      return ResponseUtil.successResponse(res, result);
    } catch (error: any) {
      return ResponseUtil.errorResponse(
        res,
        error.code || CustomException.UNKNOWN,
        error.message,
      );
    }
  }


}
