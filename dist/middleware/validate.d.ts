import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * Middleware to validate request body against a Zod schema
 */
export declare const validate: <T>(schema: ZodSchema<T>) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to validate request query parameters
 */
export declare const validateQuery: <T>(schema: ZodSchema<T>) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to validate request params
 */
export declare const validateParams: <T>(schema: ZodSchema<T>) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validate.d.ts.map