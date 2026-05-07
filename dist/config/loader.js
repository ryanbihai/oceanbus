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
exports.resolveConfig = resolveConfig;
exports.getOceanBusDir = getOceanBusDir;
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const defaults_1 = require("./defaults");
function safeInt(value) {
    if (value === undefined)
        return undefined;
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? undefined : n;
}
function envConfig() {
    const result = {};
    if (process.env.OCEANBUS_BASE_URL)
        result.baseUrl = process.env.OCEANBUS_BASE_URL;
    const timeout = safeInt(process.env.OCEANBUS_TIMEOUT);
    if (timeout !== undefined)
        result.http = { timeout };
    const pollInterval = safeInt(process.env.OCEANBUS_POLL_INTERVAL);
    if (pollInterval !== undefined)
        result.mailbox = { pollIntervalMs: pollInterval };
    if (process.env.OCEANBUS_YP_OPENIDS) {
        result.l1 = { ypOpenids: process.env.OCEANBUS_YP_OPENIDS.split(',') };
    }
    if (process.env.OCEANBUS_API_KEY) {
        result.identity = { agent_id: process.env.OCEANBUS_AGENT_ID || '', api_key: process.env.OCEANBUS_API_KEY };
    }
    return result;
}
function merge(base, ...overrides) {
    const result = { ...base };
    for (const override of overrides) {
        if (!override)
            continue;
        for (const key of Object.keys(override)) {
            const overrideVal = override[key];
            const baseVal = result[key];
            if (overrideVal !== undefined &&
                overrideVal !== null &&
                typeof overrideVal === 'object' &&
                !Array.isArray(overrideVal) &&
                typeof baseVal === 'object' &&
                !Array.isArray(baseVal) &&
                baseVal !== null) {
                result[key] = merge(baseVal, overrideVal);
            }
            else {
                result[key] = overrideVal;
            }
        }
    }
    return result;
}
function resolveConfig(userConfig) {
    let config = merge(defaults_1.DEFAULTS);
    config = merge(config, envConfig());
    if (userConfig) {
        config = merge(config, userConfig);
    }
    if (config.keyStore.type === 'file' && !config.keyStore.filePath) {
        config.keyStore.filePath = path.join(os.homedir(), '.oceanbus', 'credentials.json');
    }
    return config;
}
function getOceanBusDir() {
    return path.join(os.homedir(), '.oceanbus');
}
//# sourceMappingURL=loader.js.map