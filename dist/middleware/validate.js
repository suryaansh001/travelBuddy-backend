import { ZodError } from 'zod';
import { AppError } from './errorHandler.js';
/**
 * Middleware to validate request body against a Zod schema
 */
export const validate = (schema) => {
    return async (req, _res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const messages = error.issues.map((e) => {
                    const path = e.path.join('.');
                    return path ? `${path}: ${e.message}` : e.message;
                });
                next(new AppError(messages.join(', '), 400));
            }
            else {
                next(error);
            }
        }
    };
};
/**
 * Middleware to validate request query parameters
 */
export const validateQuery = (schema) => {
    return async (req, _res, next) => {
        try {
            const parsed = await schema.parseAsync(req.query);
            // Store parsed query in a custom property since req.query is read-only
            req.validatedQuery = parsed;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const messages = error.issues.map((e) => {
                    const path = e.path.join('.');
                    return path ? `${path}: ${e.message}` : e.message;
                });
                next(new AppError(messages.join(', '), 400));
            }
            else {
                next(error);
            }
        }
    };
};
/**
 * Middleware to validate request params
 */
export const validateParams = (schema) => {
    return async (req, _res, next) => {
        try {
            req.params = await schema.parseAsync(req.params);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const messages = error.issues.map((e) => {
                    const path = e.path.join('.');
                    return path ? `${path}: ${e.message}` : e.message;
                });
                next(new AppError(messages.join(', '), 400));
            }
            else {
                next(error);
            }
        }
    };
};
//# sourceMappingURL=validate.js.map