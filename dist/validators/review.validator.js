import { z } from 'zod';
// Review types
export const REVIEW_TYPES = ['companion', 'trip'];
// Rating tags
export const POSITIVE_TAGS = [
    'punctual', 'friendly', 'helpful', 'organized', 'good_communicator',
    'flexible', 'respectful', 'fun', 'trustworthy', 'clean'
];
export const NEUTRAL_TAGS = [
    'quiet', 'reserved', 'average_timing', 'basic_planning'
];
export const NEGATIVE_TAGS = [
    'late', 'disorganized', 'poor_communication', 'unresponsive',
    'inflexible', 'messy', 'rude'
];
// Create a review for a companion
export const createReviewSchema = z.object({
    tripId: z.string().uuid(),
    reviewedUserId: z.string().uuid().optional(), // Required for companion reviews
    type: z.enum(REVIEW_TYPES),
    overallRating: z.coerce.number().min(1).max(5),
    punctualityRating: z.coerce.number().min(1).max(5).optional(),
    planningRating: z.coerce.number().min(1).max(5).optional(),
    costFairnessRating: z.coerce.number().min(1).max(5).optional(),
    coordinationRating: z.coerce.number().min(1).max(5).optional(),
    positiveTags: z.array(z.string()).default([]),
    neutralTags: z.array(z.string()).default([]),
    negativeTags: z.array(z.string()).default([]),
    comment: z.string().max(1000).optional(),
    isPublic: z.boolean().default(true),
}).refine((data) => {
    // Companion reviews require reviewedUserId
    if (data.type === 'companion' && !data.reviewedUserId) {
        return false;
    }
    return true;
}, { message: 'reviewedUserId is required for companion reviews' });
// Update a review
export const updateReviewSchema = z.object({
    reviewId: z.string().uuid(),
    overallRating: z.coerce.number().min(1).max(5).optional(),
    punctualityRating: z.coerce.number().min(1).max(5).optional(),
    planningRating: z.coerce.number().min(1).max(5).optional(),
    costFairnessRating: z.coerce.number().min(1).max(5).optional(),
    coordinationRating: z.coerce.number().min(1).max(5).optional(),
    positiveTags: z.array(z.string()).optional(),
    neutralTags: z.array(z.string()).optional(),
    negativeTags: z.array(z.string()).optional(),
    comment: z.string().max(1000).optional(),
    isPublic: z.boolean().optional(),
});
// Get reviews for a user
export const getUserReviewsSchema = z.object({
    userId: z.string().uuid(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});
// Get reviews for a trip
export const getTripReviewsSchema = z.object({
    tripId: z.string().uuid(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});
// Get my reviews (given or received)
export const getMyReviewsSchema = z.object({
    type: z.enum(['given', 'received']).default('received'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});
// Get pending reviews (trips completed but not reviewed)
export const getPendingReviewsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});
// Get review summary for a user
export const getReviewSummarySchema = z.object({
    userId: z.string().uuid(),
});
// Delete review params
export const deleteReviewSchema = z.object({
    reviewId: z.string().uuid(),
});
//# sourceMappingURL=review.validator.js.map