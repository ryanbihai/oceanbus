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
exports.FileKeyStore = exports.MemoryKeyStore = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
class MemoryKeyStore {
    state = null;
    async save(state) {
        this.state = { ...state };
    }
    async load() {
        return this.state ? { ...this.state } : null;
    }
    async clear() {
        this.state = null;
    }
    getPath() {
        return '(memory)';
    }
}
exports.MemoryKeyStore = MemoryKeyStore;
class FileKeyStore {
    filePath;
    constructor(filePath) {
        this.filePath = filePath || path.join(os.homedir(), '.oceanbus', 'credentials.json');
    }
    async save(state) {
        const dir = path.dirname(this.filePath);
        await fs.promises.mkdir(dir, { recursive: true });
        const content = JSON.stringify(state, null, 2);
        await fs.promises.writeFile(this.filePath, content, { mode: 0o600 });
    }
    async load() {
        try {
            const raw = await fs.promises.readFile(this.filePath, 'utf-8');
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    }
    async clear() {
        try {
            await fs.promises.unlink(this.filePath);
        }
        catch {
            // file doesn't exist, nothing to clear
        }
    }
    getPath() {
        return this.filePath;
    }
}
exports.FileKeyStore = FileKeyStore;
//# sourceMappingURL=store.js.map