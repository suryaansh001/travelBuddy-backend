import { z } from 'zod';
// 10.1 Admin Dashboard Stats (already in analytics)
// 10.2 Moderate User
export const moderateUserSchema = z.object({
    action: z.enum(['block', 'unblock', 'warn', 'verify', 'unverify']),
    reason: z.string().min(10).max(1000).optional(),
    duration: z.number().int().positive().optional(), // for temporary blocks (days)
});
// 10.3 Review Reports
export const reviewReportsSchema = z.object({
    status: z.enum(['pending', 'investigating', 'resolved', 'dismissed']).optional(),
    type: z.enum(['user', 'trip', 'chat_message']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'status', 'type']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
// Update Report Status
export const updateReportStatusSchema = z.object({
    status: z.enum(['investigating', 'resolved', 'dismissed']),
    adminNotes: z.string().min(10).max(2000).optional(),
    actionTaken: z.string().max(500).optional(),
});
// 10.4 Bulk Actions
export const bulkActionSchema = z.object({
    userIds: z.array(z.string().uuid()).min(1).max(100),
    action: z.enum(['block', 'unblock', 'verify', 'unverify', 'sendNotification']),
    reason: z.string().min(10).max(1000).optional(),
    notificationMessage: z.string().max(500).optional(), // for sendNotification
});
// 10.5 Content Moderation - Search trips/messages
export const contentModerationSearchSchema = z.object({
    contentType: z.enum(['trip', 'message']),
    query: z.string().min(1).max(200).optional(),
    flagged: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});
// Moderate Content
export const moderateContentSchema = z.object({
    action: z.enum(['approve', 'remove', 'flag']),
    reason: z.string().min(10).max(1000).optional(),
});
// 10.6 System Logs (read-only, no input needed beyond filters)
export const systemLogsSchema = z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    eventType: z.string().optional(),
    userId: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
});
// 10.7 College Whitelist Management
export const addCollegeWhitelistSchema = z.object({
    collegeDomain: z.string().min(3).max(100).regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, 'Invalid domain format'),
    collegeName: z.string().min(2).max(255),
    isActive: z.boolean().default(true),
});
export const updateCollegeWhitelistSchema = z.object({
    collegeName: z.string().min(2).max(255).optional(),
    isActive: z.boolean().optional(),
});
export const collegeWhitelistQuerySchema = z.object({
    search: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
});
//# sourceMappingURL=admin.validator.js.map