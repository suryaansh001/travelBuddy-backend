import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
// All chat routes require authentication
router.use(authenticate);
// Get all my chat rooms
router.get('/rooms', chatController.getMyChatRooms);
// Get/create chat room for a trip
router.get('/trip/:tripId', chatController.getChatRoom);
// Get messages from a room
router.get('/rooms/:roomId/messages', chatController.getMessages);
// Get unread count for a room
router.get('/rooms/:roomId/unread', chatController.getUnreadCount);
// Send message to a room
router.post('/rooms/:roomId/messages', chatController.sendMessage);
// Mark messages as read
router.put('/rooms/:roomId/read', chatController.markAsRead);
// Delete a message
router.delete('/rooms/:roomId/messages/:messageId', chatController.deleteMessage);
// Flag a message
router.post('/rooms/:roomId/messages/:messageId/flag', chatController.flagMessage);
export default router;
//# sourceMappingURL=chat.routes.js.map