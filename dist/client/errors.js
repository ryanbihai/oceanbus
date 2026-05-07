"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OceanBusError = exports.NetworkError = exports.ApiError = void 0;
const api_1 = require("../types/api");
class ApiError extends Error {
    code;
    httpStatus;
    retryAfterSeconds;
    constructor(code, msg, httpStatus = 200, retryAfterSeconds = null) {
        super(msg);
        this.name = 'ApiError';
        this.code = code;
        this.httpStatus = httpStatus;
        this.retryAfterSeconds = retryAfterSeconds;
    }
    static fromResponse(code, msg, httpStatus = 200, retryAfterSeconds = null) {
        const message = api_1.ErrorMessages[code] || msg || 'unknown error';
        return new ApiError(code, message, httpStatus, retryAfterSeconds);
    }
    isAuthError() {
        return this.httpStatus === 401 || this.httpStatus === 403;
    }
    isRateLimited() {
        return this.code === api_1.ErrorCode.RATE_LIMITED;
    }
    isBusinessError() {
        return this.httpStatus === 200 && this.code !== api_1.ErrorCode.SUCCESS;
    }
}
exports.ApiError = ApiError;
class NetworkError extends Error {
    originalError;
    constructor(message, originalError) {
        super(message);
        this.name = 'NetworkError';
        this.originalError = originalError;
    }
}
exports.NetworkError = NetworkError;
class OceanBusError extends Error {
    constructor(message) {
        super(message);
        this.name = 'OceanBusError';
    }
}
exports.OceanBusError = OceanBusError;
//# sourceMappingURL=errors.js.map