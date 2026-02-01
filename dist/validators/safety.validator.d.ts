import { z } from 'zod';
export declare const REPORT_TYPES: readonly ["user", "trip", "chat_message"];
export declare const REPORT_REASONS: readonly ["harassment", "inappropriate_content", "spam", "fake_profile", "safety_concern", "payment_issue", "no_show", "other"];
export declare const createReportSchema: z.ZodObject<{
    type: z.ZodEnum<{
        user: "user";
        trip: "trip";
        chat_message: "chat_message";
    }>;
    reportedUserId: z.ZodOptional<z.ZodString>;
    reportedTripId: z.ZodOptional<z.ZodString>;
    reportedMessageId: z.ZodOptional<z.ZodString>;
    reason: z.ZodEnum<{
        other: "other";
        harassment: "harassment";
        inappropriate_content: "inappropriate_content";
        spam: "spam";
        fake_profile: "fake_profile";
        safety_concern: "safety_concern";
        payment_issue: "payment_issue";
        no_show: "no_show";
    }>;
    description: z.ZodString;
    evidenceUrls: z.ZodDefault<z.ZodArray<z.ZodString>>;
    isEmergency: z.ZodDefault<z.ZodBoolean>;
    emergencyLocation: z.ZodOptional<z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        address: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const getMyReportsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const blockUserSchema: z.ZodObject<{
    blockedUserId: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const unblockUserSchema: z.ZodObject<{
    blockedUserId: z.ZodString;
}, z.core.$strip>;
export declare const addEmergencyContactSchema: z.ZodObject<{
    name: z.ZodString;
    phoneNumber: z.ZodString;
    relationship: z.ZodOptional<z.ZodString>;
    isPrimary: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updateEmergencyContactSchema: z.ZodObject<{
    contactId: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    relationship: z.ZodOptional<z.ZodString>;
    isPrimary: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const deleteEmergencyContactSchema: z.ZodObject<{
    contactId: z.ZodString;
}, z.core.$strip>;
export declare const getBlockedUsersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const triggerSOSSchema: z.ZodObject<{
    tripId: z.ZodOptional<z.ZodString>;
    location: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        address: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type BlockUserInput = z.infer<typeof blockUserSchema>;
export type AddEmergencyContactInput = z.infer<typeof addEmergencyContactSchema>;
export type UpdateEmergencyContactInput = z.infer<typeof updateEmergencyContactSchema>;
export type TriggerSOSInput = z.infer<typeof triggerSOSSchema>;
//# sourceMappingURL=safety.validator.d.ts.map