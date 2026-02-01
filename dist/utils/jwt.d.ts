export interface TokenPayload {
    userId: string;
    email: string;
    isVerified: boolean;
}
export interface RefreshTokenPayload {
    userId: string;
    tokenVersion: number;
}
export declare const generateAccessToken: (payload: TokenPayload) => string;
export declare const generateRefreshToken: (payload: RefreshTokenPayload) => string;
export declare const verifyAccessToken: (token: string) => TokenPayload;
export declare const verifyRefreshToken: (token: string) => RefreshTokenPayload;
export declare const decodeToken: (token: string) => TokenPayload | null;
export declare const getTokenExpiration: (token: string) => number | null;
//# sourceMappingURL=jwt.d.ts.map