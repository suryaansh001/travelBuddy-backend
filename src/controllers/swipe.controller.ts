import type { Request, Response, NextFunction } from 'express';
import { swipeService } from '../services/swipe.service.js';
import {
  swipeOnTripSchema,
  getSwipesQuerySchema,
  creatorSwipeSchema,
  getMySwipesQuerySchema,
  getMatchStatusSchema,
} from '../validators/swipe.validator.js';

export class SwipeController {
  // 4.1 Swipe on Trip
  async swipeOnTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = swipeOnTripSchema.parse({
        body: req.body,
        params: req.params,
      });

      const result = await swipeService.swipeOnTrip(
        req.user!.id,
        validated.params.tripId,
        validated.body.direction,
        validated.body.introductionMessage
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // 4.2 Get Swipes on My Trip (Creator View)
  async getSwipesOnTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = getSwipesQuerySchema.parse({
        query: req.query,
        params: req.params,
      });

      const result = await swipeService.getSwipesOnTrip(
        req.user!.id,
        validated.params.tripId,
        {
          direction: validated.query.direction,
          excludeMatched: validated.query.excludeMatched,
          sortBy: validated.query.sortBy,
          page: validated.query.page,
          limit: validated.query.limit,
        }
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // 4.3 Creator Swipe on User
  async creatorSwipeOnUser(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = creatorSwipeSchema.parse({
        body: req.body,
        params: req.params,
      });

      const result = await swipeService.creatorSwipeOnUser(
        req.user!.id,
        validated.params.tripId,
        validated.params.userId,
        validated.body.direction
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // 4.4 Get My Swipes
  async getMySwipes(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = getMySwipesQuerySchema.parse({
        query: req.query,
      });

      const result = await swipeService.getMySwipes(req.user!.id, {
        direction: validated.query.direction,
        status: validated.query.status,
        page: validated.query.page,
        limit: validated.query.limit,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // 4.5 Get Match Status
  async getMatchStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = getMatchStatusSchema.parse({
        params: req.params,
      });

      const result = await swipeService.getMatchStatus(
        req.user!.id,
        validated.params.tripId
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get Swipe Summary (for trip analytics)
  async getSwipeSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const tripId = req.params.tripId as string;
      const result = await swipeService.getSwipeSummary(tripId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const swipeController = new SwipeController();
