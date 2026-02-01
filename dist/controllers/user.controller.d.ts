import type { Request, Response } from 'express';
export declare class UserController {
    getOwnProfile(req: Request, res: Response): Promise<void>;
    getPublicProfile(req: Request, res: Response): Promise<void>;
    updateProfile(req: Request, res: Response): Promise<void>;
    updateInterests(req: Request, res: Response): Promise<void>;
    addEmergencyContact(req: Request, res: Response): Promise<void>;
    updateEmergencyContact(req: Request, res: Response): Promise<void>;
    deleteEmergencyContact(req: Request, res: Response): Promise<void>;
    getUserStatistics(req: Request, res: Response): Promise<void>;
    blockUser(req: Request, res: Response): Promise<void>;
    unblockUser(req: Request, res: Response): Promise<void>;
    getBlockedUsers(req: Request, res: Response): Promise<void>;
    sendPhoneOtp(req: Request, res: Response): Promise<void>;
    verifyPhoneOtp(req: Request, res: Response): Promise<void>;
}
export declare const userController: UserController;
//# sourceMappingURL=user.controller.d.ts.map