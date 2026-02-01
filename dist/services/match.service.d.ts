export declare class MatchService {
    acceptMatch(userId: string, matchId: string, seatsRequested: number): Promise<{
        match: {
            id: string;
            status: import("@prisma/client").$Enums.MatchStatus;
            seatsConfirmed: number;
            fareShare: number | null;
            acceptedAt: Date | null;
        };
        trip: {
            id: string;
            availableSeats: number;
            origin: string;
            destination: string;
        };
        chatRoomId: string | null;
    }>;
    rejectMatch(userId: string, matchId: string, reason?: string): Promise<{
        message: string;
    }>;
    cancelMatch(userId: string, matchId: string, reason?: string): Promise<{
        message: string;
        trustPenalty: number;
    }>;
    getMyMatches(userId: string, filters: {
        status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'all';
        role: 'creator' | 'participant' | 'all';
        page: number;
        limit: number;
    }): Promise<{
        matches: {
            id: string;
            status: import("@prisma/client").$Enums.MatchStatus;
            seatsRequested: number;
            seatsConfirmed: number;
            fareShare: number | null;
            matchedAt: Date;
            acceptedAt: Date | null;
            role: string;
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
            };
            otherUser: {
                id: string;
                fullName: string;
                profilePhotoUrl: string | null;
                trustScore: import("@prisma/client/runtime/client").Decimal;
            };
            chatRoomId: string | null;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getMatchDetails(userId: string, matchId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.MatchStatus;
        seatsRequested: number;
        seatsConfirmed: number;
        fareShare: number | null;
        paymentStatus: string | null;
        matchedAt: Date;
        acceptedAt: Date | null;
        rejectedAt: Date | null;
        cancelledAt: Date | null;
        cancellationReason: string | null;
        role: string;
        trip: {
            id: string;
            type: import("@prisma/client").$Enums.TripType;
            status: import("@prisma/client").$Enums.TripStatus;
            origin: string;
            destination: string;
            departureDate: Date;
            departureTime: Date;
            description: string | null;
            vibeTags: string[];
            seats: {
                total: number;
                available: number;
            };
            farePerPerson: number | null;
        };
        creator: {
            id: string;
            fullName: string;
            profilePhotoUrl: string | null;
            collegeName: string;
            department: string | null;
            trustScore: import("@prisma/client/runtime/client").Decimal;
        };
        participant: {
            id: string;
            fullName: string;
            profilePhotoUrl: string | null;
            collegeName: string;
            department: string | null;
            trustScore: import("@prisma/client/runtime/client").Decimal;
        };
        chatRoomId: string | null;
    }>;
    getPendingMatchesCount(userId: string): Promise<number>;
}
export declare const matchService: MatchService;
//# sourceMappingURL=match.service.d.ts.map