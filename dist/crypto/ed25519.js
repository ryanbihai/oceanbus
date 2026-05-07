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
exports.generateKeypair = generateKeypair;
exports.sign = sign;
exports.verify = verify;
exports.keypairToBase64url = keypairToBase64url;
exports.base64urlToKeypair = base64urlToKeypair;
exports.bufferToHex = bufferToHex;
exports.hexToBuffer = hexToBuffer;
exports.keypairToHex = keypairToHex;
exports.hexToKeypair = hexToKeypair;
const ed = __importStar(require("@noble/ed25519"));
const canonical_json_1 = require("./canonical-json");
async function generateKeypair() {
    const secretKey = ed.utils.randomPrivateKey();
    const publicKey = await ed.getPublicKeyAsync(secretKey);
    return { publicKey, secretKey };
}
async function sign(secretKey, payload) {
    const message = (0, canonical_json_1.canonicalize)(payload);
    const msgBytes = new TextEncoder().encode(message);
    const sigBytes = await ed.signAsync(msgBytes, secretKey);
    return `ed25519:${bufferToBase64url(sigBytes)}`;
}
async function verify(publicKey, payload, signature) {
    try {
        const message = (0, canonical_json_1.canonicalize)(payload);
        const msgBytes = new TextEncoder().encode(message);
        const raw = signature.startsWith('ed25519:')
            ? signature.slice(8)
            : signature;
        const sigBytes = base64urlToBuffer(raw);
        return await ed.verifyAsync(sigBytes, msgBytes, publicKey);
    }
    catch {
        return false;
    }
}
// ── base64url encoding (matches backend wire format) ──
function bufferToBase64url(buf) {
    return Buffer.from(buf).toString('base64url');
}
function base64urlToBuffer(s) {
    return Buffer.from(s, 'base64url');
}
// ── key serialization (ed25519:<base64url>) ──
function keypairToBase64url(keypair) {
    return {
        publicKey: `ed25519:${bufferToBase64url(keypair.publicKey)}`,
        secretKey: `ed25519:${bufferToBase64url(keypair.secretKey)}`,
    };
}
function base64urlToKeypair(publicKeyStr, secretKeyStr) {
    return {
        publicKey: base64urlToBuffer(publicKeyStr.replace('ed25519:', '')),
        secretKey: base64urlToBuffer(secretKeyStr.replace('ed25519:', '')),
    };
}
// ── legacy hex helpers (kept for backward compat) ──
function bufferToHex(buf) {
    return Array.from(buf)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}
function hexToBuffer(hex) {
    if (hex.length % 2 !== 0)
        throw new Error('Invalid hex string');
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}
/** @deprecated Use keypairToBase64url instead. */
function keypairToHex(keypair) {
    console.warn('[oceanbus] keypairToHex is deprecated — use keypairToBase64url instead');
    return keypairToBase64url(keypair);
}
function hexToKeypair(publicKeyHex, secretKeyHex) {
    const pubStr = publicKeyHex.startsWith('ed25519:') ? publicKeyHex.slice(8) : publicKeyHex;
    const secStr = secretKeyHex.startsWith('ed25519:') ? secretKeyHex.slice(8) : secretKeyHex;
    // Try base64url first (current format), fall back to hex (legacy)
    try {
        return {
            publicKey: base64urlToBuffer(pubStr),
            secretKey: base64urlToBuffer(secStr),
        };
    }
    catch {
        return {
            publicKey: hexToBuffer(pubStr),
            secretKey: hexToBuffer(secStr),
        };
    }
}
//# sourceMappingURL=ed25519.js.map