import type { CreateReportInput, BlockUserInput, AddEmergencyContactInput, TriggerSOSInput } from '../validators/safety.validator.js';
declare class SafetyService {
    createReport(reporterId: string, data: CreateReportInput): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.ReportType;
        reason: string;
        description: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        isEmergency: boolean;
        reportedUser: {
            id: string;
            fullName: string;
        } | null;
        reportedTrip: {
            id: string;
            originCity: string;
            destinationCity: string;
        } | null;
        createdAt: Date;
    }>;
    private handleEmergencyReport;
    getMyReports(reporterId: string, options: {
        page: number;
        limit: number;
    }): Promise<{
        reports: {
            id: string;
            type: import("@prisma/client").$Enums.ReportType;
            reason: string;
            description: string;
            status: import("@prisma/client").$Enums.ReportStatus;
            isEmergency: boolean;
            reportedUser: {
                id: string;
                fullName: string;
                profilePhotoUrl: string | null;
            } | null;
            reportedTrip: {
                id: string;
                originCity: string;
                destinationCity: string;
                departureDate: Date;
            } | null;
            createdAt: Date;
            resolvedAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    blockUser(blockerId: string, data: BlockUserInput): Promise<{
        id: string;
        blockedUser: {
            id: string;
            fullName: string;
        };
        reason: string | null;
        createdAt: Date;
    }>;
    unblockUser(blockerId: string, blockedUserId: string): Promise<{
        message: string;
    }>;
    getBlockedUsers(blockerId: string, options: {
        page: number;
        limit: number;
    }): Promise<{
        blockedUsers: {
            id: string;
            blockedUser: {
                id: string;
                fullName: string;
                profilePhotoUrl: string | null;
                collegeName: string;
            };
            reason: string | null;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    isUserBlocked(userId: string, targetUserId: string): Promise<boolean>;
    addEmergencyContact(userId: string, data: AddEmergencyContactInput): Promise<{
        id: string;
        name: string;
        phoneNumber: string;
        relationship: string | null;
        isPrimary: boolean;
        createdAt: Date;
    }>;
    updateEmergencyContact(userId: string, contactId: string, data: Partial<AddEmergencyContactInput>): Promise<{
        id: string;
        name: string;
        phoneNumber: string;
        relationship: string | null;
        isPrimary: boolean;
        createdAt: Date;
    }>;
    deleteEmergencyContact(userId: string, contactId: string): Promise<{
        message: string;
    }>;
    getEmergencyContacts(userId: string): Promise<{
        contacts: {
            id: string;
            name: string;
            phoneNumber: string;
            relationship: string | null;
            isPrimary: boolean;
            createdAt: Date;
        }[];
    }>;
    triggerSOS(userId: string, data: TriggerSOSInput): Promise<{
        sosId: string;
        status: string;
        message: string;
        contactsNotified: number;
        location: {
            lat: number;
            lng: number;
            address?: string | undefined;
        };
    }>;
}
export declare const safetyService: SafetyService;
export {};
//# sourceMappingURL=safety.service.d.ts.map