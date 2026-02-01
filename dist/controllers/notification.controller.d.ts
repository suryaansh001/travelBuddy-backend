import type { Request, Response, NextFunction } from 'express';
declare class NotificationController {
    getNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void>;
    markAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    markMultipleAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteAllRead(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const notificationController: NotificationController;
export {};
//# sourceMappingURL=notification.controller.d.ts.map