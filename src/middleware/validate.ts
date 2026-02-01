import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';
import { AppError } from './errorHandler.js';

/**
 * Middleware to validate request body against a Zod schema
 */
export const validate = <T>(schema: ZodSchema<T>) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = (error.issues as ZodIssue[]).map((e: ZodIssue) => {
          const path = e.path.join('.');
          return path ? `${path}: ${e.message}` : e.message;
        });
        next(new AppError(messages.join(', '), 400));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware to validate request query parameters
 */
export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.query);
      // Store parsed query in a custom property since req.query is read-only
      (req as any).validatedQuery = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = (error.issues as ZodIssue[]).map((e: ZodIssue) => {
          const path = e.path.join('.');
          return path ? `${path}: ${e.message}` : e.message;
        });
        next(new AppError(messages.join(', '), 400));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware to validate request params
 */
export const validateParams = <T>(schema: ZodSchema<T>) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = await schema.parseAsync(req.params) as typeof req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = (error.issues as ZodIssue[]).map((e: ZodIssue) => {
          const path = e.path.join('.');
          return path ? `${path}: ${e.message}` : e.message;
        });
        next(new AppError(messages.join(', '), 400));
      } else {
        next(error);
      }
    }
  };
};
