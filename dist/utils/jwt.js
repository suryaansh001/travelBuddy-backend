import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
export const generateAccessToken = (payload) => {
    const secret = config.JWT_SECRET;
    // JWT_EXPIRES_IN is a valid time string like '24h', '7d', etc.
    return jwt.sign(payload, secret, { expiresIn: config.JWT_EXPIRES_IN });
};
export const generateRefreshToken = (payload) => {
    const secret = config.JWT_REFRESH_SECRET;
    return jwt.sign(payload, secret, { expiresIn: config.JWT_REFRESH_EXPIRES_IN });
};
export const verifyAccessToken = (token) => {
    return jwt.verify(token, config.JWT_SECRET);
};
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
};
export const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    }
    catch {
        return null;
    }
};
export const getTokenExpiration = (token) => {
    try {
        const decoded = jwt.decode(token);
        return decoded?.exp || null;
    }
    catch {
        return null;
    }
};
//# sourceMappingURL=jwt.js.map