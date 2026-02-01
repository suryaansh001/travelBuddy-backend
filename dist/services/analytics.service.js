import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';
// 9.1 Track Event - Store events in Redis for batch processing
export const trackEvent = async (userId, data) => {
    const event = {
        userId,
        eventType: data.eventType,
        eventData: data.eventData || {},
        referrer: data.referrer,
        timestamp: new Date().toISOString(),
    };
    // Store in Redis list for batch processing
    await redis.lPush('analytics:events', JSON.stringify(event));
    // Also update real-time counters
    const today = new Date().toISOString().split('T')[0];
    await redis.hincrby(`analytics:daily:${today}`, data.eventType, 1);
    // Set TTL of 90 days on daily counters
    await redis.expire(`analytics:daily:${today}`, 90 * 24 * 60 * 60);
    return { tracked: true };
};
// 9.2 Get Trending Routes
export const getTrendingRoutes = async (params) => {
    const { collegeDomain, days, limit } = params;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    // Build where clause
    const whereClause = {
        createdAt: { gte: startDate },
        status: { not: 'cancelled' },
    };
    if (collegeDomain) {
        whereClause.creator = { collegeDomain };
    }
    // Get route aggregations
    const routeStats = await prisma.trip.groupBy({
        by: ['originCity', 'destinationCity'],
        where: whereClause,
        _count: { id: true },
        _avg: { farePerPerson: true },
        orderBy: { _count: { id: 'desc' } },
        take: limit,
    });
    // Get popular departure times for top routes
    const routes = await Promise.all(routeStats.map(async (route) => {
        const trips = await prisma.trip.findMany({
            where: {
                ...whereClause,
                originCity: route.originCity,
                destinationCity: route.destinationCity,
            },
            select: { departureTime: true },
            take: 100,
        });
        // Aggregate departure times into buckets
        const timeHours = trips.map((t) => t.departureTime.getHours());
        const timeBuckets = {};
        timeHours.forEach((h) => {
            const bucket = h < 6 ? 'early_morning' : h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 21 ? 'evening' : 'night';
            timeBuckets[bucket] = (timeBuckets[bucket] || 0) + 1;
        });
        const popularTimes = Object.entries(timeBuckets)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([time]) => time);
        return {
            originCity: route.originCity,
            destinationCity: route.destinationCity,
            tripCount: route._count.id,
            avgFare: route._avg.farePerPerson ? Number(route._avg.farePerPerson) : null,
            popularTimes,
        };
    }));
    return { routes };
};
// 9.3 Suggest Trips - Personalized recommendations
export const suggestTrips = async (userId, params) => {
    const { limit, includeReasons } = params;
    // Get user profile and history
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            interests: true,
            matchesAsCreator: { take: 20, orderBy: { matchedAt: 'desc' } },
            matchesAsUser: { take: 20, orderBy: { matchedAt: 'desc' } },
        },
    });
    if (!user)
        throw new Error('User not found');
    // Get user's past trip cities
    const userTrips = await prisma.trip.findMany({
        where: {
            OR: [
                { createdBy: userId },
                { matches: { some: { matchedUserId: userId, status: 'accepted' } } },
            ],
        },
        select: { originCity: true, destinationCity: true },
        take: 50,
    });
    const userCities = new Set([
        ...userTrips.map((t) => t.originCity),
        ...userTrips.map((t) => t.destinationCity),
    ]);
    // Get available trips with creator interests
    const trips = await prisma.trip.findMany({
        where: {
            status: 'open',
            isActive: true,
            departureDate: { gte: new Date() },
            createdBy: { not: userId },
            availableSeats: { gt: 0 },
            // Exclude already swiped
            NOT: { swipes: { some: { userId } } },
            // Gender preference
            OR: [
                { genderPreference: null },
                { genderPreference: user.gender },
            ],
        },
        include: {
            creator: {
                include: {
                    interests: true,
                },
            },
        },
        take: 100,
    });
    // Score each trip
    const scoredTrips = trips.map((trip) => {
        let score = 0;
        const reasons = [];
        // Same college bonus
        if (trip.creator.collegeDomain === user.collegeDomain) {
            score += 30;
            if (includeReasons)
                reasons.push('Same college');
        }
        // Same department bonus
        if (trip.creator.department && trip.creator.department === user.department) {
            score += 15;
            if (includeReasons)
                reasons.push('Same department');
        }
        // Similar year
        if (trip.creator.yearOfStudy && user.yearOfStudy) {
            const yearDiff = Math.abs(trip.creator.yearOfStudy - user.yearOfStudy);
            if (yearDiff <= 1) {
                score += 10;
                if (includeReasons)
                    reasons.push('Similar year');
            }
        }
        // Shared interests
        const userInterests = new Set(user.interests.map((i) => i.interest));
        const creatorInterests = trip.creator.interests.map((i) => i.interest);
        const sharedCount = creatorInterests.filter((i) => userInterests.has(i)).length;
        if (sharedCount > 0) {
            score += sharedCount * 8;
            if (includeReasons)
                reasons.push(`${sharedCount} shared interests`);
        }
        // Familiar route
        if (userCities.has(trip.originCity) || userCities.has(trip.destinationCity)) {
            score += 12;
            if (includeReasons)
                reasons.push('Familiar route');
        }
        // Creator trust score
        score += Number(trip.creator.trustScore) * 3;
        // Upcoming trips get higher scores
        const daysUntil = Math.ceil((trip.departureDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 3) {
            score += 10;
            if (includeReasons)
                reasons.push('Leaving soon');
        }
        else if (daysUntil <= 7) {
            score += 5;
        }
        return {
            trip: {
                id: trip.id,
                originCity: trip.originCity,
                destinationCity: trip.destinationCity,
                departureDate: trip.departureDate,
                type: trip.type,
                creator: {
                    fullName: trip.creator.fullName,
                    trustScore: Number(trip.creator.trustScore),
                },
            },
            score,
            reasons: includeReasons ? reasons : [],
        };
    });
    // Sort by score and return top results
    scoredTrips.sort((a, b) => b.score - a.score);
    return { suggestions: scoredTrips.slice(0, limit) };
};
// 9.4 User Matching Score
export const getUserMatchingScore = async (userId, targetUserId) => {
    const [user, target] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            include: { interests: true },
        }),
        prisma.user.findUnique({
            where: { id: targetUserId },
            include: { interests: true },
        }),
    ]);
    if (!user || !target)
        throw new Error('User not found');
    const breakdown = {
        college: 0,
        department: 0,
        year: 0,
        interests: 0,
        trust: 0,
        history: 0,
    };
    // College match (max 25)
    if (user.collegeDomain === target.collegeDomain) {
        breakdown.college = 25;
    }
    // Department match (max 15)
    if (user.department && user.department === target.department) {
        breakdown.department = 15;
    }
    // Year proximity (max 10)
    if (user.yearOfStudy && target.yearOfStudy) {
        const yearDiff = Math.abs(user.yearOfStudy - target.yearOfStudy);
        breakdown.year = Math.max(0, 10 - yearDiff * 3);
    }
    // Shared interests (max 20)
    const userInterests = new Set(user.interests.map((i) => i.interest));
    const sharedCount = target.interests.filter((i) => userInterests.has(i.interest)).length;
    breakdown.interests = Math.min(20, sharedCount * 5);
    // Trust score (max 15)
    breakdown.trust = Math.round(Number(target.trustScore) * 3);
    // Past positive interactions (max 15)
    const pastMatches = await prisma.match.count({
        where: {
            OR: [
                { tripCreatorId: userId, matchedUserId: targetUserId, status: 'accepted' },
                { tripCreatorId: targetUserId, matchedUserId: userId, status: 'accepted' },
            ],
        },
    });
    const pastReviews = await prisma.review.findMany({
        where: {
            OR: [
                { reviewerId: userId, reviewedUserId: targetUserId },
                { reviewerId: targetUserId, reviewedUserId: userId },
            ],
        },
        select: { overallRating: true },
    });
    if (pastMatches > 0 || pastReviews.length > 0) {
        const avgRating = pastReviews.length > 0
            ? pastReviews.reduce((sum, r) => sum + Number(r.overallRating), 0) / pastReviews.length
            : 0;
        breakdown.history = Math.min(15, pastMatches * 3 + Math.round(avgRating * 2));
    }
    const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
    const compatibility = score >= 80 ? 'excellent' : score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low';
    return { score, breakdown, compatibility };
};
// 9.5 Platform Analytics (Admin only)
export const getPlatformAnalytics = async (params) => {
    const { startDate, endDate } = params;
    const dateFilter = (startDate || endDate) ? {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
    } : undefined;
    // Aggregate counts
    const [totalUsers, activeUsers, totalTrips, openTrips, completedTrips, totalMatches, successfulMatches, totalReviews, avgRating, pendingReports,] = await Promise.all([
        prisma.user.count(dateFilter ? { where: { createdAt: dateFilter } } : undefined),
        prisma.user.count({ where: { isActive: true, ...(dateFilter && { createdAt: dateFilter }) } }),
        prisma.trip.count(dateFilter ? { where: { createdAt: dateFilter } } : undefined),
        prisma.trip.count({ where: { status: 'open' } }),
        prisma.trip.count({ where: { status: 'completed' } }),
        prisma.match.count(dateFilter ? { where: { matchedAt: dateFilter } } : undefined),
        prisma.match.count({ where: { status: 'accepted' } }),
        prisma.review.count(dateFilter ? { where: { createdAt: dateFilter } } : undefined),
        prisma.review.aggregate({ _avg: { overallRating: true } }),
        prisma.safetyReport.count({ where: { status: 'pending' } }),
    ]);
    // Get growth data (last 12 periods)
    const userGrowth = [];
    const tripGrowth = [];
    for (let i = 11; i >= 0; i--) {
        const periodStart = new Date();
        periodStart.setMonth(periodStart.getMonth() - i);
        periodStart.setDate(1);
        periodStart.setHours(0, 0, 0, 0);
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        const period = periodStart.toISOString().slice(0, 7); // YYYY-MM
        const [userCount, tripCount] = await Promise.all([
            prisma.user.count({
                where: { createdAt: { gte: periodStart, lt: periodEnd } },
            }),
            prisma.trip.count({
                where: { createdAt: { gte: periodStart, lt: periodEnd } },
            }),
        ]);
        userGrowth.push({ period, count: userCount });
        tripGrowth.push({ period, count: tripCount });
    }
    return {
        summary: {
            totalUsers,
            activeUsers,
            totalTrips,
            openTrips,
            completedTrips,
            totalMatches,
            successfulMatches,
            totalReviews,
            avgRating: avgRating._avg.overallRating ? Number(avgRating._avg.overallRating) : 0,
            pendingReports,
        },
        growth: {
            users: userGrowth,
            trips: tripGrowth,
        },
    };
};
// 9.6 College Leaderboard
export const getCollegeLeaderboard = async (params) => {
    const { collegeDomain, metric, limit } = params;
    let orderBy;
    switch (metric) {
        case 'trips':
            orderBy = { totalTripsCompleted: 'desc' };
            break;
        case 'trustScore':
            orderBy = { trustScore: 'desc' };
            break;
        case 'reviews':
        default:
            orderBy = { reviewsGiven: { _count: 'desc' } };
            break;
    }
    const users = await prisma.user.findMany({
        where: {
            isActive: true,
            isBlocked: false,
            ...(collegeDomain && { collegeDomain }),
        },
        select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
            collegeName: true,
            totalTripsCompleted: true,
            trustScore: true,
            _count: { select: { reviewsGiven: true } },
        },
        orderBy,
        take: limit,
    });
    const leaderboard = users.map((user, index) => ({
        rank: index + 1,
        userId: user.id,
        fullName: user.fullName,
        profilePhotoUrl: user.profilePhotoUrl,
        collegeName: user.collegeName,
        value: metric === 'trips'
            ? user.totalTripsCompleted
            : metric === 'trustScore'
                ? Number(user.trustScore)
                : user._count.reviewsGiven,
    }));
    return { leaderboard };
};
// 9.7 User Behavior Insights
export const getUserBehaviorInsights = async (userId, params) => {
    const { period } = params;
    const periodDays = { week: 7, month: 30, quarter: 90, year: 365 };
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays[period]);
    // Get user's trips
    const trips = await prisma.trip.findMany({
        where: {
            createdBy: userId,
            createdAt: { gte: startDate },
        },
        select: {
            departureDate: true,
            departureTime: true,
            originCity: true,
            destinationCity: true,
        },
    });
    // Analyze trip patterns
    const dayCount = {};
    const timeCount = {};
    const routeCount = {};
    trips.forEach((trip) => {
        const day = trip.departureDate.toLocaleDateString('en-US', { weekday: 'long' });
        dayCount[day] = (dayCount[day] || 0) + 1;
        const hour = trip.departureTime.getHours();
        const timeBucket = hour < 6 ? 'early_morning' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
        timeCount[timeBucket] = (timeCount[timeBucket] || 0) + 1;
        const route = `${trip.originCity}->${trip.destinationCity}`;
        routeCount[route] = (routeCount[route] || 0) + 1;
    });
    const preferredDays = Object.entries(dayCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([day]) => day);
    const preferredTimes = Object.entries(timeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([time]) => time);
    const topRoutes = Object.entries(routeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([route, count]) => {
        const [origin, destination] = route.split('->');
        return { origin, destination, count };
    });
    // Social metrics
    const matches = await prisma.match.findMany({
        where: {
            OR: [{ tripCreatorId: userId }, { matchedUserId: userId }],
            matchedAt: { gte: startDate },
        },
        select: { status: true, matchedAt: true, acceptedAt: true },
    });
    const totalMatches = matches.length;
    const acceptedMatches = matches.filter((m) => m.status === 'accepted').length;
    const acceptRate = totalMatches > 0 ? (acceptedMatches / totalMatches) * 100 : 0;
    // Count unique users matched multiple times
    const matchPartners = await prisma.match.groupBy({
        by: ['tripCreatorId', 'matchedUserId'],
        where: {
            OR: [{ tripCreatorId: userId }, { matchedUserId: userId }],
            status: 'accepted',
        },
        _count: { id: true },
    });
    const repeatConnections = matchPartners.filter((m) => m._count.id > 1).length;
    // Engagement metrics
    const [tripsCreated, joinedMatches, reviewsGiven, reviewsReceived] = await Promise.all([
        prisma.trip.count({ where: { createdBy: userId, createdAt: { gte: startDate } } }),
        prisma.match.count({ where: { matchedUserId: userId, status: 'accepted', matchedAt: { gte: startDate } } }),
        prisma.review.findMany({ where: { reviewerId: userId, createdAt: { gte: startDate } }, select: { overallRating: true } }),
        prisma.review.findMany({ where: { reviewedUserId: userId, createdAt: { gte: startDate } }, select: { overallRating: true } }),
    ]);
    const avgRatingGiven = reviewsGiven.length > 0
        ? reviewsGiven.reduce((sum, r) => sum + Number(r.overallRating), 0) / reviewsGiven.length
        : 0;
    const avgRatingReceived = reviewsReceived.length > 0
        ? reviewsReceived.reduce((sum, r) => sum + Number(r.overallRating), 0) / reviewsReceived.length
        : 0;
    return {
        tripPatterns: {
            preferredDays,
            preferredTimes,
            topRoutes,
        },
        socialMetrics: {
            totalMatches,
            acceptRate: Math.round(acceptRate * 10) / 10,
            avgResponseTime: null, // Would need message timestamps to calculate
            repeatConnections,
        },
        engagement: {
            tripsCreated,
            tripsJoined: joinedMatches,
            reviewsGiven: reviewsGiven.length,
            reviewsReceived: reviewsReceived.length,
            avgRatingGiven: Math.round(avgRatingGiven * 10) / 10,
            avgRatingReceived: Math.round(avgRatingReceived * 10) / 10,
        },
    };
};
//# sourceMappingURL=analytics.service.js.map