import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';
import { redis, REDIS_KEYS } from '../config/redis.js';
import { prisma } from '../config/database.js';
import { AppError } from './errorHandler.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        isVerified: boolean;
        fullName: string;
        collegeName: string;
        collegeDomain: string;
        isBlocked: boolean;
        isActive: boolean;
      };
      token?: string;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
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
    let payload: TokenPayload;
    try {
      payload = verifyAccessToken(token);
    } catch (error: any) {
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
  } catch (error) {
    next(error);
  }
};

// Middleware to require verified email
export const requireVerified = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user?.isVerified) {
    return next(new AppError('Email verification required', 403));
  }
  next();
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
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
    } catch {
      // Token invalid, continue without user
    }

    next();
  } catch (error) {
    next(error);
  }
};
