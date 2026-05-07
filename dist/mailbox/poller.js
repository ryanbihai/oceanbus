"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoPollEngine = void 0;
class AutoPollEngine {
    sync;
    intervalMs;
    running = false;
    timer = null;
    onMessage;
    onError;
    constructor(sync, onMessage, onError, intervalMs = 2000) {
        this.sync = sync;
        this.onMessage = onMessage;
        this.onError = onError || ((err) => { console.error('[oceanbus] polling error:', err.message); });
        this.intervalMs = intervalMs;
    }
    start() {
        if (this.running)
            return;
        this.running = true;
        this.poll();
    }
    stop() {
        this.running = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
    isRunning() {
        return this.running;
    }
    async poll() {
        while (this.running) {
            try {
                const messages = await this.sync.sync();
                for (const msg of messages) {
                    try {
                        await this.onMessage(msg);
                    }
                    catch (handlerErr) {
                        this.onError(handlerErr);
                    }
                }
            }
            catch (err) {
                this.onError(err);
            }
            // Wait for next interval, but check running flag
            await new Promise((resolve) => {
                if (!this.running) {
                    resolve();
                    return;
                }
                this.timer = setTimeout(() => {
                    this.timer = null;
                    resolve();
                }, this.intervalMs);
            });
        }
    }
}
exports.AutoPollEngine = AutoPollEngine;
//# sourceMappingURL=poller.js.map