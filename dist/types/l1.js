"use strict";
// L1 service communication protocol
// All L1 services are OceanBus agents — they communicate via L0 messaging
Object.defineProperty(exports, "__esModule", { value: true });
exports.YP_CODE = void 0;
/** Yellow Pages response codes */
exports.YP_CODE = {
    OK: 0,
    SIG_INVALID: 1001,
    OPENID_EXISTS: 1002,
    MISSING_FIELDS: 1003,
    TAGS_TOO_LONG: 1004,
    DESCRIPTION_TOO_LONG: 1005,
    UUID_EXISTS: 1006,
    ENTRY_NOT_FOUND: 1007,
};
//# sourceMappingURL=l1.js.map