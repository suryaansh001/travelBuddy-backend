import type { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service.js';
import {
  getChatRoomSchema,
  sendMessageSchema,
  getMessagesSchema,
  markReadSchema,
  deleteMessageSchema,
  flagMessageSchema,
  getMyChatRoomsSchema,
} from '../validators/chat.validator.js';

class ChatController {
  // Get or create chat room for a trip
  async getChatRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { tripId } = getChatRoomSchema.parse({ tripId: req.params.tripId });

      const chatRoom = await chatService.getOrCreateChatRoom(tripId, userId);
      res.json({ success: true, data: chatRoom });
    } catch (error) {
      next(error);
    }
  }

  // Send a message
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const roomId = req.params.roomId as string;
      const data = sendMessageSchema.parse(req.body);

      const message = await chatService.sendMessage(roomId, userId, data);
      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  }

  // Get messages with pagination
  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const roomId = req.params.roomId as string;
      const { cursor, limit } = getMessagesSchema.parse(req.query);

      const result = await chatService.getMessages(roomId, userId, { cursor, limit });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Mark messages as read
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const roomId = req.params.roomId as string;
      const { messageIds } = markReadSchema.parse(req.body);

      const result = await chatService.markMessagesAsRead(roomId, userId, messageIds);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Get unread count for a room
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const roomId = req.params.roomId as string;

      const result = await chatService.getUnreadCount(roomId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Delete a message
  async deleteMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { roomId, messageId } = deleteMessageSchema.parse({
        roomId: req.params.roomId,
        messageId: req.params.messageId,
      });

      const result = await chatService.deleteMessage(roomId, messageId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Flag a message
  async flagMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { roomId, messageId, reason } = flagMessageSchema.parse({
        roomId: req.params.roomId,
        messageId: req.params.messageId,
        reason: req.body.reason,
      });

      const result = await chatService.flagMessage(roomId, messageId, userId, reason);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Get all my chat rooms
  async getMyChatRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit } = getMyChatRoomsSchema.parse(req.query);

      const result = await chatService.getMyChatRooms(userId, { page, limit });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
