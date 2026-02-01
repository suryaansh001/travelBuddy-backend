import { z } from 'zod';
export declare const MATCH_STATUSES: readonly ["pending", "accepted", "rejected", "cancelled"];
export declare const acceptMatchSchema: z.ZodObject<{
    body: z.ZodObject<{
        seatsRequested: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    params: z.ZodObject<{
        matchId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const rejectMatchSchema: z.ZodObject<{
    body: z.ZodOptional<z.ZodObject<{
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    params: z.ZodObject<{
        matchId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const cancelMatchSchema: z.ZodObject<{
    body: z.ZodOptional<z.ZodObject<{
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    params: z.ZodObject<{
        matchId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getMyMatchesQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        status: z.ZodDefault<z.ZodEnum<{
            cancelled: "cancelled";
            pending: "pending";
            accepted: "accepted";
            rejected: "rejected";
            all: "all";
        }>>;
        role: z.ZodDefault<z.ZodEnum<{
            creator: "creator";
            participant: "participant";
            all: "all";
        }>>;
        page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getMatchDetailsSchema: z.ZodObject<{
    params: z.ZodObject<{
        matchId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type AcceptMatchInput = z.infer<typeof acceptMatchSchema>;
export type RejectMatchInput = z.infer<typeof rejectMatchSchema>;
export type CancelMatchInput = z.infer<typeof cancelMatchSchema>;
export type GetMyMatchesInput = z.infer<typeof getMyMatchesQuerySchema>;
export type GetMatchDetailsInput = z.infer<typeof getMatchDetailsSchema>;
//# sourceMappingURL=match.validator.d.ts.map