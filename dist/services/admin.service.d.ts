import type { ModerateUserInput, ReviewReportsInput, UpdateReportStatusInput, BulkActionInput, ContentModerationSearchInput, ModerateContentInput, SystemLogsInput, AddCollegeWhitelistInput, UpdateCollegeWhitelistInput, CollegeWhitelistQueryInput } from '../validators/admin.validator.js';
interface AdminLogEntry {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    details: Record<string, unknown>;
    timestamp: string;
}
export declare const moderateUser: (adminId: string, targetUserId: string, data: ModerateUserInput) => Promise<{
    success: boolean;
    user: {
        id: string;
        email: string;
        fullName: string;
        isBlocked: boolean;
        isVerified: boolean;
    };
    message: string;
}>;
export declare const getReports: (params: ReviewReportsInput) => Promise<{
    reports: Array<{
        id: string;
        type: string;
        status: string;
        description: string;
        createdAt: Date;
        reporter: {
            id: string;
            fullName: string;
            email: string;
        };
        reportedUser: {
            id: string;
            fullName: string;
            email: string;
        } | null;
        reportedTrip: {
            id: string;
            title: string | null;
        } | null;
    }>;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const updateReportStatus: (adminId: string, reportId: string, data: UpdateReportStatusInput) => Promise<{
    report: {
        id: string;
        status: string;
        resolvedAt: Date | null;
    };
}>;
export declare const performBulkAction: (adminId: string, data: BulkActionInput) => Promise<{
    success: boolean;
    processed: number;
    failed: number;
    results: Array<{
        userId: string;
        success: boolean;
        error?: string;
    }>;
}>;
export declare const searchContent: (params: ContentModerationSearchInput) => Promise<{
    content: Array<{
        id: string;
        type: "trip" | "message";
        content: string;
        createdAt: Date;
        creator: {
            id: string;
            fullName: string;
        };
        isActive: boolean;
    }>;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const moderateContent: (adminId: string, contentType: "trip" | "message", contentId: string, data: ModerateContentInput) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const getSystemLogs: (params: SystemLogsInput) => Promise<{
    logs: AdminLogEntry[];
    pagination: {
        page: number;
        limit: number;
        hasMore: boolean;
    };
}>;
export declare const getCollegeWhitelist: (params: CollegeWhitelistQueryInput) => Promise<{
    colleges: Array<{
        collegeDomain: string;
        collegeName: string;
        isActive: boolean;
        addedAt: string;
    }>;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const addCollegeToWhitelist: (adminId: string, data: AddCollegeWhitelistInput) => Promise<{
    success: boolean;
    college: {
        collegeDomain: string;
        collegeName: string;
        isActive: boolean;
    };
}>;
export declare const updateCollegeWhitelist: (adminId: string, collegeDomain: string, data: UpdateCollegeWhitelistInput) => Promise<{
    success: boolean;
    college: {
        collegeDomain: string;
        collegeName: string;
        isActive: boolean;
    };
}>;
export declare const removeCollegeFromWhitelist: (adminId: string, collegeDomain: string) => Promise<{
    success: boolean;
}>;
export {};
//# sourceMappingURL=admin.service.d.ts.map