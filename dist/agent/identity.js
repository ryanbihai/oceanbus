"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentIdentityManager = void 0;
const errors_1 = require("../client/errors");
const pow_1 = require("../crypto/pow");
class AgentIdentityManager {
    http;
    apiKey;
    agentId;
    extraKeys = [];
    openidCache = null;
    constructor(http, apiKey, agentId) {
        this.http = http;
        this.apiKey = apiKey || null;
        this.agentId = agentId || null;
    }
    getApiKey() {
        return this.apiKey;
    }
    getAgentId() {
        return this.agentId;
    }
    getCachedOpenId() {
        return this.openidCache;
    }
    updateCredential(apiKey, agentId) {
        this.apiKey = apiKey;
        if (agentId)
            this.agentId = agentId;
        this.openidCache = null; // invalidate openid cache
    }
    async register() {
        // First attempt: server may respond with 401 + POW challenge
        let res = await this.http.post('/agents/register', {});
        // POW challenge: HTTP 401 with data.challenge
        const challengeData = res.data?.challenge;
        if (challengeData?.nonce) {
            const { nonce, difficulty } = challengeData;
            const actualDifficulty = difficulty ?? 20;
            console.warn(`[oceanbus] Computing proof of work (difficulty=${actualDifficulty})...`);
            const startedAt = Date.now();
            const { solution } = (0, pow_1.computeHashcash)(nonce, actualDifficulty);
            console.warn(`[oceanbus] POW solved in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
            res = await this.http.post('/agents/register', { challenge: nonce, solution });
        }
        const data = res.data;
        if (!data.agent_id || !data.api_key) {
            throw new errors_1.OceanBusError('Registration failed: no agent_id or api_key in response');
        }
        this.agentId = data.agent_id;
        this.apiKey = data.api_key;
        this.openidCache = null;
        return data;
    }
    async whoami() {
        this.ensureAuth();
        const res = await this.http.get('/agents/me', { apiKey: this.apiKey });
        this.openidCache = res.data.my_openid;
        return res.data;
    }
    async getOpenId() {
        if (this.openidCache !== null)
            return this.openidCache;
        const data = await this.whoami();
        return data.my_openid;
    }
    async ensureRegistered() {
        if (this.agentId && this.apiKey) {
            return this.toState();
        }
        const reg = await this.register();
        return this.toState();
    }
    toState() {
        if (!this.agentId || !this.apiKey) {
            throw new errors_1.OceanBusError('Agent identity not initialized');
        }
        return {
            agent_id: this.agentId,
            api_key: this.apiKey,
            extra_keys: this.extraKeys,
        };
    }
    fromState(state) {
        this.agentId = state.agent_id;
        this.apiKey = state.api_key;
        this.extraKeys = state.extra_keys || [];
        this.openidCache = null;
    }
    trackExtraKey(key) {
        this.extraKeys.push(key);
    }
    ensureAuth() {
        if (!this.apiKey) {
            throw new errors_1.OceanBusError('Not authenticated: call register() first or provide API key in config');
        }
    }
}
exports.AgentIdentityManager = AgentIdentityManager;
//# sourceMappingURL=identity.js.map