import type { Request, Response, NextFunction } from 'express';
export declare const trackEvent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTrendingRoutes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const suggestTrips: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserMatchingScore: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPlatformAnalytics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCollegeLeaderboard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserBehaviorInsights: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=analytics.controller.d.ts.map