import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    errors?: Record<string, string[]>;
    constructor(message: string, statusCode?: number, errors?: Record<string, string[]>);
}
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare const errorHandler: (err: Error | AppError, _req: Request, res: Response, _next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=errorHandler.d.ts.map