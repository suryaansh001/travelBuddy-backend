import { Router } from 'express';
import { reviewController } from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All review routes require authentication
router.use(authenticate);

// Get my reviews (given or received)
router.get('/my', reviewController.getMyReviews);

// Get pending reviews
router.get('/pending', reviewController.getPendingReviews);

// Get reviews for a specific user
router.get('/user/:userId', reviewController.getUserReviews);

// Get review summary for a user
router.get('/user/:userId/summary', reviewController.getReviewSummary);

// Get reviews for a trip
router.get('/trip/:tripId', reviewController.getTripReviews);

// Create a new review
router.post('/', reviewController.createReview);

// Update a review
router.put('/:reviewId', reviewController.updateReview);

// Delete a review
router.delete('/:reviewId', reviewController.deleteReview);

export default router;
