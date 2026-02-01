import type { CreateReviewInput, UpdateReviewInput } from '../validators/review.validator.js';
declare class ReviewService {
    createReview(reviewerId: string, data: CreateReviewInput): Promise<{
        id: any;
        tripId: any;
        type: any;
        overallRating: number;
        punctualityRating: number | null;
        planningRating: number | null;
        costFairnessRating: number | null;
        coordinationRating: number | null;
        positiveTags: any;
        neutralTags: any;
        negativeTags: any;
        comment: any;
        isVerified: any;
        isPublic: any;
        createdAt: any;
        reviewer: any;
        reviewedUser: any;
        trip: any;
    }>;
    updateReview(reviewerId: string, reviewId: string, data: Partial<UpdateReviewInput>): Promise<{
        id: any;
        tripId: any;
        type: any;
        overallRating: number;
        punctualityRating: number | null;
        planningRating: number | null;
        costFairnessRating: number | null;
        coordinationRating: number | null;
        positiveTags: any;
        neutralTags: any;
        negativeTags: any;
        comment: any;
        isVerified: any;
        isPublic: any;
        createdAt: any;
        reviewer: any;
        reviewedUser: any;
        trip: any;
    }>;
    deleteReview(reviewerId: string, reviewId: string): Promise<{
        message: string;
    }>;
    getUserReviews(userId: string, options: {
        page: number;
        limit: number;
    }): Promise<{
        reviews: {
            id: any;
            tripId: any;
            type: any;
            overallRating: number;
            punctualityRating: number | null;
            planningRating: number | null;
            costFairnessRating: number | null;
            coordinationRating: number | null;
            positiveTags: any;
            neutralTags: any;
            negativeTags: any;
            comment: any;
            isVerified: any;
            isPublic: any;
            createdAt: any;
            reviewer: any;
            reviewedUser: any;
            trip: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTripReviews(tripId: string, options: {
        page: number;
        limit: number;
    }): Promise<{
        reviews: {
            id: any;
            tripId: any;
            type: any;
            overallRating: number;
            punctualityRating: number | null;
            planningRating: number | null;
            costFairnessRating: number | null;
            coordinationRating: number | null;
            positiveTags: any;
            neutralTags: any;
            negativeTags: any;
            comment: any;
            isVerified: any;
            isPublic: any;
            createdAt: any;
            reviewer: any;
            reviewedUser: any;
            trip: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMyReviews(userId: string, type: 'given' | 'received', options: {
        page: number;
        limit: number;
    }): Promise<{
        reviews: {
            id: any;
            tripId: any;
            type: any;
            overallRating: number;
            punctualityRating: number | null;
            planningRating: number | null;
            costFairnessRating: number | null;
            coordinationRating: number | null;
            positiveTags: any;
            neutralTags: any;
            negativeTags: any;
            comment: any;
            isVerified: any;
            isPublic: any;
            createdAt: any;
            reviewer: any;
            reviewedUser: any;
            trip: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPendingReviews(userId: string, options: {
        page: number;
        limit: number;
    }): Promise<{
        pendingReviews: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getReviewSummary(userId: string): Promise<{
        totalReviews: number;
        averageRating: number;
        ratingBreakdown: {
            overall: number;
            punctuality: number;
            planning: number;
            costFairness: number;
            coordination: number;
        };
        topPositiveTags: {
            tag: string;
            count: number;
        }[];
        topNeutralTags: {
            tag: string;
            count: number;
        }[];
        topNegativeTags: {
            tag: string;
            count: number;
        }[];
        ratingDistribution: {
            1: number;
            2: number;
            3: number;
            4: number;
            5: number;
        };
    }>;
    private updateUserTrustScore;
    private formatReview;
}
export declare const reviewService: ReviewService;
export {};
//# sourceMappingURL=review.service.d.ts.map