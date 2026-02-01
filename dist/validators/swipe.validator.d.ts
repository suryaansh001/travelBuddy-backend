import { z } from 'zod';
export declare const SWIPE_DIRECTIONS: readonly ["left", "right", "super"];
export declare const swipeOnTripSchema: z.ZodObject<{
    body: z.ZodObject<{
        direction: z.ZodEnum<{
            right: "right";
            left: "left";
            super: "super";
        }>;
        introductionMessage: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    params: z.ZodObject<{
        tripId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getSwipesQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        direction: z.ZodDefault<z.ZodEnum<{
            right: "right";
            super: "super";
            all: "all";
        }>>;
        excludeMatched: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
        sortBy: z.ZodDefault<z.ZodEnum<{
            trustScore: "trustScore";
            super: "super";
            timestamp: "timestamp";
        }>>;
        page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    params: z.ZodObject<{
        tripId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const creatorSwipeSchema: z.ZodObject<{
    body: z.ZodObject<{
        direction: z.ZodEnum<{
            right: "right";
            left: "left";
        }>;
    }, z.core.$strip>;
    params: z.ZodObject<{
        tripId: z.ZodString;
        userId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getMySwipesQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        direction: z.ZodDefault<z.ZodEnum<{
            right: "right";
            left: "left";
            super: "super";
            all: "all";
        }>>;
        status: z.ZodDefault<z.ZodEnum<{
            pending: "pending";
            rejected: "rejected";
            all: "all";
            matched: "matched";
        }>>;
        page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getMatchStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        tripId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type SwipeOnTripInput = z.infer<typeof swipeOnTripSchema>;
export type GetSwipesQueryInput = z.infer<typeof getSwipesQuerySchema>;
export type CreatorSwipeInput = z.infer<typeof creatorSwipeSchema>;
export type GetMySwipesInput = z.infer<typeof getMySwipesQuerySchema>;
export type GetMatchStatusInput = z.infer<typeof getMatchStatusSchema>;
//# sourceMappingURL=swipe.validator.d.ts.map