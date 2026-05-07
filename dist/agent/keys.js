"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyManager = void 0;
const errors_1 = require("../client/errors");
class ApiKeyManager {
    http;
    getApiKey;
    constructor(http, getApiKey) {
        this.http = http;
        this.getApiKey = getApiKey;
    }
    async createApiKey() {
        const key = this.getApiKey();
        if (!key)
            throw new errors_1.OceanBusError('Not authenticated');
        const res = await this.http.post('/agents/me/keys', {}, { apiKey: key });
        return res.data;
    }
    async createApiKeyWithRetry(maxWaitMs = 15000) {
        const data = await this.createApiKey();
        // New API keys may have propagation delay.
        // Verify the new key works before returning.
        const startTime = Date.now();
        const pollIntervalMs = 1000;
        while (Date.now() - startTime < maxWaitMs) {
            try {
                const res = await this.http.get('/agents/me', { apiKey: data.api_key });
                if (res.code === 0)
                    return data; // key works
            }
            catch (err) {
                // still propagating — the key may not be ready yet
                if (process.env.OceanBus_DEBUG) {
                    console.error('[oceanbus] key propagation check:', err.message);
                }
            }
            await new Promise((r) => setTimeout(r, pollIntervalMs));
        }
        // If we timed out, return the key anyway with a warning — it may work shortly
        return data;
    }
    async revokeApiKey(keyId) {
        const key = this.getApiKey();
        if (!key)
            throw new errors_1.OceanBusError('Not authenticated');
        await this.http.del(`/agents/me/keys/${keyId}`, { apiKey: key });
    }
}
exports.ApiKeyManager = ApiKeyManager;
//# sourceMappingURL=keys.js.map