"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlocklistManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const errors_1 = require("../client/errors");
class BlocklistManager {
    http;
    getApiKey;
    blocked;
    filePath;
    constructor(http, getApiKey, filePath) {
        this.http = http;
        this.getApiKey = getApiKey;
        this.blocked = new Set();
        this.filePath = filePath || path.join(os.homedir(), '.oceanbus', 'blocklist.json');
    }
    async loadLocal() {
        try {
            const raw = await fs.promises.readFile(this.filePath, 'utf-8');
            const data = JSON.parse(raw);
            if (Array.isArray(data.blocked)) {
                this.blocked = new Set(data.blocked);
            }
        }
        catch {
            this.blocked = new Set();
        }
    }
    async saveLocal() {
        const dir = path.dirname(this.filePath);
        await fs.promises.mkdir(dir, { recursive: true });
        const data = { blocked: Array.from(this.blocked) };
        await fs.promises.writeFile(this.filePath, JSON.stringify(data, null, 2), { mode: 0o600 });
    }
    async block(fromOpenid) {
        const apiKey = this.getApiKey();
        if (!apiKey)
            throw new errors_1.OceanBusError('Not authenticated');
        await this.http.post('/messages/block', { from_openid: fromOpenid }, { apiKey });
        this.blocked.add(fromOpenid);
        await this.saveLocal();
    }
    async unblock(fromOpenid) {
        const apiKey = this.getApiKey();
        if (!apiKey)
            throw new errors_1.OceanBusError('Not authenticated');
        // API may not support unblock yet — treat as best-effort
        try {
            await this.http.del(`/messages/block/${encodeURIComponent(fromOpenid)}`, { apiKey });
        }
        catch {
            // Server may not support unblock endpoint
        }
        this.blocked.delete(fromOpenid);
        await this.saveLocal();
    }
    isBlocked(fromOpenid) {
        return this.blocked.has(fromOpenid);
    }
    getBlocklist() {
        return Array.from(this.blocked);
    }
    async reverseLookup(openid) {
        const apiKey = this.getApiKey();
        if (!apiKey)
            throw new errors_1.OceanBusError('Not authenticated');
        const res = await this.http.get('/internal/reverse-lookup', {
            apiKey,
            query: { openid },
        });
        return res.data;
    }
}
exports.BlocklistManager = BlocklistManager;
//# sourceMappingURL=blocklist.js.map