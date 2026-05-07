"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const api_1 = require("../types/api");
const errors_1 = require("../client/errors");
const idgen_1 = require("./idgen");
const MAX_CONTENT_LENGTH = 128000;
class MessagingService {
    http;
    getApiKey;
    constructor(http, getApiKey) {
        this.http = http;
        this.getApiKey = getApiKey;
    }
    async send(toOpenid, content, clientMsgId) {
        if (!toOpenid || toOpenid.trim().length === 0) {
            throw new errors_1.OceanBusError('toOpenid must not be empty');
        }
        const apiKey = this.getApiKey();
        if (!apiKey)
            throw new errors_1.OceanBusError('Not authenticated');
        // Validate content length
        if (content.length > MAX_CONTENT_LENGTH) {
            throw new errors_1.OceanBusError(`Content exceeds ${MAX_CONTENT_LENGTH} character limit (${content.length})`);
        }
        const payload = {
            to_openid: toOpenid,
            client_msg_id: clientMsgId || (0, idgen_1.generateClientMsgId)(),
            content,
        };
        try {
            await this.http.post('/messages', payload, { apiKey });
        }
        catch (err) {
            if (err instanceof errors_1.ApiError) {
                if (err.code === api_1.ErrorCode.BLOCKED_RECIPIENT) {
                    throw new errors_1.OceanBusError('Message blocked: recipient has blocked this sender');
                }
                if (err.code === api_1.ErrorCode.INVALID_OPENID) {
                    throw new errors_1.OceanBusError('Invalid recipient OpenID');
                }
                if (err.code === api_1.ErrorCode.CONTENT_TOO_LONG) {
                    throw new errors_1.OceanBusError(`Content too long (max ${MAX_CONTENT_LENGTH} chars)`);
                }
            }
            throw err;
        }
    }
    async sendJson(toOpenid, data, clientMsgId) {
        const content = JSON.stringify(data);
        return this.send(toOpenid, content, clientMsgId);
    }
}
exports.MessagingService = MessagingService;
//# sourceMappingURL=send.js.map