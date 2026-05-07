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
exports.HttpClient = void 0;
const request = __importStar(require("superagent"));
const errors_1 = require("./errors");
const retry_1 = require("./retry");
// SDK version — read from package.json at build time
const SDK_VERSION = (() => {
    try {
        return require('../../package.json').version;
    }
    catch {
        return '0.0.0';
    }
})();
// Only warn once per process
let _deprecatedWarned = false;
class HttpClient {
    baseUrl;
    timeout;
    retryPolicy;
    constructor(baseUrl, config) {
        this.baseUrl = baseUrl.replace(/\/+$/, '');
        this.timeout = config.timeout;
        this.retryPolicy = new retry_1.RetryPolicy(config.retry);
    }
    url(path) {
        return `${this.baseUrl}${path}`;
    }
    req(method, path, opts = {}) {
        // superagent: must cast method to any for dynamic dispatch
        let r;
        switch (method) {
            case 'get':
                r = request.get(this.url(path));
                break;
            case 'post':
                r = request.post(this.url(path));
                break;
            case 'put':
                r = request.put(this.url(path));
                break;
            case 'delete':
                r = request.delete(this.url(path));
                break;
            case 'patch':
                r = request.patch(this.url(path));
                break;
            default: throw new Error(`unsupported HTTP method: ${method}`);
        }
        r = r.timeout(this.timeout).ok(() => true);
        // Send SDK version so server can detect outdated clients
        r = r.set('X-OceanBus-SDK-Version', SDK_VERSION);
        if (opts.apiKey) {
            r = r.set('Authorization', `Bearer ${opts.apiKey}`);
        }
        if (opts.query) {
            for (const [k, v] of Object.entries(opts.query)) {
                if (v !== undefined)
                    r = r.query({ [k]: v });
            }
        }
        return r;
    }
    checkDeprecated(res) {
        if (_deprecatedWarned)
            return;
        const msg = res.headers['x-oceanbus-deprecated'];
        if (msg) {
            _deprecatedWarned = true;
            console.warn('[oceanbus] ⚠ Your SDK version is deprecated:', msg);
            console.warn('[oceanbus] Upgrade: npm install oceanbus@latest');
        }
    }
    async request(method, path, body, opts = {}) {
        const doRequest = async () => {
            let r = this.req(method, path, opts);
            if (body !== undefined && body !== null) {
                r = r.send(body);
            }
            let res;
            try {
                res = await r;
            }
            catch (err) {
                const e = err;
                throw new errors_1.NetworkError(`HTTP request failed: ${e.message}`, e);
            }
            // Check for deprecation warning from server
            this.checkDeprecated(res);
            // HTTP 401 with challenge data = POW required (registration flow)
            // Return raw response so caller can extract nonce and compute solution
            if (res.status === 401) {
                const bodyData = res.body;
                if (bodyData?.data?.challenge) {
                    return bodyData;
                }
                throw errors_1.ApiError.fromResponse(bodyData?.code ?? -1, bodyData?.msg ?? 'unauthorized', 401);
            }
            // Parse body as ApiResponse envelope
            const bodyData = res.body;
            if (!bodyData || typeof bodyData.code === 'undefined') {
                throw new errors_1.NetworkError('invalid response: missing code field', new Error(JSON.stringify(res.body)));
            }
            // Business error (non-zero code)
            if (bodyData.code !== 0) {
                const retryAfter = res.status === 429 ? parseInt(res.headers['retry-after'], 10) || null : null;
                throw errors_1.ApiError.fromResponse(bodyData.code, bodyData.msg, res.status, retryAfter);
            }
            return bodyData;
        };
        return this.retryPolicy.execute(doRequest);
    }
    async get(path, opts = {}) {
        return this.request('get', path, undefined, opts);
    }
    async post(path, body, opts = {}) {
        return this.request('post', path, body, opts);
    }
    async put(path, body, opts = {}) {
        return this.request('put', path, body, opts);
    }
    async del(path, opts = {}) {
        return this.request('delete', path, undefined, opts);
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=http-client.js.map