export interface ApiResponse<T = unknown> {
    code: number;
    msg: string;
    data: T;
}
export declare enum ErrorCode {
    SUCCESS = 0,
    MISSING_FIELD = 1001,
    INVALID_OPENID = 1002,
    INVALID_CLIENT_MSG_ID = 1003,
    CONTENT_TOO_LONG = 1004,
    INSUFFICIENT_PERMISSION = 1005,
    INVALID_OPENID_REVERSE = 1006,
    BLOCKED_RECIPIENT = 2001,
    RATE_LIMITED = 1007
}
export declare const ErrorMessages: Record<number, string>;
//# sourceMappingURL=api.d.ts.map