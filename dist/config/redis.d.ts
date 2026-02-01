import { Redis } from 'ioredis';
export declare const redis: Redis;
export declare const REDIS_KEYS: {
    readonly OTP_EMAIL: (email: string) => string;
    readonly OTP_PHONE: (phone: string) => string;
    readonly RESET_TOKEN: (token: string) => string;
    readonly REFRESH_TOKEN: (userId: string) => string;
    readonly BLACKLIST: (token: string) => string;
    readonly RATE_LIMIT: (key: string) => string;
    readonly LOGIN_ATTEMPTS: (email: string) => string;
    readonly OTP_RESEND_COUNT: (email: string) => string;
};
export declare const REDIS_TTL: {
    readonly OTP: number;
    readonly RESET_TOKEN: number;
    readonly REFRESH_TOKEN: number;
    readonly LOGIN_LOCKOUT: number;
    readonly RATE_LIMIT_WINDOW: number;
};
//# sourceMappingURL=redis.d.ts.map