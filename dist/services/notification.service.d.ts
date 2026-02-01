import type { GetNotificationsInput } from '../validators/notification.validator.js';
type NotificationType = 'swipe_received' | 'match_confirmed' | 'trip_update' | 'trip_cancelled' | 'chat_message' | 'review_reminder' | 'payment_reminder' | 'safety_alert';
interface CreateNotificationData {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    tripId?: string;
    matchId?: string;
    senderId?: string;
    actionUrl?: string;
}
declare class NotificationService {
    createNotification(data: CreateNotificationData): Promise<{
        type: import("@prisma/client").$Enums.NotificationType;
        message: string;
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        tripId: string | null;
        senderId: string | null;
        matchId: string | null;
        actionUrl: string | null;
        isRead: boolean;
        isSent: boolean;
        sentAt: Date | null;
    }>;
    getNotifications(userId: string, options: GetNotificationsInput): Promise<{
        notifications: {
            id: string;
            type: import("@prisma/client").$Enums.NotificationType;
            title: string;
            message: string;
            tripId: string | null;
            matchId: string | null;
            senderId: string | null;
            actionUrl: string | null;
            isRead: boolean;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
    markAsRead(userId: string, notificationId: string): Promise<{
        message: string;
    }>;
    markMultipleAsRead(userId: string, notificationIds: string[]): Promise<{
        updatedCount: number;
    }>;
    markAllAsRead(userId: string): Promise<{
        updatedCount: number;
    }>;
    deleteNotification(userId: string, notificationId: string): Promise<{
        message: string;
    }>;
    deleteAllRead(userId: string): Promise<{
        deletedCount: number;
    }>;
    notifySwipeReceived(tripId: string, swiperId: string, tripCreatorId: string): Promise<void>;
    notifyMatchConfirmed(matchId: string, tripId: string, userId: string): Promise<void>;
    notifyTripUpdate(tripId: string, message: string): Promise<void>;
    notifyTripCancelled(tripId: string, cancelledBy: string): Promise<void>;
    sendReviewReminder(userId: string, tripId: string): Promise<void>;
    sendPaymentReminder(userId: string, matchId: string, tripId: string, amount: number): Promise<void>;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=notification.service.d.ts.map