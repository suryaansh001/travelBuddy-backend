import { Redis } from 'ioredis';
import { config } from './env.js';
export const redis = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
});
redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});
redis.on('connect', () => {
    console.log('Redis connected');
});
// Redis key prefixes for organization
export const REDIS_KEYS = {
    OTP_EMAIL: (email) => `otp:email:${email}`,
    OTP_PHONE: (phone) => `otp:phone:${phone}`,
    RESET_TOKEN: (token) => `reset:${token}`,
    REFRESH_TOKEN: (userId) => `refresh:${userId}`,
    BLACKLIST: (token) => `blacklist:${token}`,
    RATE_LIMIT: (key) => `ratelimit:${key}`,
    LOGIN_ATTEMPTS: (email) => `login:attempts:${email}`,
    OTP_RESEND_COUNT: (email) => `otp:resend:${email}`,
};
// TTL values in seconds
export const REDIS_TTL = {
    OTP: 10 * 60, // 10 minutes
    RESET_TOKEN: 60 * 60, // 1 hour
    REFRESH_TOKEN: 30 * 24 * 60 * 60, // 30 days
    LOGIN_LOCKOUT: 15 * 60, // 15 minutes
    RATE_LIMIT_WINDOW: 60 * 60, // 1 hour
};
//# sourceMappingURL=redis.js.map