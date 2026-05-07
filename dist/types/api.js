"use strict";
// OceanBus API response envelope
// All L0 endpoints return HTTP 200; business errors via body.code
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessages = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["SUCCESS"] = 0] = "SUCCESS";
    ErrorCode[ErrorCode["MISSING_FIELD"] = 1001] = "MISSING_FIELD";
    ErrorCode[ErrorCode["INVALID_OPENID"] = 1002] = "INVALID_OPENID";
    ErrorCode[ErrorCode["INVALID_CLIENT_MSG_ID"] = 1003] = "INVALID_CLIENT_MSG_ID";
    ErrorCode[ErrorCode["CONTENT_TOO_LONG"] = 1004] = "CONTENT_TOO_LONG";
    ErrorCode[ErrorCode["INSUFFICIENT_PERMISSION"] = 1005] = "INSUFFICIENT_PERMISSION";
    ErrorCode[ErrorCode["INVALID_OPENID_REVERSE"] = 1006] = "INVALID_OPENID_REVERSE";
    ErrorCode[ErrorCode["BLOCKED_RECIPIENT"] = 2001] = "BLOCKED_RECIPIENT";
    ErrorCode[ErrorCode["RATE_LIMITED"] = 1007] = "RATE_LIMITED";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
exports.ErrorMessages = {
    [ErrorCode.SUCCESS]: 'success',
    [ErrorCode.MISSING_FIELD]: 'missing required field',
    [ErrorCode.INVALID_OPENID]: 'invalid to_openid',
    [ErrorCode.INVALID_CLIENT_MSG_ID]: 'invalid client_msg_id format',
    [ErrorCode.CONTENT_TOO_LONG]: 'content exceeds 128k character limit',
    [ErrorCode.INSUFFICIENT_PERMISSION]: 'insufficient permission',
    [ErrorCode.INVALID_OPENID_REVERSE]: 'invalid openid for reverse lookup',
    [ErrorCode.BLOCKED_RECIPIENT]: 'target blocked, message intercepted',
    [ErrorCode.RATE_LIMITED]: 'rate limited, check Retry-After header',
};
//# sourceMappingURL=api.js.map