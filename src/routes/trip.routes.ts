import { Router } from 'express';
import { tripController } from '../controllers/trip.controller.js';
import { authenticate, requireVerified, optionalAuth } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import {
  createTripSchema,
  updateTripSchema,
  searchTripsSchema,
  nearbyTripsSchema,
  cancelTripSchema,
  myTripsQuerySchema,
} from '../validators/trip.validator.js';

const router = Router();

// Public route (with optional auth for personalization)
// 3.2 Get Trip Details
router.get('/:tripId', optionalAuth, tripController.getTripDetails.bind(tripController));

// All routes below require authentication
router.use(authenticate);

// 3.3 Search/Discover Trips
router.get(
  '/',
  validateQuery(searchTripsSchema),
  tripController.searchTrips.bind(tripController)
);

// 3.4 Get Nearby Trips
router.get(
  '/nearby',
  validateQuery(nearbyTripsSchema),
  tripController.getNearbyTrips.bind(tripController)
);

// 3.9 Get My Created Trips
router.get(
  '/my/created',
  validateQuery(myTripsQuerySchema),
  tripController.getMyCreatedTrips.bind(tripController)
);

// 3.10 Get My Joined Trips
router.get(
  '/my/joined',
  validateQuery(myTripsQuerySchema),
  tripController.getMyJoinedTrips.bind(tripController)
);

// 3.1 Create Trip (requires verified email)
router.post(
  '/',
  requireVerified,
  validate(createTripSchema),
  tripController.createTrip.bind(tripController)
);

// 3.5 Update Trip
router.patch(
  '/:tripId',
  validate(updateTripSchema),
  tripController.updateTrip.bind(tripController)
);

// 3.6 Cancel Trip
router.post(
  '/:tripId/cancel',
  validate(cancelTripSchema),
  tripController.cancelTrip.bind(tripController)
);

// 3.7 Mark Trip In Progress
router.post(
  '/:tripId/start',
  tripController.markInProgress.bind(tripController)
);

// 3.8 Mark Trip Completed
router.post(
  '/:tripId/complete',
  tripController.markCompleted.bind(tripController)
);

// 3.11 Get Trip Participants
router.get(
  '/:tripId/participants',
  tripController.getTripParticipants.bind(tripController)
);

// 3.12 Get Trip Analytics (Creator Only)
router.get(
  '/:tripId/analytics',
  tripController.getTripAnalytics.bind(tripController)
);

export default router;
