"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryPolicy = void 0;
// maxAttempts = total attempts including the initial request.
// E.g., maxAttempts=3 means up to 3 total tries (1 initial + 2 retries).
class RetryPolicy {
    config;
    constructor(config) {
        this.config = { ...config };
    }
    shouldRetry(error) {
        if (this.config.maxAttempts <= 0)
            return false;
        // Retry on network errors
        if (error.name === 'NetworkError')
            return true;
        // Retry on 5xx server errors (check both raw `status` and ApiError.httpStatus)
        const status = error.status ?? error.response?.status ?? error.httpStatus;
        if (status && status >= 500 && status < 600)
            return true;
        // Retry on timeout
        if (error.message?.includes('timeout') || error.message?.includes('Timeout'))
            return true;
        // Do NOT retry on 4xx (client errors) or business errors (code != 0)
        return false;
    }
    nextDelay(attempt) {
        const { initialDelayMs, maxDelayMs, multiplier } = this.config;
        const delay = initialDelayMs * Math.pow(multiplier, attempt);
        // Add jitter: ±25%
        const jitter = delay * 0.25 * (Math.random() * 2 - 1);
        return Math.min(delay + jitter, maxDelayMs);
    }
    async execute(fn) {
        let lastError;
        for (let attempt = 0; attempt <= this.config.maxAttempts; attempt++) {
            try {
                return await fn();
            }
            catch (err) {
                lastError = err;
                if (attempt === this.config.maxAttempts || !this.shouldRetry(err)) {
                    throw err;
                }
                const delay = this.nextDelay(attempt);
                await new Promise((r) => setTimeout(r, delay));
            }
        }
        throw lastError ?? new Error('retry exhausted');
    }
}
exports.RetryPolicy = RetryPolicy;
//# sourceMappingURL=retry.js.map