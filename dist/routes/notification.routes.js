import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
// All notification routes require authentication
router.use(authenticate);
// Get notifications
router.get('/', notificationController.getNotifications);
// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);
// Mark single as read
router.put('/:notificationId/read', notificationController.markAsRead);
// Mark multiple as read
router.put('/read', notificationController.markMultipleAsRead);
// Mark all as read
router.put('/read-all', notificationController.markAllAsRead);
// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);
// Delete all read notifications
router.delete('/read', notificationController.deleteAllRead);
export default router;
//# sourceMappingURL=notification.routes.js.map