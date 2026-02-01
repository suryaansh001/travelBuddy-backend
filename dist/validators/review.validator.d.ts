import { z } from 'zod';
export declare const REVIEW_TYPES: readonly ["companion", "trip"];
export declare const POSITIVE_TAGS: readonly ["punctual", "friendly", "helpful", "organized", "good_communicator", "flexible", "respectful", "fun", "trustworthy", "clean"];
export declare const NEUTRAL_TAGS: readonly ["quiet", "reserved", "average_timing", "basic_planning"];
export declare const NEGATIVE_TAGS: readonly ["late", "disorganized", "poor_communication", "unresponsive", "inflexible", "messy", "rude"];
export declare const createReviewSchema: z.ZodObject<{
    tripId: z.ZodString;
    reviewedUserId: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        trip: "trip";
        companion: "companion";
    }>;
    overallRating: z.ZodCoercedNumber<unknown>;
    punctualityRating: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    planningRating: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    costFairnessRating: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    coordinationRating: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    positiveTags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    neutralTags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    negativeTags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    comment: z.ZodOptional<z.ZodString>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updateReviewSchema: z.ZodObject<{
    reviewId: z.ZodString;
    overallRating: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    punctualityRating: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    planningRating: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    costFairnessRating: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    coordinationRating: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    positiveTags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    neutralTags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    negativeTags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    comment: z.ZodOptional<z.ZodString>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const getUserReviewsSchema: z.ZodObject<{
    userId: z.ZodString;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const getTripReviewsSchema: z.ZodObject<{
    tripId: z.ZodString;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const getMyReviewsSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<{
        given: "given";
        received: "received";
    }>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const getPendingReviewsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const getReviewSummarySchema: z.ZodObject<{
    userId: z.ZodString;
}, z.core.$strip>;
export declare const deleteReviewSchema: z.ZodObject<{
    reviewId: z.ZodString;
}, z.core.$strip>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type GetUserReviewsInput = z.infer<typeof getUserReviewsSchema>;
export type GetTripReviewsInput = z.infer<typeof getTripReviewsSchema>;
export type GetMyReviewsInput = z.infer<typeof getMyReviewsSchema>;
export type GetPendingReviewsInput = z.infer<typeof getPendingReviewsSchema>;
//# sourceMappingURL=review.validator.d.ts.map