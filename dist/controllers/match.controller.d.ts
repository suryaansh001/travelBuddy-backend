import type { Request, Response, NextFunction } from 'express';
export declare class MatchController {
    acceptMatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    rejectMatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    cancelMatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyMatches(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMatchDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPendingCount(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const matchController: MatchController;
//# sourceMappingURL=match.controller.d.ts.map