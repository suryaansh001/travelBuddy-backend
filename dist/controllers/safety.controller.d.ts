import type { Request, Response, NextFunction } from 'express';
declare class SafetyController {
    createReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyReports(req: Request, res: Response, next: NextFunction): Promise<void>;
    blockUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    unblockUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    getBlockedUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    addEmergencyContact(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateEmergencyContact(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteEmergencyContact(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEmergencyContacts(req: Request, res: Response, next: NextFunction): Promise<void>;
    triggerSOS(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const safetyController: SafetyController;
export {};
//# sourceMappingURL=safety.controller.d.ts.map