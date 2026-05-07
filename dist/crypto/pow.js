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
exports.computeHashcash = computeHashcash;
exports.verifyHashcash = verifyHashcash;
const crypto = __importStar(require("crypto"));
// Server sends difficulty in BITS (not hex characters).
// Convert to hex chars: each hex char = 4 bits, round up.
const bitsToHex = (bits) => Math.ceil(bits / 4);
const DEFAULT_BIT_DIFFICULTY = 20; // 5 hex zeros ≈ 1s on modern CPU
const MAX_BIT_DIFFICULTY = 80; // 20 hex zeros ≈ ~60s; sanity cap
/**
 * Compute Hashcash-style Proof of Work.
 * `difficulty` is in BITS — the number of leading zero bits required in the SHA-256 hash.
 * A hex character covers 4 bits, so difficulty=20 translates to 5 leading hex zeros.
 */
function computeHashcash(challenge, difficulty = DEFAULT_BIT_DIFFICULTY) {
    if (difficulty > 256) {
        throw new Error(`POW difficulty ${difficulty} exceeds SHA-256 output length (256 bits)`);
    }
    if (difficulty > MAX_BIT_DIFFICULTY) {
        throw new Error(`POW difficulty ${difficulty} bits is too high (max ${MAX_BIT_DIFFICULTY}). Try again later.`);
    }
    const hexChars = bitsToHex(difficulty);
    const prefix = '0'.repeat(hexChars);
    let solution = 0;
    let hash = '';
    while (true) {
        hash = crypto.createHash('sha256').update(challenge + solution).digest('hex');
        if (hash.startsWith(prefix))
            break;
        solution++;
    }
    return { solution: String(solution), hash };
}
/**
 * Verify a Hashcash solution.
 */
function verifyHashcash(challenge, solution, difficulty = DEFAULT_BIT_DIFFICULTY) {
    const prefix = '0'.repeat(bitsToHex(difficulty));
    const hash = crypto.createHash('sha256').update(challenge + solution).digest('hex');
    return hash.startsWith(prefix);
}
//# sourceMappingURL=pow.js.map