import { Router } from 'express';
import { swipeController } from '../controllers/swipe.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All swipe routes require authentication
router.use(authenticate);

// 4.1 Swipe on Trip
router.post('/trips/:tripId', swipeController.swipeOnTrip.bind(swipeController));

// 4.2 Get Swipes on My Trip (Creator View)
router.get('/trips/:tripId', swipeController.getSwipesOnTrip.bind(swipeController));

// 4.3 Creator Swipe on User
router.post('/trips/:tripId/users/:userId', swipeController.creatorSwipeOnUser.bind(swipeController));

// 4.4 Get My Swipes
router.get('/my', swipeController.getMySwipes.bind(swipeController));

// 4.5 Get Match Status for a Trip
router.get('/trips/:tripId/status', swipeController.getMatchStatus.bind(swipeController));

// Get Swipe Summary (for trip analytics)
router.get('/trips/:tripId/summary', swipeController.getSwipeSummary.bind(swipeController));

export default router;
