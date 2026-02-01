import type { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service.js';
import {
  trackEventSchema,
  getTrendingRoutesSchema,
  suggestTripsSchema,
  platformAnalyticsSchema,
  collegeLeaderboardSchema,
  userBehaviorInsightsSchema,
} from '../validators/analytics.validator.js';

// 9.1 Track Event
export const trackEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = trackEventSchema.parse(req.body);
    const result = await analyticsService.trackEvent(userId, data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 9.2 Get Trending Routes
export const getTrendingRoutes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const params = getTrendingRoutesSchema.parse(req.query);
    const result = await analyticsService.getTrendingRoutes(params);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 9.3 Suggest Trips
export const suggestTrips = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const params = suggestTripsSchema.parse(req.query);
    const result = await analyticsService.suggestTrips(userId, params);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 9.4 User Matching Score
export const getUserMatchingScore = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const targetUserId = req.params.targetUserId as string;
    const result = await analyticsService.getUserMatchingScore(userId, targetUserId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 9.5 Platform Analytics (Admin)
export const getPlatformAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const params = platformAnalyticsSchema.parse(req.query);
    const result = await analyticsService.getPlatformAnalytics(params);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 9.6 College Leaderboard
export const getCollegeLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const params = collegeLeaderboardSchema.parse(req.query);
    const result = await analyticsService.getCollegeLeaderboard(params);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 9.7 User Behavior Insights
export const getUserBehaviorInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const params = userBehaviorInsightsSchema.parse(req.query);
    const result = await analyticsService.getUserBehaviorInsights(userId, params);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
