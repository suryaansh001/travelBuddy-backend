import type { UpdateProfileInput, UpdateInterestsInput, AddEmergencyContactInput, UpdateEmergencyContactInput } from '../validators/user.validator.js';
export declare class UserService {
    getOwnProfile(userId: string): Promise<{
        interests: string[];
        totalTripsCreated: number;
        totalReviews: number;
        averageRating: number;
        cancellationRate: number;
        id: string;
        email: string;
        emailVerified: boolean;
        fullName: string;
        profilePhotoUrl: string | null;
        collegeName: string;
        collegeDomain: string;
        department: string | null;
        yearOfStudy: number | null;
        phoneNumber: string | null;
        phoneVerified: boolean;
        bio: string | null;
        gender: string | null;
        preferredGender: string | null;
        trustScore: import("@prisma/client/runtime/client").Decimal;
        totalTripsCompleted: number;
        totalTripsCancelled: number;
        isVerified: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        emergencyContacts: {
            name: string;
            id: string;
            phoneNumber: string;
            relationship: string | null;
            isPrimary: boolean;
        }[];
        _count: {
            createdTrips: number;
            reviewsReceived: number;
        };
    }>;
    getPublicProfile(userId: string, viewerId?: string): Promise<{
        interests: string[];
        totalTripsCompleted: number;
        totalReviews: number;
        averageRating: number;
        cancellationRate: number;
        id: string;
        fullName: string;
        profilePhotoUrl: string | null;
        collegeName: string;
        department: string | null;
        yearOfStudy: number | null;
        bio: string | null;
        gender: string | null;
        trustScore: import("@prisma/client/runtime/client").Decimal;
        isVerified: boolean;
        createdAt: Date;
        reviewsReceived: {
            id: string;
            createdAt: Date;
            overallRating: import("@prisma/client/runtime/client").Decimal;
            positiveTags: string[];
            comment: string | null;
            reviewer: {
                id: string;
                fullName: string;
                profilePhotoUrl: string | null;
            };
        }[];
        _count: {
            createdTrips: number;
            reviewsReceived: number;
        };
    }>;
    updateProfile(userId: string, data: UpdateProfileInput): Promise<{
        id: string;
        fullName: string;
        department: string | null;
        yearOfStudy: number | null;
        bio: string | null;
        gender: string | null;
        preferredGender: string | null;
        updatedAt: Date;
    }>;
    updateInterests(userId: string, data: UpdateInterestsInput): Promise<{
        interests: string[];
    }>;
    addEmergencyContact(userId: string, data: AddEmergencyContactInput): Promise<{
        name: string;
        id: string;
        phoneNumber: string;
        createdAt: Date;
        userId: string;
        relationship: string | null;
        isPrimary: boolean;
    }>;
    updateEmergencyContact(userId: string, contactId: string, data: UpdateEmergencyContactInput): Promise<{
        name: string;
        id: string;
        phoneNumber: string;
        createdAt: Date;
        userId: string;
        relationship: string | null;
        isPrimary: boolean;
    }>;
    deleteEmergencyContact(userId: string, contactId: string): Promise<{
        message: string;
    }>;
    getUserStatistics(userId: string): Promise<{
        trustScore: import("@prisma/client/runtime/client").Decimal;
        totalTripsCompleted: number;
        totalTripsCancelled: number;
        totalTripsCreated: number;
        totalTripsJoined: number;
        totalReviews: number;
        averageRating: number;
        cancellationRate: number;
        responseRate: number;
    }>;
    blockUser(userId: string, blockedUserId: string, reason?: string): Promise<{
        message: string;
    }>;
    unblockUser(userId: string, blockedUserId: string): Promise<{
        message: string;
    }>;
    getBlockedUsers(userId: string): Promise<{
        id: string;
        user: {
            id: string;
            fullName: string;
            profilePhotoUrl: string | null;
        };
        reason: string | null;
        blockedAt: Date;
    }[]>;
    sendPhoneOtp(userId: string, phoneNumber: string): Promise<{
        message: string;
    }>;
    verifyPhoneOtp(userId: string, phoneNumber: string, otp: string): Promise<{
        message: string;
    }>;
    private getCancellationRate;
    private getAverageRating;
}
export declare const userService: UserService;
//# sourceMappingURL=user.service.d.ts.map