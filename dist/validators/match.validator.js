import { z } from 'zod';
// Match status types
export const MATCH_STATUSES = ['pending', 'accepted', 'rejected', 'cancelled'];
// 4.6 Accept Match
export const acceptMatchSchema = z.object({
    body: z.object({
        seatsRequested: z.number()
            .int('Seats must be a whole number')
            .min(1, 'Must request at least 1 seat')
            .max(8, 'Cannot request more than 8 seats')
            .default(1),
    }),
    params: z.object({
        matchId: z.string().uuid('Invalid match ID'),
    }),
});
// 4.7 Reject Match
export const rejectMatchSchema = z.object({
    body: z.object({
        reason: z.string()
            .max(500, 'Reason cannot exceed 500 characters')
            .optional(),
    }).optional(),
    params: z.object({
        matchId: z.string().uuid('Invalid match ID'),
    }),
});
// 4.8 Cancel Match
export const cancelMatchSchema = z.object({
    body: z.object({
        reason: z.string()
            .max(500, 'Reason cannot exceed 500 characters')
            .optional(),
    }).optional(),
    params: z.object({
        matchId: z.string().uuid('Invalid match ID'),
    }),
});
// Get My Matches (query params)
export const getMyMatchesQuerySchema = z.object({
    query: z.object({
        status: z.enum(['pending', 'accepted', 'rejected', 'cancelled', 'all']).default('all'),
        role: z.enum(['creator', 'participant', 'all']).default('all'),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(50).default(20),
    }),
});
// Get Match Details
export const getMatchDetailsSchema = z.object({
    params: z.object({
        matchId: z.string().uuid('Invalid match ID'),
    }),
});
//# sourceMappingURL=match.validator.js.map