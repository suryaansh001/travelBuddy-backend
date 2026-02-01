import { config } from '../config/env.js';
export class AppError extends Error {
    statusCode;
    isOperational;
    errors;
    constructor(message, statusCode = 500, errors) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Resource not found',
        path: req.originalUrl,
    });
};
export const errorHandler = (err, _req, res, _next) => {
    // Log error
    console.error('Error:', err);
    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err;
        if (prismaError.code === 'P2002') {
            return res.status(409).json({
                success: false,
                error: 'A record with this value already exists',
                field: prismaError.meta?.target?.[0],
            });
        }
        if (prismaError.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Record not found',
            });
        }
    }
    // Handle Zod validation errors
    if (err.name === 'ZodError') {
        const zodError = err;
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            errors: zodError.flatten().fieldErrors,
        });
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token',
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Token expired',
        });
    }
    // Handle AppError
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            ...(err.errors && { errors: err.errors }),
        });
    }
    // Default error response
    const statusCode = 500;
    const message = config.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(config.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
//# sourceMappingURL=errorHandler.js.map