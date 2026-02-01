import { createClient } from 'redis';
import { config } from './env.js';

// Parse Redis URL or use direct config
let redisConfig: any;

if (config.REDIS_URL) {
  // If REDIS_URL is provided, use it
  redisConfig = { url: config.REDIS_URL };
} else {
  // Otherwise use individual config (for Redis Labs)
  redisConfig = {
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      connectTimeout: 10000,
    },
  };
}

export const redis = createClient(redisConfig);

redis.on('error', (err: Error) => {
  console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

// Connect to Redis
await redis.connect();

// Graceful disconnect
export async function disconnectRedis() {
  try {
    await redis.quit();
  } catch (err) {
    console.error('Error disconnecting Redis:', err);
  }
}

// Redis key prefixes for organization
export const REDIS_KEYS = {
  OTP_EMAIL: (email: string) => `otp:email:${email}`,
  OTP_PHONE: (phone: string) => `otp:phone:${phone}`,
  RESET_TOKEN: (token: string) => `reset:${token}`,
  REFRESH_TOKEN: (userId: string) => `refresh:${userId}`,
  BLACKLIST: (token: string) => `blacklist:${token}`,
  RATE_LIMIT: (key: string) => `ratelimit:${key}`,
  LOGIN_ATTEMPTS: (email: string) => `login:attempts:${email}`,
  OTP_RESEND_COUNT: (email: string) => `otp:resend:${email}`,
} as const;

// TTL values in seconds
export const REDIS_TTL = {
  OTP: 10 * 60, // 10 minutes
  RESET_TOKEN: 60 * 60, // 1 hour
  REFRESH_TOKEN: 30 * 24 * 60 * 60, // 30 days
  LOGIN_LOCKOUT: 15 * 60, // 15 minutes
  RATE_LIMIT_WINDOW: 60 * 60, // 1 hour
} as const;
