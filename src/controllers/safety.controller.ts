import type { Request, Response, NextFunction } from 'express';
import { safetyService } from '../services/safety.service.js';
import {
  createReportSchema,
  getMyReportsSchema,
  blockUserSchema,
  unblockUserSchema,
  addEmergencyContactSchema,
  updateEmergencyContactSchema,
  deleteEmergencyContactSchema,
  getBlockedUsersSchema,
  triggerSOSSchema,
} from '../validators/safety.validator.js';

class SafetyController {
  // Create a safety report
  async createReport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = createReportSchema.parse(req.body);

      const report = await safetyService.createReport(userId, data);
      res.status(201).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  // Get my reports
  async getMyReports(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit } = getMyReportsSchema.parse(req.query);

      const result = await safetyService.getMyReports(userId, { page, limit });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Block a user
  async blockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = blockUserSchema.parse(req.body);

      const result = await safetyService.blockUser(userId, data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Unblock a user
  async unblockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { blockedUserId } = unblockUserSchema.parse({
        blockedUserId: req.params.userId,
      });

      const result = await safetyService.unblockUser(userId, blockedUserId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Get blocked users
  async getBlockedUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit } = getBlockedUsersSchema.parse(req.query);

      const result = await safetyService.getBlockedUsers(userId, { page, limit });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Add emergency contact
  async addEmergencyContact(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = addEmergencyContactSchema.parse(req.body);

      const contact = await safetyService.addEmergencyContact(userId, data);
      res.status(201).json({ success: true, data: contact });
    } catch (error) {
      next(error);
    }
  }

  // Update emergency contact
  async updateEmergencyContact(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { contactId, ...data } = updateEmergencyContactSchema.parse({
        contactId: req.params.contactId,
        ...req.body,
      });

      const contact = await safetyService.updateEmergencyContact(userId, contactId, data);
      res.json({ success: true, data: contact });
    } catch (error) {
      next(error);
    }
  }

  // Delete emergency contact
  async deleteEmergencyContact(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { contactId } = deleteEmergencyContactSchema.parse({
        contactId: req.params.contactId,
      });

      const result = await safetyService.deleteEmergencyContact(userId, contactId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Get emergency contacts
  async getEmergencyContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const result = await safetyService.getEmergencyContacts(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Trigger SOS
  async triggerSOS(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = triggerSOSSchema.parse(req.body);

      const result = await safetyService.triggerSOS(userId, data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const safetyController = new SafetyController();
