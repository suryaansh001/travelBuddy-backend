import { z } from 'zod';

// 9.1 Track Event
export const trackEventSchema = z.object({
  eventType: z.string().min(1).max(100),
  eventData: z.record(z.string(), z.any()).optional(),
  referrer: z.string().max(500).optional(),
});

// 9.2 Get Trending Routes
export const getTrendingRoutesSchema = z.object({
  collegeDomain: z.string().optional(),
  days: z.coerce.number().int().min(1).max(90).default(7),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// 9.3 Suggest Trips
export const suggestTripsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  includeReasons: z.coerce.boolean().default(false),
});

// 9.5 Platform Analytics (Admin)
export const platformAnalyticsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  metrics: z.array(z.enum(['users', 'trips', 'matches', 'reviews', 'reports'])).optional(),
});

// 9.6 College Leaderboard
export const collegeLeaderboardSchema = z.object({
  collegeDomain: z.string().optional(),
  metric: z.enum(['trips', 'reviews', 'trustScore']).default('trips'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// 9.7 User Behavior Insights
export const userBehaviorInsightsSchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
});

export type TrackEventInput = z.infer<typeof trackEventSchema>;
export type GetTrendingRoutesInput = z.infer<typeof getTrendingRoutesSchema>;
export type SuggestTripsInput = z.infer<typeof suggestTripsSchema>;
export type PlatformAnalyticsInput = z.infer<typeof platformAnalyticsSchema>;
export type CollegeLeaderboardInput = z.infer<typeof collegeLeaderboardSchema>;
export type UserBehaviorInsightsInput = z.infer<typeof userBehaviorInsightsSchema>;
