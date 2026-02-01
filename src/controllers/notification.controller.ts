import type { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';
import {
  getNotificationsSchema,
  markReadSchema,
  markMultipleReadSchema,
  deleteNotificationSchema,
} from '../validators/notification.validator.js';

class NotificationController {
  // Get notifications
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const options = getNotificationsSchema.parse(req.query);

      const result = await notificationService.getNotifications(userId, options);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Get unread count
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const result = await notificationService.getUnreadCount(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Mark single notification as read
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { notificationId } = markReadSchema.parse({
        notificationId: req.params.notificationId,
      });

      const result = await notificationService.markAsRead(userId, notificationId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { notificationIds } = markMultipleReadSchema.parse(req.body);

      const result = await notificationService.markMultipleAsRead(userId, notificationIds);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Mark all as read
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const result = await notificationService.markAllAsRead(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Delete notification
  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { notificationId } = deleteNotificationSchema.parse({
        notificationId: req.params.notificationId,
      });

      const result = await notificationService.deleteNotification(userId, notificationId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Delete all read notifications
  async deleteAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const result = await notificationService.deleteAllRead(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
