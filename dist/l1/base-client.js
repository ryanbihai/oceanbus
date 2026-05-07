"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.L1Client = void 0;
const idgen_1 = require("../messaging/idgen");
const errors_1 = require("../client/errors");
class L1Client {
    sendFn;
    serviceOpenid;
    requestTimeoutMs;
    dispatcher;
    constructor(sendFn, serviceOpenid, dispatcher, requestTimeoutMs = 30000) {
        this.sendFn = sendFn;
        this.serviceOpenid = serviceOpenid;
        this.dispatcher = dispatcher || null;
        this.requestTimeoutMs = requestTimeoutMs;
    }
    setDispatcher(dispatcher) {
        this.dispatcher = dispatcher;
    }
    buildRequest(action, extra = {}) {
        return {
            action,
            request_id: (0, idgen_1.generateRequestId)(),
            ...extra,
        };
    }
    async sendAction(request) {
        if (!this.dispatcher) {
            throw new errors_1.OceanBusError('L1 dispatcher not configured');
        }
        // Register pending request with dispatcher BEFORE sending
        const responsePromise = this.dispatcher.register(request.request_id, this.requestTimeoutMs);
        // Send the request — if sending fails, clean up the pending entry immediately
        try {
            await this.sendFn.sendJson(this.serviceOpenid, request);
        }
        catch (e) {
            this.dispatcher.cancel(request.request_id);
            throw e;
        }
        // Wait for the shared dispatcher to match the response
        return responsePromise;
    }
}
exports.L1Client = L1Client;
//# sourceMappingURL=base-client.js.map