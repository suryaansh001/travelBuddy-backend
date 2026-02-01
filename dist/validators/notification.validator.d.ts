import { z } from 'zod';
export declare const NOTIFICATION_TYPES: readonly ["swipe_received", "match_confirmed", "trip_update", "trip_cancelled", "chat_message", "review_reminder", "payment_reminder", "safety_alert"];
export declare const getNotificationsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    unreadOnly: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
    type: z.ZodOptional<z.ZodEnum<{
        chat_message: "chat_message";
        swipe_received: "swipe_received";
        match_confirmed: "match_confirmed";
        trip_update: "trip_update";
        trip_cancelled: "trip_cancelled";
        review_reminder: "review_reminder";
        payment_reminder: "payment_reminder";
        safety_alert: "safety_alert";
    }>>;
}, z.core.$strip>;
export declare const markReadSchema: z.ZodObject<{
    notificationId: z.ZodString;
}, z.core.$strip>;
export declare const markMultipleReadSchema: z.ZodObject<{
    notificationIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const deleteNotificationSchema: z.ZodObject<{
    notificationId: z.ZodString;
}, z.core.$strip>;
export declare const registerPushTokenSchema: z.ZodObject<{
    token: z.ZodString;
    platform: z.ZodEnum<{
        ios: "ios";
        android: "android";
        web: "web";
    }>;
    deviceId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updatePreferencesSchema: z.ZodObject<{
    pushEnabled: z.ZodOptional<z.ZodBoolean>;
    emailEnabled: z.ZodOptional<z.ZodBoolean>;
    swipeNotifications: z.ZodOptional<z.ZodBoolean>;
    matchNotifications: z.ZodOptional<z.ZodBoolean>;
    chatNotifications: z.ZodOptional<z.ZodBoolean>;
    tripNotifications: z.ZodOptional<z.ZodBoolean>;
    reviewReminders: z.ZodOptional<z.ZodBoolean>;
    paymentReminders: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type GetNotificationsInput = z.infer<typeof getNotificationsSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type RegisterPushTokenInput = z.infer<typeof registerPushTokenSchema>;
//# sourceMappingURL=notification.validator.d.ts.map