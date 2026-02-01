import jwt from 'jsonwebtoken';
import type { Secret } from 'jsonwebtoken';
import { config } from '../config/env.js';

export interface TokenPayload {
  userId: string;
  email: string;
  isVerified: boolean;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret: Secret = config.JWT_SECRET;
  // JWT_EXPIRES_IN is a valid time string like '24h', '7d', etc.
  return jwt.sign(payload, secret, { expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  const secret: Secret = config.JWT_REFRESH_SECRET;
  return jwt.sign(payload, secret, { expiresIn: config.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
};

export const getTokenExpiration = (token: string): number | null => {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    return decoded?.exp || null;
  } catch {
    return null;
  }
};
