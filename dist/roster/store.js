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
exports.RosterStore = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const CURRENT_VERSION = 2;
function getDefaultRosterDir() {
    return path.join(os.homedir(), '.oceanbus');
}
function emptyRoster() {
    return {
        version: CURRENT_VERSION,
        updatedAt: new Date().toISOString(),
        contacts: [],
        identities: [],
        autoDiscovery: {
            enabled: true,
            minMentions: 3,
            sources: ['chat.log', 'user-messages'],
            ignoreList: ['我', '你', '他', '她', '它', '我们', '你们', '他们', '她们', '大家', '自己', '别人', '谁', '什么', '怎么'],
            pending: [],
        },
        indexes: {
            byTag: {},
            byAgentId: {},
            byOpenId: {},
        },
        duplicateHints: [],
    };
}
class RosterStore {
    filePath;
    data = null;
    constructor(filePath) {
        this.filePath = filePath || path.join(getDefaultRosterDir(), 'roster.json');
    }
    getPath() {
        return this.filePath;
    }
    async load() {
        if (this.data)
            return this.data;
        try {
            const raw = await fs.promises.readFile(this.filePath, 'utf-8');
            const parsed = JSON.parse(raw);
            this.data = migrate(parsed);
            return this.data;
        }
        catch {
            this.data = emptyRoster();
            await this.flush();
            return this.data;
        }
    }
    async save(data) {
        data.updatedAt = new Date().toISOString();
        this.data = data;
        await this.flush();
    }
    async flush() {
        const dir = path.dirname(this.filePath);
        await fs.promises.mkdir(dir, { recursive: true });
        const content = JSON.stringify(this.data, null, 2);
        await fs.promises.writeFile(this.filePath, content, { mode: 0o600 });
    }
    /** Clear in-memory cache (force re-read on next load) */
    invalidate() {
        this.data = null;
    }
    async delete() {
        try {
            await fs.promises.unlink(this.filePath);
        }
        catch { /* already gone */ }
        this.data = null;
    }
}
exports.RosterStore = RosterStore;
function migrate(data) {
    if (!data.version || data.version < 2) {
        return migrateV1toV2(data);
    }
    return data;
}
function migrateV1toV2(data) {
    const now = new Date().toISOString();
    // v1→v2: ensure indexes, autoDiscovery, identities, provenance, duplicateHints exist
    return {
        version: 2,
        updatedAt: data.updatedAt || now,
        contacts: (data.contacts || []).map(c => ({
            ...c,
            status: c.status || 'active',
            apps: c.apps || {},
            aliases: c.aliases || [],
            provenance: c.provenance || { account: c.source || 'manual', sourceId: null, firstSeenAt: c.createdAt || now, lastVerifiedAt: c.createdAt || now },
        })),
        identities: data.identities || [],
        autoDiscovery: data.autoDiscovery || emptyRoster().autoDiscovery,
        indexes: data.indexes || rebuildIndexes(data.contacts || []),
        duplicateHints: data.duplicateHints || [],
    };
}
function rebuildIndexes(contacts) {
    const indexes = { byTag: {}, byAgentId: {}, byOpenId: {} };
    for (const c of contacts) {
        for (const tag of c.tags) {
            if (!indexes.byTag[tag])
                indexes.byTag[tag] = [];
            if (!indexes.byTag[tag].includes(c.id))
                indexes.byTag[tag].push(c.id);
        }
        for (const a of c.agents) {
            indexes.byAgentId[a.agentId] = c.id;
            indexes.byOpenId[a.openId] = c.id;
        }
    }
    return indexes;
}
//# sourceMappingURL=store.js.map