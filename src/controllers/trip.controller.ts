import type { Request, Response } from 'express';
import { tripService } from '../services/trip.service.js';
import { AppError } from '../middleware/errorHandler.js';

export class TripController {
  // 3.1 Create Trip
  async createTrip(req: Request, res: Response) {
    const trip = await tripService.createTrip(req.user!.id, req.body);
    
    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: trip,
    });
  }

  // 3.2 Get Trip Details
  async getTripDetails(req: Request, res: Response) {
    const tripId = req.params.tripId as string;
    
    if (!tripId) {
      throw new AppError('Trip ID is required', 400);
    }

    const trip = await tripService.getTripDetails(tripId, req.user?.id);
    
    res.json({
      success: true,
      data: trip,
    });
  }

  // 3.3 Search/Discover Trips
  async searchTrips(req: Request, res: Response) {
    const filters = (req as any).validatedQuery || req.query;
    const result = await tripService.searchTrips(req.user!.id, filters);
    
    res.json({
      success: true,
      data: result.trips,
      pagination: result.pagination,
    });
  }

  // 3.4 Get Nearby Trips
  async getNearbyTrips(req: Request, res: Response) {
    const filters = (req as any).validatedQuery || req.query;
    const result = await tripService.getNearbyTrips(req.user!.id, filters);
    
    res.json({
      success: true,
      data: result.trips,
      pagination: result.pagination,
    });
  }

  // 3.5 Update Trip
  async updateTrip(req: Request, res: Response) {
    const tripId = req.params.tripId as string;
    
    if (!tripId) {
      throw new AppError('Trip ID is required', 400);
    }

    const trip = await tripService.updateTrip(tripId, req.user!.id, req.body);
    
    res.json({
      success: true,
      message: 'Trip updated successfully',
      data: trip,
    });
  }

  // 3.6 Cancel Trip
  async cancelTrip(req: Request, res: Response) {
    const tripId = req.params.tripId as string;
    
    if (!tripId) {
      throw new AppError('Trip ID is required', 400);
    }

    const result = await tripService.cancelTrip(tripId, req.user!.id, req.body);
    
    res.json({
      success: true,
      message: result.message,
    });
  }

  // 3.7 Mark Trip In Progress
  async markInProgress(req: Request, res: Response) {
    const tripId = req.params.tripId as string;
    
    if (!tripId) {
      throw new AppError('Trip ID is required', 400);
    }

    const trip = await tripService.markTripInProgress(tripId, req.user!.id);
    
    res.json({
      success: true,
      message: 'Trip marked as in progress',
      data: trip,
    });
  }

  // 3.8 Mark Trip Completed
  async markCompleted(req: Request, res: Response) {
    const tripId = req.params.tripId as string;
    
    if (!tripId) {
      throw new AppError('Trip ID is required', 400);
    }

    const result = await tripService.markTripCompleted(tripId, req.user!.id);
    
    res.json({
      success: true,
      message: result.message,
    });
  }

  // 3.9 Get My Trips (Created)
  async getMyCreatedTrips(req: Request, res: Response) {
    const result = await tripService.getMyCreatedTrips(req.user!.id, req.query as any);
    
    res.json({
      success: true,
      data: result.trips,
      pagination: result.pagination,
    });
  }

  // 3.10 Get My Trips (Joined)
  async getMyJoinedTrips(req: Request, res: Response) {
    const result = await tripService.getMyJoinedTrips(req.user!.id, req.query as any);
    
    res.json({
      success: true,
      data: result.trips,
      pagination: result.pagination,
    });
  }

  // 3.11 Get Trip Participants
  async getTripParticipants(req: Request, res: Response) {
    const tripId = req.params.tripId as string;
    
    if (!tripId) {
      throw new AppError('Trip ID is required', 400);
    }

    const participants = await tripService.getTripParticipants(tripId, req.user?.id);
    
    res.json({
      success: true,
      data: participants,
    });
  }

  // 3.12 Get Trip Analytics
  async getTripAnalytics(req: Request, res: Response) {
    const tripId = req.params.tripId as string;
    
    if (!tripId) {
      throw new AppError('Trip ID is required', 400);
    }

    const analytics = await tripService.getTripAnalytics(tripId, req.user!.id);
    
    res.json({
      success: true,
      data: analytics,
    });
  }
}

export const tripController = new TripController();
