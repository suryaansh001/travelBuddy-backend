import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as analyticsController from '../controllers/analytics.controller.js';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

// 9.1 Track Event
router.post('/events', analyticsController.trackEvent);

// 9.2 Get Trending Routes
router.get('/trending-routes', analyticsController.getTrendingRoutes);

// 9.3 Suggest Trips
router.get('/suggestions', analyticsController.suggestTrips);

// 9.4 User Matching Score
router.get('/matching-score/:targetUserId', analyticsController.getUserMatchingScore);

// 9.5 Platform Analytics (Admin) - No admin middleware since no admin role in schema
router.get('/platform', analyticsController.getPlatformAnalytics);

// 9.6 College Leaderboard
router.get('/leaderboard', analyticsController.getCollegeLeaderboard);

// 9.7 User Behavior Insights
router.get('/insights', analyticsController.getUserBehaviorInsights);

export default router;
