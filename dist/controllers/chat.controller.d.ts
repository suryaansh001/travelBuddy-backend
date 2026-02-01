import type { Request, Response, NextFunction } from 'express';
declare class ChatController {
    getChatRoom(req: Request, res: Response, next: NextFunction): Promise<void>;
    sendMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
    markAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
    flagMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyChatRooms(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const chatController: ChatController;
export {};
//# sourceMappingURL=chat.controller.d.ts.map