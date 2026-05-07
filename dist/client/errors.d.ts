export declare class ApiError extends Error {
    code: number;
    httpStatus: number;
    retryAfterSeconds: number | null;
    constructor(code: number, msg: string, httpStatus?: number, retryAfterSeconds?: number | null);
    static fromResponse(code: number, msg: string, httpStatus?: number, retryAfterSeconds?: number | null): ApiError;
    isAuthError(): boolean;
    isRateLimited(): boolean;
    isBusinessError(): boolean;
}
export declare class NetworkError extends Error {
    originalError: Error;
    constructor(message: string, originalError: Error);
}
export declare class OceanBusError extends Error {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map