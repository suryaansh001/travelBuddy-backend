import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
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

class NotificationService {
  // 8.1 Create Notification
  async createNotification(data: CreateNotificationData) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        tripId: data.tripId,
        matchId: data.matchId,
        senderId: data.senderId,
        actionUrl: data.actionUrl,
      },
    });

    // In production, also send push notification here
    // await this.sendPushNotification(notification);

    return notification;
  }

  // 8.2 Get Notifications
  async getNotifications(
    userId: string,
    options: GetNotificationsInput
  ) {
    const where: any = { userId };

    if (options.unreadOnly) {
      where.isRead = false;
    }

    if (options.type) {
      where.type = options.type;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        tripId: n.tripId,
        matchId: n.matchId,
        senderId: n.senderId,
        actionUrl: n.actionUrl,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  }

  // 8.3 Get Unread Count
  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  // 8.4 Mark as Read
  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return { message: 'Notification marked as read' };
  }

  // 8.5 Mark Multiple as Read
  async markMultipleAsRead(userId: string, notificationIds: string[]) {
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId,
      },
      data: { isRead: true },
    });

    return { updatedCount: result.count };
  }

  // 8.6 Mark All as Read
  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { updatedCount: result.count };
  }

  // 8.7 Delete Notification
  async deleteNotification(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: 'Notification deleted' };
  }

  // 8.8 Delete All Read Notifications
  async deleteAllRead(userId: string) {
    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    return { deletedCount: result.count };
  }

  // Helper: Send notification for swipe received
  async notifySwipeReceived(tripId: string, swiperId: string, tripCreatorId: string) {
    const [trip, swiper] = await Promise.all([
      prisma.trip.findUnique({ where: { id: tripId } }),
      prisma.user.findUnique({ where: { id: swiperId }, select: { fullName: true } }),
    ]);

    if (trip && swiper) {
      await this.createNotification({
        userId: tripCreatorId,
        type: 'swipe_received',
        title: 'New Interest',
        message: `${swiper.fullName} is interested in your trip to ${trip.destinationCity}`,
        tripId,
        senderId: swiperId,
        actionUrl: `/trips/${tripId}/requests`,
      });
    }
  }

  // Helper: Send notification for match confirmed
  async notifyMatchConfirmed(matchId: string, tripId: string, userId: string) {
    const [match, trip] = await Promise.all([
      prisma.match.findUnique({
        where: { id: matchId },
        include: {
          tripCreator: { select: { fullName: true } },
          matchedUser: { select: { fullName: true } },
        },
      }),
      prisma.trip.findUnique({ where: { id: tripId } }),
    ]);

    if (match && trip) {
      await this.createNotification({
        userId,
        type: 'match_confirmed',
        title: 'Match Confirmed!',
        message: `You're matched for the trip to ${trip.destinationCity}`,
        tripId,
        matchId,
        actionUrl: `/trips/${tripId}/chat`,
      });
    }
  }

  // Helper: Send notification for trip update
  async notifyTripUpdate(tripId: string, message: string) {
    // Get all participants (creator + accepted matches)
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        matches: {
          where: { status: 'accepted' },
          select: { matchedUserId: true },
        },
      },
    });

    if (!trip) return;

    const userIds = [trip.createdBy, ...trip.matches.map(m => m.matchedUserId)];

    for (const userId of userIds) {
      await this.createNotification({
        userId,
        type: 'trip_update',
        title: 'Trip Updated',
        message,
        tripId,
        actionUrl: `/trips/${tripId}`,
      });
    }
  }

  // Helper: Send notification for trip cancelled
  async notifyTripCancelled(tripId: string, cancelledBy: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        creator: { select: { fullName: true } },
        matches: {
          where: { status: 'accepted' },
          select: { matchedUserId: true },
        },
      },
    });

    if (!trip) return;

    // Notify all participants except the one who cancelled
    const userIds = [trip.createdBy, ...trip.matches.map(m => m.matchedUserId)]
      .filter(id => id !== cancelledBy);

    for (const userId of userIds) {
      await this.createNotification({
        userId,
        type: 'trip_cancelled',
        title: 'Trip Cancelled',
        message: `The trip to ${trip.destinationCity} has been cancelled`,
        tripId,
      });
    }
  }

  // Helper: Send review reminder
  async sendReviewReminder(userId: string, tripId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (trip) {
      await this.createNotification({
        userId,
        type: 'review_reminder',
        title: 'Share Your Experience',
        message: `How was your trip to ${trip.destinationCity}? Leave a review!`,
        tripId,
        actionUrl: `/trips/${tripId}/review`,
      });
    }
  }

  // Helper: Send payment reminder
  async sendPaymentReminder(userId: string, matchId: string, tripId: string, amount: number) {
    await this.createNotification({
      userId,
      type: 'payment_reminder',
      title: 'Payment Pending',
      message: `You have a pending payment of ₹${amount} for your trip`,
      tripId,
      matchId,
      actionUrl: `/trips/${tripId}/payment`,
    });
  }
}

export const notificationService = new NotificationService();
