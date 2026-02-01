import { z } from 'zod';
export declare const TRIP_TYPES: readonly ["travel_buddy", "cab_pool"];
export declare const TRIP_STATUSES: readonly ["open", "in_progress", "completed", "cancelled"];
export declare const VIBE_TAGS: readonly ["chill", "adventurous", "music_lover", "talkative", "silent_traveler", "foodie", "night_owl", "early_bird", "road_trip", "budget", "eco_friendly", "pet_friendly", "study_buddy", "party_mode", "sightseeing"];
export declare const GENDER_PREFERENCES: readonly ["any", "male", "female", "same"];
export declare const createTripSchema: z.ZodObject<{
    type: z.ZodEnum<{
        travel_buddy: "travel_buddy";
        cab_pool: "cab_pool";
    }>;
    originCity: z.ZodString;
    originLat: z.ZodOptional<z.ZodNumber>;
    originLng: z.ZodOptional<z.ZodNumber>;
    originAddress: z.ZodOptional<z.ZodString>;
    destinationCity: z.ZodString;
    destinationLat: z.ZodOptional<z.ZodNumber>;
    destinationLng: z.ZodOptional<z.ZodNumber>;
    destinationAddress: z.ZodOptional<z.ZodString>;
    departureDate: z.ZodString;
    departureTime: z.ZodString;
    departureTimeWindow: z.ZodOptional<z.ZodNumber>;
    estimatedDuration: z.ZodOptional<z.ZodNumber>;
    totalSeats: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    vibeTags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    estimatedFare: z.ZodOptional<z.ZodNumber>;
    luggageSpace: z.ZodOptional<z.ZodBoolean>;
    genderPreference: z.ZodOptional<z.ZodEnum<{
        male: "male";
        female: "female";
        any: "any";
        same: "same";
    }>>;
    sameDepartmentOnly: z.ZodOptional<z.ZodBoolean>;
    sameYearOnly: z.ZodOptional<z.ZodBoolean>;
    verifiedUsersOnly: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export declare const updateTripSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    departureTime: z.ZodOptional<z.ZodString>;
    departureTimeWindow: z.ZodOptional<z.ZodNumber>;
    vibeTags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    genderPreference: z.ZodOptional<z.ZodEnum<{
        male: "male";
        female: "female";
        any: "any";
        same: "same";
    }>>;
    luggageSpace: z.ZodOptional<z.ZodBoolean>;
    totalSeats: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export declare const searchTripsSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        open: "open";
        in_progress: "in_progress";
        completed: "completed";
        cancelled: "cancelled";
    }>>;
    originCity: z.ZodOptional<z.ZodString>;
    destinationCity: z.ZodOptional<z.ZodString>;
    departureDate: z.ZodOptional<z.ZodString>;
    departureDateEnd: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        travel_buddy: "travel_buddy";
        cab_pool: "cab_pool";
    }>>;
    minSeats: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    genderPreference: z.ZodOptional<z.ZodEnum<{
        male: "male";
        female: "female";
        any: "any";
        same: "same";
    }>>;
    minTrustScore: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    verifiedOnly: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    vibeTags: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodDefault<z.ZodEnum<{
        trustScore: "trustScore";
        createdAt: "createdAt";
        departure: "departure";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export type SearchTripsInput = z.infer<typeof searchTripsSchema>;
export declare const nearbyTripsSchema: z.ZodObject<{
    lat: z.ZodCoercedNumber<unknown>;
    lng: z.ZodCoercedNumber<unknown>;
    radiusKm: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type NearbyTripsInput = z.infer<typeof nearbyTripsSchema>;
export declare const cancelTripSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CancelTripInput = z.infer<typeof cancelTripSchema>;
export declare const tripIdParamSchema: z.ZodObject<{
    tripId: z.ZodString;
}, z.core.$strip>;
export declare const myTripsQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        open: "open";
        in_progress: "in_progress";
        completed: "completed";
        cancelled: "cancelled";
    }>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type MyTripsQueryInput = z.infer<typeof myTripsQuerySchema>;
//# sourceMappingURL=trip.validator.d.ts.map