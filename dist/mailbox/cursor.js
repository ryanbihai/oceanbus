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
exports.SeqCursor = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
class SeqCursor {
    filePath;
    lastSeq = 0;
    constructor(filePath) {
        this.filePath = filePath || path.join(os.homedir(), '.oceanbus', 'seq_cursor.json');
    }
    get() {
        return this.lastSeq;
    }
    set(seq) {
        if (!Number.isSafeInteger(seq))
            return; // guard against infinity/NaN/overflow
        if (seq > this.lastSeq) {
            this.lastSeq = seq;
        }
    }
    async load() {
        try {
            const raw = await fs.promises.readFile(this.filePath, 'utf-8');
            const data = JSON.parse(raw);
            if (typeof data.last_seq === 'number') {
                this.lastSeq = data.last_seq;
            }
        }
        catch {
            this.lastSeq = 0;
        }
    }
    async save() {
        const dir = path.dirname(this.filePath);
        await fs.promises.mkdir(dir, { recursive: true });
        await fs.promises.writeFile(this.filePath, JSON.stringify({ last_seq: this.lastSeq }), { mode: 0o600 });
    }
    async reset() {
        this.lastSeq = 0;
        await this.save();
    }
}
exports.SeqCursor = SeqCursor;
//# sourceMappingURL=cursor.js.map