import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
export class SwipeService {
    // 4.1 Swipe on Trip
    async swipeOnTrip(userId, tripId, direction, introductionMessage) {
        // Get trip with creator info
        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            select: {
                id: true,
                createdBy: true,
                status: true,
                availableSeats: true,
                type: true,
                farePerPerson: true,
            },
        });
        if (!trip) {
            throw new AppError('Trip not found', 404);
        }
        // Check user is not creator
        if (trip.createdBy === userId) {
            throw new AppError('Cannot swipe on your own trip', 400);
        }
        // Check trip is open
        if (trip.status !== 'open') {
            throw new AppError('This trip is no longer accepting participants', 400);
        }
        // Check available seats for right/super swipes
        if ((direction === 'right' || direction === 'super') && trip.availableSeats <= 0) {
            throw new AppError('This trip has no available seats', 400);
        }
        // Check if user is blocked by creator
        const blocked = await prisma.userBlock.findFirst({
            where: {
                OR: [
                    { blockerId: trip.createdBy, blockedId: userId },
                    { blockerId: userId, blockedId: trip.createdBy },
                ],
            },
        });
        if (blocked) {
            throw new AppError('You cannot interact with this trip', 403);
        }
        // Check if already swiped
        const existingSwipe = await prisma.swipe.findUnique({
            where: {
                tripId_userId: { tripId, userId },
            },
        });
        if (existingSwipe) {
            throw new AppError('You have already swiped on this trip', 400);
        }
        // Create swipe
        const swipe = await prisma.swipe.create({
            data: {
                tripId,
                userId,
                direction,
                introductionMessage: direction !== 'left' ? introductionMessage : null,
            },
        });
        // If right or super swipe, increment trip swipe count
        if (direction !== 'left') {
            await prisma.trip.update({
                where: { id: tripId },
                data: { swipeCount: { increment: 1 } },
            });
            // Check for existing creator swipe (mutual match)
            const creatorSwipe = await prisma.swipe.findFirst({
                where: {
                    tripId,
                    userId: trip.createdBy,
                    // Creator's "swipe" is on the user, stored with special convention
                },
            });
            // For now, creator needs to respond via the getSwipes endpoint
            // Notify creator of the interest
            await prisma.notification.create({
                data: {
                    userId: trip.createdBy,
                    type: 'swipe_received',
                    title: direction === 'super' ? 'New Super Like!' : 'New Interest',
                    message: `Someone is interested in your trip!`,
                    tripId: tripId,
                },
            });
        }
        return {
            swipe: {
                id: swipe.id,
                direction: swipe.direction,
                tripId: swipe.tripId,
                createdAt: swipe.createdAt,
            },
            trip: {
                id: trip.id,
                type: trip.type,
                availableSeats: trip.availableSeats,
            },
        };
    }
    // 4.2 Get Swipes on My Trip (Creator View)
    async getSwipesOnTrip(userId, tripId, filters) {
        // Verify user is trip creator
        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            select: { createdBy: true },
        });
        if (!trip) {
            throw new AppError('Trip not found', 404);
        }
        if (trip.createdBy !== userId) {
            throw new AppError('Only trip creator can view swipes', 403);
        }
        // Build filter conditions
        const where = {
            tripId,
            direction: { in: filters.direction === 'all' ? ['right', 'super'] : [filters.direction] },
        };
        // Exclude already matched users
        if (filters.excludeMatched) {
            const matchedUserIds = await prisma.match.findMany({
                where: { tripId },
                select: { matchedUserId: true },
            });
            where.userId = { notIn: matchedUserIds.map(m => m.matchedUserId) };
        }
        // Get total count
        const total = await prisma.swipe.count({ where });
        // Build order by
        let orderBy = [];
        if (filters.sortBy === 'super') {
            orderBy = [
                { direction: 'desc' }, // super comes after right alphabetically, so desc puts it first
                { user: { trustScore: 'desc' } },
                { createdAt: 'desc' },
            ];
        }
        else if (filters.sortBy === 'trustScore') {
            orderBy = [{ user: { trustScore: 'desc' } }, { createdAt: 'desc' }];
        }
        else {
            orderBy = [{ createdAt: 'desc' }];
        }
        // Fetch swipes with user info
        const swipes = await prisma.swipe.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePhotoUrl: true,
                        trustScore: true,
                        collegeName: true,
                        department: true,
                        yearOfStudy: true,
                        bio: true,
                        gender: true,
                        totalTripsCompleted: true,
                        isVerified: true,
                        interests: {
                            select: { interest: true },
                        },
                    },
                },
            },
            orderBy,
            skip: (filters.page - 1) * filters.limit,
            take: filters.limit,
        });
        // Get match status for each swipe
        const userIds = swipes.map(s => s.userId);
        const matches = await prisma.match.findMany({
            where: {
                tripId,
                matchedUserId: { in: userIds },
            },
            select: {
                matchedUserId: true,
                status: true,
                id: true,
            },
        });
        const matchMap = new Map(matches.map(m => [m.matchedUserId, m]));
        return {
            swipes: swipes.map(swipe => {
                const match = matchMap.get(swipe.userId);
                return {
                    id: swipe.id,
                    direction: swipe.direction,
                    introductionMessage: swipe.introductionMessage,
                    createdAt: swipe.createdAt,
                    user: {
                        id: swipe.user.id,
                        fullName: swipe.user.fullName,
                        profilePhotoUrl: swipe.user.profilePhotoUrl,
                        trustScore: swipe.user.trustScore,
                        college: swipe.user.collegeName,
                        department: swipe.user.department,
                        yearOfStudy: swipe.user.yearOfStudy,
                        bio: swipe.user.bio,
                        gender: swipe.user.gender,
                        totalTripsCompleted: swipe.user.totalTripsCompleted,
                        isVerified: swipe.user.isVerified,
                        interests: swipe.user.interests.map(i => i.interest),
                    },
                    hasMatch: !!match,
                    matchId: match?.id,
                    matchStatus: match?.status,
                };
            }),
            pagination: {
                total,
                page: filters.page,
                limit: filters.limit,
                totalPages: Math.ceil(total / filters.limit),
            },
        };
    }
    // 4.3 Creator Swipe on User (Response)
    async creatorSwipeOnUser(creatorId, tripId, targetUserId, direction) {
        // Verify trip ownership
        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            select: {
                id: true,
                createdBy: true,
                status: true,
                availableSeats: true,
                type: true,
                farePerPerson: true,
                originCity: true,
                destinationCity: true,
            },
        });
        if (!trip) {
            throw new AppError('Trip not found', 404);
        }
        if (trip.createdBy !== creatorId) {
            throw new AppError('Only trip creator can respond to swipes', 403);
        }
        // Check user has swiped right/super on this trip
        const userSwipe = await prisma.swipe.findFirst({
            where: {
                tripId,
                userId: targetUserId,
                direction: { in: ['right', 'super'] },
            },
        });
        if (!userSwipe) {
            throw new AppError('User has not expressed interest in this trip', 400);
        }
        // Check if match already exists
        const existingMatch = await prisma.match.findUnique({
            where: {
                tripId_matchedUserId: { tripId, matchedUserId: targetUserId },
            },
        });
        if (existingMatch) {
            throw new AppError('Match already exists with this user', 400);
        }
        if (direction === 'left') {
            // Just record rejection, no notification needed
            return {
                matched: false,
                message: 'User rejected',
            };
        }
        // Right swipe - create match!
        if (trip.availableSeats <= 0) {
            throw new AppError('Trip has no available seats', 400);
        }
        // Create match with pending status
        const match = await prisma.match.create({
            data: {
                tripId,
                tripCreatorId: creatorId,
                matchedUserId: targetUserId,
                status: 'pending',
                seatsRequested: 1,
                fareShare: trip.farePerPerson,
            },
            include: {
                matchedUser: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePhotoUrl: true,
                    },
                },
            },
        });
        // Create or get chat room for this trip
        let chatRoom = await prisma.chatRoom.findUnique({
            where: { tripId },
        });
        if (!chatRoom) {
            chatRoom = await prisma.chatRoom.create({
                data: { tripId },
            });
        }
        // Notify the matched user
        await prisma.notification.create({
            data: {
                userId: targetUserId,
                type: 'match_confirmed',
                title: 'It\'s a Match! 🎉',
                message: `You matched for the trip from ${trip.originCity} to ${trip.destinationCity}!`,
                matchId: match.id,
                tripId: tripId,
            },
        });
        return {
            matched: true,
            match: {
                id: match.id,
                tripId: match.tripId,
                status: match.status,
                user: match.matchedUser,
                chatRoomId: chatRoom.id,
            },
        };
    }
    // 4.4 Get My Swipes (User View)
    async getMySwipes(userId, filters) {
        // Build filter
        const where = { userId };
        if (filters.direction !== 'all') {
            where.direction = filters.direction;
        }
        // Get total
        const total = await prisma.swipe.count({ where });
        // Fetch swipes with trip and creator info
        const swipes = await prisma.swipe.findMany({
            where,
            include: {
                trip: {
                    select: {
                        id: true,
                        type: true,
                        status: true,
                        originCity: true,
                        destinationCity: true,
                        departureDate: true,
                        departureTime: true,
                        availableSeats: true,
                        totalSeats: true,
                        farePerPerson: true,
                        creator: {
                            select: {
                                id: true,
                                fullName: true,
                                profilePhotoUrl: true,
                                trustScore: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (filters.page - 1) * filters.limit,
            take: filters.limit,
        });
        // Check match status for each swipe
        const swipeIds = swipes.map(s => s.tripId);
        const matches = await prisma.match.findMany({
            where: {
                tripId: { in: swipeIds },
                matchedUserId: userId,
            },
            select: {
                tripId: true,
                status: true,
                id: true,
            },
        });
        const matchMap = new Map(matches.map(m => [m.tripId, m]));
        // Filter by status if needed
        let results = swipes.map(swipe => {
            const match = matchMap.get(swipe.tripId);
            return {
                id: swipe.id,
                direction: swipe.direction,
                introductionMessage: swipe.introductionMessage,
                createdAt: swipe.createdAt,
                trip: {
                    id: swipe.trip.id,
                    type: swipe.trip.type,
                    status: swipe.trip.status,
                    origin: swipe.trip.originCity,
                    destination: swipe.trip.destinationCity,
                    departureDate: swipe.trip.departureDate,
                    departureTime: swipe.trip.departureTime,
                    seats: {
                        total: swipe.trip.totalSeats,
                        available: swipe.trip.availableSeats,
                    },
                    farePerPerson: swipe.trip.farePerPerson ? Number(swipe.trip.farePerPerson) : null,
                    creator: swipe.trip.creator,
                },
                matchStatus: match ? {
                    matched: true,
                    matchId: match.id,
                    status: match.status,
                } : {
                    matched: false,
                    status: swipe.direction === 'left' ? 'passed' : 'pending',
                },
            };
        });
        // Filter by match status
        if (filters.status !== 'all') {
            results = results.filter(r => {
                if (filters.status === 'matched')
                    return r.matchStatus.matched;
                if (filters.status === 'pending')
                    return !r.matchStatus.matched && r.direction !== 'left';
                if (filters.status === 'rejected')
                    return r.matchStatus.status === 'rejected';
                return true;
            });
        }
        return {
            swipes: results,
            pagination: {
                total,
                page: filters.page,
                limit: filters.limit,
                totalPages: Math.ceil(total / filters.limit),
            },
        };
    }
    // 4.5 Get Match Status
    async getMatchStatus(userId, tripId) {
        // Check if user swiped on this trip
        const userSwipe = await prisma.swipe.findUnique({
            where: {
                tripId_userId: { tripId, userId },
            },
        });
        if (!userSwipe) {
            return {
                hasSwiped: false,
                swipeDirection: null,
                isMutualMatch: false,
                matchStatus: null,
                matchId: null,
                chatRoomId: null,
            };
        }
        // Check if match exists
        const match = await prisma.match.findUnique({
            where: {
                tripId_matchedUserId: { tripId, matchedUserId: userId },
            },
        });
        // Get chat room if match exists
        let chatRoomId = null;
        if (match) {
            const chatRoom = await prisma.chatRoom.findUnique({
                where: { tripId },
            });
            chatRoomId = chatRoom?.id ?? null;
        }
        return {
            hasSwiped: true,
            swipeDirection: userSwipe.direction,
            isMutualMatch: !!match,
            matchStatus: match?.status ?? null,
            matchId: match?.id ?? null,
            chatRoomId,
        };
    }
    // Helper: Get swipe summary for a trip
    async getSwipeSummary(tripId) {
        const [rightSwipes, superSwipes, leftSwipes] = await Promise.all([
            prisma.swipe.count({ where: { tripId, direction: 'right' } }),
            prisma.swipe.count({ where: { tripId, direction: 'super' } }),
            prisma.swipe.count({ where: { tripId, direction: 'left' } }),
        ]);
        return {
            right: rightSwipes,
            super: superSwipes,
            left: leftSwipes,
            total: rightSwipes + superSwipes + leftSwipes,
            interested: rightSwipes + superSwipes,
        };
    }
}
export const swipeService = new SwipeService();
//# sourceMappingURL=swipe.service.js.map