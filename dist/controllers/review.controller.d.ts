import type { Request, Response, NextFunction } from 'express';
declare class ReviewController {
    createReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserReviews(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTripReviews(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyReviews(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPendingReviews(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReviewSummary(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const reviewController: ReviewController;
export {};
//# sourceMappingURL=review.controller.d.ts.map