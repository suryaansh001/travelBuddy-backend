import type { Request, Response, NextFunction } from 'express';
export declare const moderateUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getReports: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateReportStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const performBulkAction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const searchContent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const moderateContent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getSystemLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCollegeWhitelist: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const addCollegeToWhitelist: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCollegeWhitelist: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const removeCollegeFromWhitelist: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map