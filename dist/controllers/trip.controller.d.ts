import type { Request, Response } from 'express';
export declare class TripController {
    createTrip(req: Request, res: Response): Promise<void>;
    getTripDetails(req: Request, res: Response): Promise<void>;
    searchTrips(req: Request, res: Response): Promise<void>;
    getNearbyTrips(req: Request, res: Response): Promise<void>;
    updateTrip(req: Request, res: Response): Promise<void>;
    cancelTrip(req: Request, res: Response): Promise<void>;
    markInProgress(req: Request, res: Response): Promise<void>;
    markCompleted(req: Request, res: Response): Promise<void>;
    getMyCreatedTrips(req: Request, res: Response): Promise<void>;
    getMyJoinedTrips(req: Request, res: Response): Promise<void>;
    getTripParticipants(req: Request, res: Response): Promise<void>;
    getTripAnalytics(req: Request, res: Response): Promise<void>;
}
export declare const tripController: TripController;
//# sourceMappingURL=trip.controller.d.ts.map