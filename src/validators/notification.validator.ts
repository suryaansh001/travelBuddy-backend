import { z } from 'zod';

// Notification types
export const NOTIFICATION_TYPES = [
  'swipe_received',
  'match_confirmed',
  'trip_update',
  'trip_cancelled',
  'chat_message',
  'review_reminder',
  'payment_reminder',
  'safety_alert',
] as const;

// Get notifications
export const getNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  unreadOnly: z.coerce.boolean().default(false),
  type: z.enum(NOTIFICATION_TYPES).optional(),
});

// Mark notification as read
export const markReadSchema = z.object({
  notificationId: z.string().uuid(),
});

// Mark multiple as read
export const markMultipleReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1).max(100),
});

// Delete notification
export const deleteNotificationSchema = z.object({
  notificationId: z.string().uuid(),
});

// Register push token (for mobile)
export const registerPushTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android', 'web']),
  deviceId: z.string().optional(),
});

// Notification preferences
export const updatePreferencesSchema = z.object({
  pushEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  swipeNotifications: z.boolean().optional(),
  matchNotifications: z.boolean().optional(),
  chatNotifications: z.boolean().optional(),
  tripNotifications: z.boolean().optional(),
  reviewReminders: z.boolean().optional(),
  paymentReminders: z.boolean().optional(),
});

export type GetNotificationsInput = z.infer<typeof getNotificationsSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type RegisterPushTokenInput = z.infer<typeof registerPushTokenSchema>;
