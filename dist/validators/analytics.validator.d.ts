import { z } from 'zod';
export declare const trackEventSchema: z.ZodObject<{
    eventType: z.ZodString;
    eventData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    referrer: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const getTrendingRoutesSchema: z.ZodObject<{
    collegeDomain: z.ZodOptional<z.ZodString>;
    days: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const suggestTripsSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    includeReasons: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export declare const platformAnalyticsSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    endDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    metrics: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        matches: "matches";
        reviews: "reviews";
        trips: "trips";
        reports: "reports";
        users: "users";
    }>>>;
}, z.core.$strip>;
export declare const collegeLeaderboardSchema: z.ZodObject<{
    collegeDomain: z.ZodOptional<z.ZodString>;
    metric: z.ZodDefault<z.ZodEnum<{
        trustScore: "trustScore";
        reviews: "reviews";
        trips: "trips";
    }>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const userBehaviorInsightsSchema: z.ZodObject<{
    period: z.ZodDefault<z.ZodEnum<{
        year: "year";
        week: "week";
        month: "month";
        quarter: "quarter";
    }>>;
}, z.core.$strip>;
export type TrackEventInput = z.infer<typeof trackEventSchema>;
export type GetTrendingRoutesInput = z.infer<typeof getTrendingRoutesSchema>;
export type SuggestTripsInput = z.infer<typeof suggestTripsSchema>;
export type PlatformAnalyticsInput = z.infer<typeof platformAnalyticsSchema>;
export type CollegeLeaderboardInput = z.infer<typeof collegeLeaderboardSchema>;
export type UserBehaviorInsightsInput = z.infer<typeof userBehaviorInsightsSchema>;
//# sourceMappingURL=analytics.validator.d.ts.map