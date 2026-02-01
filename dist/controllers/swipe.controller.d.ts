import type { Request, Response, NextFunction } from 'express';
export declare class SwipeController {
    swipeOnTrip(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSwipesOnTrip(req: Request, res: Response, next: NextFunction): Promise<void>;
    creatorSwipeOnUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMySwipes(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMatchStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSwipeSummary(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const swipeController: SwipeController;
//# sourceMappingURL=swipe.controller.d.ts.map