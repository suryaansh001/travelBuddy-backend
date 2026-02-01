import { reviewService } from '../services/review.service.js';
import { createReviewSchema, updateReviewSchema, getUserReviewsSchema, getTripReviewsSchema, getMyReviewsSchema, getPendingReviewsSchema, getReviewSummarySchema, deleteReviewSchema, } from '../validators/review.validator.js';
class ReviewController {
    // Create a new review
    async createReview(req, res, next) {
        try {
            const userId = req.user.id;
            const data = createReviewSchema.parse(req.body);
            const review = await reviewService.createReview(userId, data);
            res.status(201).json({ success: true, data: review });
        }
        catch (error) {
            next(error);
        }
    }
    // Update a review
    async updateReview(req, res, next) {
        try {
            const userId = req.user.id;
            const { reviewId, ...data } = updateReviewSchema.parse({
                reviewId: req.params.reviewId,
                ...req.body,
            });
            const review = await reviewService.updateReview(userId, reviewId, data);
            res.json({ success: true, data: review });
        }
        catch (error) {
            next(error);
        }
    }
    // Delete a review
    async deleteReview(req, res, next) {
        try {
            const userId = req.user.id;
            const { reviewId } = deleteReviewSchema.parse({ reviewId: req.params.reviewId });
            const result = await reviewService.deleteReview(userId, reviewId);
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    // Get reviews for a user
    async getUserReviews(req, res, next) {
        try {
            const { userId, page, limit } = getUserReviewsSchema.parse({
                userId: req.params.userId,
                ...req.query,
            });
            const result = await reviewService.getUserReviews(userId, { page, limit });
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    // Get reviews for a trip
    async getTripReviews(req, res, next) {
        try {
            const { tripId, page, limit } = getTripReviewsSchema.parse({
                tripId: req.params.tripId,
                ...req.query,
            });
            const result = await reviewService.getTripReviews(tripId, { page, limit });
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    // Get my reviews
    async getMyReviews(req, res, next) {
        try {
            const userId = req.user.id;
            const { type, page, limit } = getMyReviewsSchema.parse(req.query);
            const result = await reviewService.getMyReviews(userId, type, { page, limit });
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    // Get pending reviews
    async getPendingReviews(req, res, next) {
        try {
            const userId = req.user.id;
            const { page, limit } = getPendingReviewsSchema.parse(req.query);
            const result = await reviewService.getPendingReviews(userId, { page, limit });
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    // Get review summary for a user
    async getReviewSummary(req, res, next) {
        try {
            const { userId } = getReviewSummarySchema.parse({ userId: req.params.userId });
            const result = await reviewService.getReviewSummary(userId);
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
}
export const reviewController = new ReviewController();
//# sourceMappingURL=review.controller.js.map