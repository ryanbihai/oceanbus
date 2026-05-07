"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.L1Dispatcher = void 0;
const poller_1 = require("../mailbox/poller");
class L1Dispatcher {
    mailbox;
    engine = null;
    pending = new Map();
    requestTimeoutMs;
    pollIntervalMs;
    useExternalPoller = false;
    constructor(mailbox, requestTimeoutMs = 30000, pollIntervalMs = 1000) {
        this.mailbox = mailbox;
        this.requestTimeoutMs = requestTimeoutMs;
        this.pollIntervalMs = pollIntervalMs;
    }
    /** Called by the unified poller in startListening(). Returns true if msg was an L1 response that matched a pending request. */
    tryDispatch(msg) {
        try {
            const parsed = JSON.parse(msg.content);
            if (parsed.request_id && this.pending.has(parsed.request_id)) {
                const pending = this.pending.get(parsed.request_id);
                clearTimeout(pending.timeout);
                this.pending.delete(parsed.request_id);
                pending.resolve(parsed);
                if (this.pending.size === 0 && this.engine) {
                    this.engine.stop();
                    this.engine = null;
                }
                return true;
            }
        }
        catch {
            // Not JSON — not an L1 response
        }
        return false;
    }
    get hasPending() {
        return this.pending.size > 0;
    }
    /**
     * When a unified poller (startListening) is running, the L1Dispatcher
     * must not create its own internal poller — both would race on the seq cursor.
     */
    setUseExternalPoller(v) {
        this.useExternalPoller = v;
        if (v && this.engine) {
            this.engine.stop();
            this.engine = null;
        }
    }
    register(requestId, timeoutMs) {
        const ms = timeoutMs ?? this.requestTimeoutMs;
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pending.delete(requestId);
                reject(new Error(`L1 request timed out after ${ms}ms: ${requestId}`));
                if (this.pending.size === 0 && this.engine) {
                    this.engine.stop();
                    this.engine = null;
                }
            }, ms);
            this.pending.set(requestId, { resolve, reject, timeout });
            // Only start internal poller when no unified poller is active
            if (!this.useExternalPoller && (!this.engine || !this.engine.isRunning())) {
                this.engine = new poller_1.AutoPollEngine(this.mailbox, (msg) => { this.tryDispatch(msg); }, (err) => { }, this.pollIntervalMs);
                this.engine.start();
            }
        });
    }
    /** Clean up a pending request (e.g. when the send itself failed). */
    cancel(requestId) {
        const pending = this.pending.get(requestId);
        if (pending) {
            clearTimeout(pending.timeout);
            this.pending.delete(requestId);
        }
        if (this.pending.size === 0 && this.engine) {
            this.engine.stop();
            this.engine = null;
        }
    }
    get pendingCount() {
        return this.pending.size;
    }
    destroy() {
        for (const [id, pending] of this.pending) {
            clearTimeout(pending.timeout);
            pending.reject(new Error('L1 dispatcher destroyed'));
        }
        this.pending.clear();
        if (this.engine) {
            this.engine.stop();
            this.engine = null;
        }
    }
}
exports.L1Dispatcher = L1Dispatcher;
//# sourceMappingURL=dispatcher.js.map