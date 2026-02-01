import { verifyAccessToken } from '../utils/jwt.js';
import { redis, REDIS_KEYS } from '../config/redis.js';
import { prisma } from '../config/database.js';
import { AppError } from './errorHandler.js';
export const authenticate = async (req, _res, next) => {
    try {
        // Extract token from header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new AppError('Access token required', 401);
        }
        const token = authHeader.split(' ')[1];
        // Check if token is blacklisted
        const isBlacklisted = await redis.exists(REDIS_KEYS.BLACKLIST(token));
        if (isBlacklisted) {
            throw new AppError('Token has been revoked', 401);
        }
        // Verify token
        let payload;
        try {
            payload = verifyAccessToken(token);
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new AppError('Token expired', 401);
            }
            throw new AppError('Invalid token', 401);
        }
        // Fetch user from database
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                fullName: true,
                collegeName: true,
                collegeDomain: true,
                isBlocked: true,
                isActive: true,
            },
        });
        if (!user) {
            throw new AppError('User not found', 401);
        }
        if (user.isBlocked) {
            throw new AppError('Your account has been blocked', 403);
        }
        if (!user.isActive) {
            throw new AppError('Your account is inactive', 403);
        }
        // Attach user and token to request
        req.user = {
            id: user.id,
            email: user.email,
            isVerified: user.emailVerified,
            fullName: user.fullName,
            collegeName: user.collegeName,
            collegeDomain: user.collegeDomain,
            isBlocked: user.isBlocked,
            isActive: user.isActive,
        };
        req.token = token;
        next();
    }
    catch (error) {
        next(error);
    }
};
// Middleware to require verified email
export const requireVerified = (req, _res, next) => {
    if (!req.user?.isVerified) {
        return next(new AppError('Email verification required', 403));
    }
    next();
};
// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.split(' ')[1];
        const isBlacklisted = await redis.exists(REDIS_KEYS.BLACKLIST(token));
        if (isBlacklisted) {
            return next();
        }
        try {
            const payload = verifyAccessToken(token);
            const user = await prisma.user.findUnique({
                where: { id: payload.userId },
                select: {
                    id: true,
                    email: true,
                    emailVerified: true,
                    fullName: true,
                    collegeName: true,
                    collegeDomain: true,
                    isBlocked: true,
                    isActive: true,
                },
            });
            if (user && !user.isBlocked && user.isActive) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    isVerified: user.emailVerified,
                    fullName: user.fullName,
                    collegeName: user.collegeName,
                    collegeDomain: user.collegeDomain,
                    isBlocked: user.isBlocked,
                    isActive: user.isActive,
                };
                req.token = token;
            }
        }
        catch {
            // Token invalid, continue without user
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=auth.js.map