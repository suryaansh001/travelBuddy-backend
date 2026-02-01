type SwipeDirection = 'left' | 'right' | 'super';
export declare class SwipeService {
    swipeOnTrip(userId: string, tripId: string, direction: SwipeDirection, introductionMessage?: string): Promise<{
        swipe: {
            id: string;
            direction: import("@prisma/client").$Enums.SwipeDirection;
            tripId: string;
            createdAt: Date;
        };
        trip: {
            id: string;
            type: import("@prisma/client").$Enums.TripType;
            availableSeats: number;
        };
    }>;
    getSwipesOnTrip(userId: string, tripId: string, filters: {
        direction: 'right' | 'super' | 'all';
        excludeMatched: boolean;
        sortBy: 'trustScore' | 'timestamp' | 'super';
        page: number;
        limit: number;
    }): Promise<{
        swipes: {
            id: string;
            direction: import("@prisma/client").$Enums.SwipeDirection;
            introductionMessage: string | null;
            createdAt: Date;
            user: {
                id: string;
                fullName: string;
                profilePhotoUrl: string | null;
                trustScore: import("@prisma/client/runtime/client").Decimal;
                college: string;
                department: string | null;
                yearOfStudy: number | null;
                bio: string | null;
                gender: string | null;
                totalTripsCompleted: number;
                isVerified: boolean;
                interests: string[];
            };
            hasMatch: boolean;
            matchId: string | undefined;
            matchStatus: import("@prisma/client").$Enums.MatchStatus | undefined;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    creatorSwipeOnUser(creatorId: string, tripId: string, targetUserId: string, direction: 'left' | 'right'): Promise<{
        matched: boolean;
        message: string;
        match?: undefined;
    } | {
        matched: boolean;
        match: {
            id: string;
            tripId: string;
            status: import("@prisma/client").$Enums.MatchStatus;
            user: {
                id: string;
                fullName: string;
                profilePhotoUrl: string | null;
            };
            chatRoomId: string;
        };
        message?: undefined;
    }>;
    getMySwipes(userId: string, filters: {
        direction: 'left' | 'right' | 'super' | 'all';
        status: 'pending' | 'matched' | 'rejected' | 'all';
        page: number;
        limit: number;
    }): Promise<{
        swipes: {
            id: string;
            direction: import("@prisma/client").$Enums.SwipeDirection;
            introductionMessage: string | null;
            createdAt: Date;
            trip: {
                id: string;
                type: import("@prisma/client").$Enums.TripType;
                status: import("@prisma/client").$Enums.TripStatus;
                origin: string;
                destination: string;
                departureDate: Date;
                departureTime: Date;
                seats: {
                    total: number;
                    available: number;
                };
                farePerPerson: number | null;
                creator: {
                    trustScore: number | null;
                    id: string;
                    fullName: string;
                    profilePhotoUrl: string | null;
                };
            };
            matchStatus: {
                matched: boolean;
                matchId: string;
                status: import("@prisma/client").$Enums.MatchStatus;
            } | {
                matched: boolean;
                status: string;
                matchId?: undefined;
            };
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getMatchStatus(userId: string, tripId: string): Promise<{
        hasSwiped: boolean;
        swipeDirection: null;
        isMutualMatch: boolean;
        matchStatus: null;
        matchId: null;
        chatRoomId: null;
    } | {
        hasSwiped: boolean;
        swipeDirection: import("@prisma/client").$Enums.SwipeDirection;
        isMutualMatch: boolean;
        matchStatus: import("@prisma/client").$Enums.MatchStatus | null;
        matchId: string | null;
        chatRoomId: any;
    }>;
    getSwipeSummary(tripId: string): Promise<{
        right: number;
        super: number;
        left: number;
        total: number;
        interested: number;
    }>;
}
export declare const swipeService: SwipeService;
export {};
//# sourceMappingURL=swipe.service.d.ts.map