import { z } from 'zod';
export declare const moderateUserSchema: z.ZodObject<{
    action: z.ZodEnum<{
        warn: "warn";
        verify: "verify";
        block: "block";
        unblock: "unblock";
        unverify: "unverify";
    }>;
    reason: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const reviewReportsSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        investigating: "investigating";
        resolved: "resolved";
        dismissed: "dismissed";
    }>>;
    type: z.ZodOptional<z.ZodEnum<{
        user: "user";
        trip: "trip";
        chat_message: "chat_message";
    }>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodDefault<z.ZodEnum<{
        type: "type";
        createdAt: "createdAt";
        status: "status";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export declare const updateReportStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        investigating: "investigating";
        resolved: "resolved";
        dismissed: "dismissed";
    }>;
    adminNotes: z.ZodOptional<z.ZodString>;
    actionTaken: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const bulkActionSchema: z.ZodObject<{
    userIds: z.ZodArray<z.ZodString>;
    action: z.ZodEnum<{
        verify: "verify";
        block: "block";
        unblock: "unblock";
        unverify: "unverify";
        sendNotification: "sendNotification";
    }>;
    reason: z.ZodOptional<z.ZodString>;
    notificationMessage: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const contentModerationSearchSchema: z.ZodObject<{
    contentType: z.ZodEnum<{
        message: "message";
        trip: "trip";
    }>;
    query: z.ZodOptional<z.ZodString>;
    flagged: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const moderateContentSchema: z.ZodObject<{
    action: z.ZodEnum<{
        approve: "approve";
        remove: "remove";
        flag: "flag";
    }>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const systemLogsSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    endDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    eventType: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const addCollegeWhitelistSchema: z.ZodObject<{
    collegeDomain: z.ZodString;
    collegeName: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updateCollegeWhitelistSchema: z.ZodObject<{
    collegeName: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const collegeWhitelistQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type ModerateUserInput = z.infer<typeof moderateUserSchema>;
export type ReviewReportsInput = z.infer<typeof reviewReportsSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
export type BulkActionInput = z.infer<typeof bulkActionSchema>;
export type ContentModerationSearchInput = z.infer<typeof contentModerationSearchSchema>;
export type ModerateContentInput = z.infer<typeof moderateContentSchema>;
export type SystemLogsInput = z.infer<typeof systemLogsSchema>;
export type AddCollegeWhitelistInput = z.infer<typeof addCollegeWhitelistSchema>;
export type UpdateCollegeWhitelistInput = z.infer<typeof updateCollegeWhitelistSchema>;
export type CollegeWhitelistQueryInput = z.infer<typeof collegeWhitelistQuerySchema>;
//# sourceMappingURL=admin.validator.d.ts.map