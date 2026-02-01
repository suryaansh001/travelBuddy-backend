import type { TrackEventInput, GetTrendingRoutesInput, SuggestTripsInput, PlatformAnalyticsInput, CollegeLeaderboardInput, UserBehaviorInsightsInput } from '../validators/analytics.validator.js';
export declare const trackEvent: (userId: string, data: TrackEventInput) => Promise<{
    tracked: boolean;
}>;
export declare const getTrendingRoutes: (params: GetTrendingRoutesInput) => Promise<{
    routes: Array<{
        originCity: string;
        destinationCity: string;
        tripCount: number;
        avgFare: number | null;
        popularTimes: string[];
    }>;
}>;
export declare const suggestTrips: (userId: string, params: SuggestTripsInput) => Promise<{
    suggestions: Array<{
        trip: {
            id: string;
            originCity: string;
            destinationCity: string;
            departureDate: Date;
            type: string;
            creator: {
                fullName: string;
                trustScore: number;
            };
        };
        score: number;
        reasons: string[];
    }>;
}>;
export declare const getUserMatchingScore: (userId: string, targetUserId: string) => Promise<{
    score: number;
    breakdown: {
        college: number;
        department: number;
        year: number;
        interests: number;
        trust: number;
        history: number;
    };
    compatibility: "low" | "medium" | "high" | "excellent";
}>;
export declare const getPlatformAnalytics: (params: PlatformAnalyticsInput) => Promise<{
    summary: {
        totalUsers: number;
        activeUsers: number;
        totalTrips: number;
        openTrips: number;
        completedTrips: number;
        totalMatches: number;
        successfulMatches: number;
        totalReviews: number;
        avgRating: number;
        pendingReports: number;
    };
    growth: {
        users: {
            period: string;
            count: number;
        }[];
        trips: {
            period: string;
            count: number;
        }[];
    };
}>;
export declare const getCollegeLeaderboard: (params: CollegeLeaderboardInput) => Promise<{
    leaderboard: Array<{
        rank: number;
        userId: string;
        fullName: string;
        profilePhotoUrl: string | null;
        collegeName: string;
        value: number;
    }>;
}>;
export declare const getUserBehaviorInsights: (userId: string, params: UserBehaviorInsightsInput) => Promise<{
    tripPatterns: {
        preferredDays: string[];
        preferredTimes: string[];
        topRoutes: Array<{
            origin: string;
            destination: string;
            count: number;
        }>;
    };
    socialMetrics: {
        totalMatches: number;
        acceptRate: number;
        avgResponseTime: number | null;
        repeatConnections: number;
    };
    engagement: {
        tripsCreated: number;
        tripsJoined: number;
        reviewsGiven: number;
        reviewsReceived: number;
        avgRatingGiven: number;
        avgRatingReceived: number;
    };
}>;
//# sourceMappingURL=analytics.service.d.ts.map