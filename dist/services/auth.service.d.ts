import type { RegisterInput, LoginInput } from '../validators/auth.validator.js';
export declare class AuthService {
    register(input: RegisterInput): Promise<{
        user: {
            id: string;
            email: string;
            emailVerified: boolean;
            fullName: string;
            collegeName: string;
            collegeDomain: string;
            department: string | null;
            yearOfStudy: number | null;
            gender: string | null;
            trustScore: import("@prisma/client-runtime-utils").Decimal;
            createdAt: Date;
        };
        accessToken: string;
        refreshToken: string;
        message: string;
    }>;
    verifyEmail(email: string, otp: string): Promise<{
        user: {
            id: string;
            email: string;
            emailVerified: boolean;
            fullName: string;
        };
        accessToken: string;
        message: string;
    }>;
    resendOtp(email: string): Promise<{
        message: string;
    }>;
    login(input: LoginInput): Promise<{
        user: {
            interests: {
                createdAt: Date;
                userId: string;
                interest: string;
            }[];
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
            trustScore: import("@prisma/client-runtime-utils").Decimal;
            totalTripsCompleted: number;
            totalTripsCancelled: number;
            isVerified: boolean;
            isBlocked: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            lastLoginAt: Date | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    private incrementLoginAttempts;
    logout(token: string, userId: string): Promise<{
        message: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    getCurrentUser(userId: string): Promise<{
        interests: string[];
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
        trustScore: import("@prisma/client-runtime-utils").Decimal;
        totalTripsCompleted: number;
        totalTripsCancelled: number;
        isVerified: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map