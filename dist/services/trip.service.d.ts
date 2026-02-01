import type { CreateTripInput, UpdateTripInput, SearchTripsInput, NearbyTripsInput, CancelTripInput, MyTripsQueryInput } from '../validators/trip.validator.js';
import { Prisma } from '@prisma/client';
export declare class TripService {
    createTrip(userId: string, data: CreateTripInput): Promise<{
        id: any;
        type: any;
        status: any;
        origin: {
            city: any;
            lat: number | null;
            lng: number | null;
            address: any;
        };
        destination: {
            city: any;
            lat: number | null;
            lng: number | null;
            address: any;
        };
        departure: {
            date: any;
            time: any;
            timeWindow: any;
        };
        estimatedDuration: any;
        seats: {
            total: any;
            available: any;
        };
        title: any;
        description: any;
        vibeTags: any;
        fare: {
            estimated: number | null;
            perPerson: number | null;
        } | null;
        luggageSpace: any;
        filters: {
            genderPreference: any;
            sameDepartmentOnly: any;
            sameYearOnly: any;
            verifiedUsersOnly: any;
        };
        viewCount: any;
        swipeCount: any;
        creator: any;
        createdAt: any;
        updatedAt: any;
    }>;
    getTripDetails(tripId: string, userId?: string): Promise<{
        totalSwipes: number;
        confirmedParticipants: number;
        userSwiped: import("@prisma/client").$Enums.SwipeDirection | null;
        isParticipant: boolean;
        isCreator: boolean;
        participants: ({
            role: string;
            seatsConfirmed: number;
            joinedAt: Date | null;
            id: string;
            fullName: string;
            profilePhotoUrl: string | null;
            trustScore: Prisma.Decimal;
            isVerified: boolean;
        } | {
            role: string;
            seatsConfirmed: null;
            joinedAt: null;
            id?: string | undefined;
            fullName?: string | undefined;
            profilePhotoUrl?: string | null | undefined;
            trustScore?: Prisma.Decimal | undefined;
            isVerified?: boolean | undefined;
        })[] | null;
        id: any;
        type: any;
        status: any;
        origin: {
            city: any;
            lat: number | null;
            lng: number | null;
            address: any;
        };
        destination: {
            city: any;
            lat: number | null;
            lng: number | null;
            address: any;
        };
        departure: {
            date: any;
            time: any;
            timeWindow: any;
        };
        estimatedDuration: any;
        seats: {
            total: any;
            available: any;
        };
        title: any;
        description: any;
        vibeTags: any;
        fare: {
            estimated: number | null;
            perPerson: number | null;
        } | null;
        luggageSpace: any;
        filters: {
            genderPreference: any;
            sameDepartmentOnly: any;
            sameYearOnly: any;
            verifiedUsersOnly: any;
        };
        viewCount: any;
        swipeCount: any;
        creator: any;
        createdAt: any;
        updatedAt: any;
    }>;
    searchTrips(userId: string, filters: SearchTripsInput): Promise<{
        trips: {
            confirmedParticipants: number;
            id: any;
            type: any;
            status: any;
            origin: {
                city: any;
                lat: number | null;
                lng: number | null;
                address: any;
            };
            destination: {
                city: any;
                lat: number | null;
                lng: number | null;
                address: any;
            };
            departure: {
                date: any;
                time: any;
                timeWindow: any;
            };
            estimatedDuration: any;
            seats: {
                total: any;
                available: any;
            };
            title: any;
            description: any;
            vibeTags: any;
            fare: {
                estimated: number | null;
                perPerson: number | null;
            } | null;
            luggageSpace: any;
            filters: {
                genderPreference: any;
                sameDepartmentOnly: any;
                sameYearOnly: any;
                verifiedUsersOnly: any;
            };
            viewCount: any;
            swipeCount: any;
            creator: any;
            createdAt: any;
            updatedAt: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getNearbyTrips(userId: string, filters: NearbyTripsInput): Promise<{
        trips: {
            distanceKm: number;
            id: any;
            type: any;
            status: any;
            origin: {
                city: any;
                lat: number | null;
                lng: number | null;
                address: any;
            };
            destination: {
                city: any;
                lat: number | null;
                lng: number | null;
                address: any;
            };
            departure: {
                date: any;
                time: any;
                timeWindow: any;
            };
            estimatedDuration: any;
            seats: {
                total: any;
                available: any;
            };
            title: any;
            description: any;
            vibeTags: any;
            fare: {
                estimated: number | null;
                perPerson: number | null;
            } | null;
            luggageSpace: any;
            filters: {
                genderPreference: any;
                sameDepartmentOnly: any;
                sameYearOnly: any;
                verifiedUsersOnly: any;
            };
            viewCount: any;
            swipeCount: any;
            creator: any;
            createdAt: any;
            updatedAt: any;
        }[];
        pagination: {
            page: number;
            limit: number;
        };
    }>;
    updateTrip(tripId: string, userId: string, data: UpdateTripInput): Promise<{
        id: any;
        type: any;
        status: any;
        origin: {
            city: any;
            lat: number | null;
            lng: number | null;
            address: any;
        };
        destination: {
            city: any;
            lat: number | null;
            lng: number | null;
            address: any;
        };
        departure: {
            date: any;
            time: any;
            timeWindow: any;
        };
        estimatedDuration: any;
        seats: {
            total: any;
            available: any;
        };
        title: any;
        description: any;
        vibeTags: any;
        fare: {
            estimated: number | null;
            perPerson: number | null;
        } | null;
        luggageSpace: any;
        filters: {
            genderPreference: any;
            sameDepartmentOnly: any;
            sameYearOnly: any;
            verifiedUsersOnly: any;
        };
        viewCount: any;
        swipeCount: any;
        creator: any;
        createdAt: any;
        updatedAt: any;
    }>;
    cancelTrip(tripId: string, userId: string, data: CancelTripInput): Promise<{
        message: string;
    }>;
    markTripInProgress(tripId: string, userId: string): Promise<{
        id: any;
        type: any;
        status: any;
        origin: {
            city: any;
            lat: number | null;
            lng: number | null;
            address: any;
        };
        destination: {
            city: any;
            lat: number | null;
            lng: number | null;
            address: any;
        };
        departure: {
            date: any;
            time: any;
            timeWindow: any;
        };
        estimatedDuration: any;
        seats: {
            total: any;
            available: any;
        };
        title: any;
        description: any;
        vibeTags: any;
        fare: {
            estimated: number | null;
            perPerson: number | null;
        } | null;
        luggageSpace: any;
        filters: {
            genderPreference: any;
            sameDepartmentOnly: any;
            sameYearOnly: any;
            verifiedUsersOnly: any;
        };
        viewCount: any;
        swipeCount: any;
        creator: any;
        createdAt: any;
        updatedAt: any;
    }>;
    markTripCompleted(tripId: string, userId: string): Promise<{
        message: string;
    }>;
    getMyCreatedTrips(userId: string, filters: MyTripsQueryInput): Promise<{
        trips: {
            pendingSwipes: number;
            confirmedParticipants: number;
            id: any;
            type: any;
            status: any;
            origin: {
                city: any;
                lat: number | null;
                lng: number | null;
                address: any;
            };
            destination: {
                city: any;
                lat: number | null;
                lng: number | null;
                address: any;
            };
            departure: {
                date: any;
                time: any;
                timeWindow: any;
            };
            estimatedDuration: any;
            seats: {
                total: any;
                available: any;
            };
            title: any;
            description: any;
            vibeTags: any;
            fare: {
                estimated: number | null;
                perPerson: number | null;
            } | null;
            luggageSpace: any;
            filters: {
                genderPreference: any;
                sameDepartmentOnly: any;
                sameYearOnly: any;
                verifiedUsersOnly: any;
            };
            viewCount: any;
            swipeCount: any;
            creator: any;
            createdAt: any;
            updatedAt: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMyJoinedTrips(userId: string, filters: MyTripsQueryInput): Promise<{
        trips: {
            seatsConfirmed: number;
            fareShare: number | null;
            matchedAt: Date;
            id: any;
            type: any;
            status: any;
            origin: {
                city: any;
                lat: number | null;
                lng: number | null;
                address: any;
            };
            destination: {
                city: any;
                lat: number | null;
                lng: number | null;
                address: any;
            };
            departure: {
                date: any;
                time: any;
                timeWindow: any;
            };
            estimatedDuration: any;
            seats: {
                total: any;
                available: any;
            };
            title: any;
            description: any;
            vibeTags: any;
            fare: {
                estimated: number | null;
                perPerson: number | null;
            } | null;
            luggageSpace: any;
            filters: {
                genderPreference: any;
                sameDepartmentOnly: any;
                sameYearOnly: any;
                verifiedUsersOnly: any;
            };
            viewCount: any;
            swipeCount: any;
            creator: any;
            createdAt: any;
            updatedAt: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTripParticipants(tripId: string, userId?: string): Promise<({
        role: string;
        seatsConfirmed: number;
        joinedAt: Date | null;
        id: string;
        fullName: string;
        profilePhotoUrl: string | null;
        trustScore: Prisma.Decimal;
        isVerified: boolean;
    } | {
        role: string;
        seatsConfirmed: null;
        joinedAt: null;
        id?: string | undefined;
        fullName?: string | undefined;
        profilePhotoUrl?: string | null | undefined;
        trustScore?: Prisma.Decimal | undefined;
        isVerified?: boolean | undefined;
    })[]>;
    getTripAnalytics(tripId: string, userId: string): Promise<{
        viewCount: number;
        swipeCount: number;
        swipes: {
            right: number;
            left: number;
            super: number;
        };
        totalPositiveSwipes: number;
        conversionRate: number;
        matches: {
            pending: number;
            accepted: number;
            rejected: number;
            cancelled: number;
        };
        seatsStatus: {
            total: number;
            available: number;
            filled: number;
            fillRate: number;
        };
    }>;
    private formatTrip;
    private calculateDistance;
    private toRad;
}
export declare const tripService: TripService;
//# sourceMappingURL=trip.service.d.ts.map