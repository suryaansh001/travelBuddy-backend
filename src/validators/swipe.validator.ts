import { z } from 'zod';

// Swipe directions
export const SWIPE_DIRECTIONS = ['left', 'right', 'super'] as const;

// 4.1 Swipe on Trip
export const swipeOnTripSchema = z.object({
  body: z.object({
    direction: z.enum(SWIPE_DIRECTIONS),
    introductionMessage: z.string()
      .max(500, 'Introduction message cannot exceed 500 characters')
      .optional(),
  }),
  params: z.object({
    tripId: z.string().uuid('Invalid trip ID'),
  }),
});

// 4.2 Get Swipes on My Trip (query params)
export const getSwipesQuerySchema = z.object({
  query: z.object({
    direction: z.enum(['right', 'super', 'all']).default('all'),
    excludeMatched: z.coerce.boolean().default(true),
    sortBy: z.enum(['trustScore', 'timestamp', 'super']).default('super'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
  params: z.object({
    tripId: z.string().uuid('Invalid trip ID'),
  }),
});

// 4.3 Creator Swipe on User
export const creatorSwipeSchema = z.object({
  body: z.object({
    direction: z.enum(['left', 'right']),
  }),
  params: z.object({
    tripId: z.string().uuid('Invalid trip ID'),
    userId: z.string().uuid('Invalid user ID'),
  }),
});

// 4.4 Get My Swipes (query params)
export const getMySwipesQuerySchema = z.object({
  query: z.object({
    direction: z.enum(['left', 'right', 'super', 'all']).default('all'),
    status: z.enum(['pending', 'matched', 'rejected', 'all']).default('all'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

// 4.5 Get Match Status
export const getMatchStatusSchema = z.object({
  params: z.object({
    tripId: z.string().uuid('Invalid trip ID'),
  }),
});

// Type exports
export type SwipeOnTripInput = z.infer<typeof swipeOnTripSchema>;
export type GetSwipesQueryInput = z.infer<typeof getSwipesQuerySchema>;
export type CreatorSwipeInput = z.infer<typeof creatorSwipeSchema>;
export type GetMySwipesInput = z.infer<typeof getMySwipesQuerySchema>;
export type GetMatchStatusInput = z.infer<typeof getMatchStatusSchema>;
