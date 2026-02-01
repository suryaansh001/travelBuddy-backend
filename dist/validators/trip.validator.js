import { z } from 'zod';
// Trip Types
export const TRIP_TYPES = ['travel_buddy', 'cab_pool'];
export const TRIP_STATUSES = ['open', 'in_progress', 'completed', 'cancelled'];
// Vibe Tags
export const VIBE_TAGS = [
    'chill',
    'adventurous',
    'music_lover',
    'talkative',
    'silent_traveler',
    'foodie',
    'night_owl',
    'early_bird',
    'road_trip',
    'budget',
    'eco_friendly',
    'pet_friendly',
    'study_buddy',
    'party_mode',
    'sightseeing',
];
// Gender Preferences
export const GENDER_PREFERENCES = ['any', 'male', 'female', 'same'];
// Create Trip Schema
export const createTripSchema = z.object({
    type: z.enum(TRIP_TYPES),
    // Origin
    originCity: z.string().min(2).max(100),
    originLat: z.number().min(-90).max(90).optional(),
    originLng: z.number().min(-180).max(180).optional(),
    originAddress: z.string().max(500).optional(),
    // Destination
    destinationCity: z.string().min(2).max(100),
    destinationLat: z.number().min(-90).max(90).optional(),
    destinationLng: z.number().min(-180).max(180).optional(),
    destinationAddress: z.string().max(500).optional(),
    // Timing
    departureDate: z.string().refine((date) => {
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d >= today;
    }, { message: 'Departure date must be today or in the future' }),
    departureTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    departureTimeWindow: z.number().int().min(0).max(120).optional(), // minutes
    estimatedDuration: z.number().int().min(1).optional(), // minutes
    // Capacity
    totalSeats: z.number().int().min(1).max(8),
    // Details
    title: z.string().min(5).max(200).optional(),
    description: z.string().max(1000).optional(),
    vibeTags: z.array(z.string()).max(5).optional(),
    // Cab Pool Specific
    estimatedFare: z.number().positive().optional(),
    luggageSpace: z.boolean().optional(),
    // Filters
    genderPreference: z.enum(GENDER_PREFERENCES).optional(),
    sameDepartmentOnly: z.boolean().optional(),
    sameYearOnly: z.boolean().optional(),
    verifiedUsersOnly: z.boolean().optional(),
}).refine((data) => {
    // If cab_pool, estimatedFare is required
    if (data.type === 'cab_pool' && !data.estimatedFare) {
        return false;
    }
    return true;
}, { message: 'Estimated fare is required for cab pool trips', path: ['estimatedFare'] })
    .refine((data) => {
    // Origin and destination cannot be the same
    return data.originCity.toLowerCase() !== data.destinationCity.toLowerCase();
}, { message: 'Origin and destination cannot be the same', path: ['destinationCity'] });
// Update Trip Schema
export const updateTripSchema = z.object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().max(1000).optional(),
    departureTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format').optional(),
    departureTimeWindow: z.number().int().min(0).max(120).optional(),
    vibeTags: z.array(z.string()).max(5).optional(),
    genderPreference: z.enum(GENDER_PREFERENCES).optional(),
    luggageSpace: z.boolean().optional(),
    totalSeats: z.number().int().min(1).max(8).optional(),
});
// Search Trips Schema
export const searchTripsSchema = z.object({
    status: z.enum(TRIP_STATUSES).optional(),
    originCity: z.string().optional(),
    destinationCity: z.string().optional(),
    departureDate: z.string().optional(),
    departureDateEnd: z.string().optional(),
    type: z.enum(TRIP_TYPES).optional(),
    minSeats: z.coerce.number().int().min(1).optional(),
    genderPreference: z.enum(GENDER_PREFERENCES).optional(),
    minTrustScore: z.coerce.number().min(0).max(5).optional(),
    verifiedOnly: z.coerce.boolean().optional(),
    vibeTags: z.string().optional(), // comma-separated
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    sortBy: z.enum(['departure', 'trustScore', 'createdAt']).default('departure'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
});
// Nearby Trips Schema
export const nearbyTripsSchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    radiusKm: z.coerce.number().min(1).max(500).default(50),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});
// Cancel Trip Schema
export const cancelTripSchema = z.object({
    reason: z.string().max(500).optional(),
});
// Trip ID Param Schema
export const tripIdParamSchema = z.object({
    tripId: z.string().uuid(),
});
// My Trips Query Schema
export const myTripsQuerySchema = z.object({
    status: z.enum(TRIP_STATUSES).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});
//# sourceMappingURL=trip.validator.js.map