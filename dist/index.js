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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RosterStore = exports.RosterService = exports.OceanBus = void 0;
exports.createOceanBus = createOceanBus;
const http_client_1 = require("./client/http-client");
const store_1 = require("./agent/store");
const identity_1 = require("./agent/identity");
const keys_1 = require("./agent/keys");
const send_1 = require("./messaging/send");
const blocklist_1 = require("./messaging/blocklist");
const sync_1 = require("./mailbox/sync");
const poller_1 = require("./mailbox/poller");
const cursor_1 = require("./mailbox/cursor");
const loader_1 = require("./config/loader");
const errors_1 = require("./client/errors");
const index_1 = require("./roster/index");
// Crypto
const ed25519_1 = require("./crypto/ed25519");
const canonical_json_1 = require("./crypto/canonical-json");
// L1
const dispatcher_1 = require("./l1/dispatcher");
const yellow_pages_1 = require("./l1/yellow-pages");
const ca_1 = require("./l1/ca");
const reputation_1 = require("./l1/reputation");
// Interceptors
const chain_1 = require("./interceptors/chain");
const llm_1 = require("./interceptors/llm");
class OceanBus {
    config;
    http;
    identity;
    keys;
    messaging;
    blocklist;
    mailbox;
    poller = null;
    keyStore;
    cursor;
    l1Dispatcher = null;
    // Crypto
    crypto;
    // L1
    l1;
    // Interceptors
    interceptors;
    // Roster
    roster;
    constructor(config, keyStore) {
        this.config = config;
        this.keyStore = keyStore;
        // HTTP client
        this.http = new http_client_1.HttpClient(config.baseUrl, config.http);
        // Identity
        this.identity = new identity_1.AgentIdentityManager(this.http, config.identity?.api_key, config.identity?.agent_id);
        // API Keys
        this.keys = new keys_1.ApiKeyManager(this.http, () => this.identity.getApiKey());
        // Messaging
        this.messaging = new send_1.MessagingService(this.http, () => this.identity.getApiKey());
        // Blocklist
        this.blocklist = new blocklist_1.BlocklistManager(this.http, () => this.identity.getApiKey());
        // Mailbox cursor
        this.cursor = new cursor_1.SeqCursor();
        this.mailbox = new sync_1.MailboxSync(this.http, () => this.identity.getApiKey(), this.cursor, config.mailbox.defaultPageSize);
        // Interceptors
        this.interceptors = new chain_1.InterceptorChain();
        if (config.interceptor.enabled) {
            // Note: noopEvaluator passes all messages — user must provide custom LLMEvaluatorFn
            // via ob.interceptors.register(new LLMInterceptor(yourEvaluator))
            this.interceptors.register(new llm_1.LLMInterceptor(llm_1.noopEvaluator));
        }
        // Roster
        this.roster = new index_1.RosterService();
        // Crypto
        this.crypto = {
            generateKeypair: ed25519_1.generateKeypair,
            sign: (keypair, payload) => (0, ed25519_1.sign)(keypair.secretKey, payload),
            verify: ed25519_1.verify,
            canonicalize: canonical_json_1.canonicalize,
            keypairToHex: ed25519_1.keypairToHex,
            hexToKeypair: ed25519_1.hexToKeypair,
            keypairToBase64url: ed25519_1.keypairToBase64url,
            base64urlToKeypair: ed25519_1.base64urlToKeypair,
            verifyCertificate: async (cert, trustedCAs) => {
                // Use the shared CAClient if available (post-create), otherwise create a temp one
                if (this.l1) {
                    return this.l1.ca.verifyCertificateOffline(cert);
                }
                const ca = new ca_1.CAClient({ send: () => Promise.resolve(), sendJson: () => Promise.resolve() }, '', trustedCAs || []);
                return ca.verifyCertificateOffline(cert);
            },
        };
    }
    static async create(userConfig) {
        const config = (0, loader_1.resolveConfig)(userConfig);
        // Initialize key store
        let keyStore;
        if (config.keyStore.type === 'file') {
            keyStore = new store_1.FileKeyStore(config.keyStore.filePath);
        }
        else {
            keyStore = new store_1.MemoryKeyStore();
        }
        const ob = new OceanBus(config, keyStore);
        // Load persisted identity if not provided via config
        if (!config.identity?.api_key) {
            const saved = await keyStore.load();
            if (saved) {
                ob.identity.fromState(saved);
            }
        }
        // Load persisted blocklist
        await ob.blocklist.loadLocal();
        // Load seq cursor
        await ob.cursor.load();
        // Set up shared L1 dispatcher — one polling engine for all L1 requests
        ob.l1Dispatcher = new dispatcher_1.L1Dispatcher(ob.mailbox, config.l1.requestTimeoutMs, config.l1.requestPollIntervalMs);
        // Validate Yellow Pages config
        const ypOpenid = config.l1.ypOpenids[0];
        if (!ypOpenid) {
            throw new errors_1.OceanBusError('Yellow Pages OpenID is not configured. Set config.l1.ypOpenids to the YP agent OpenID.');
        }
        // Initialize L1 clients
        const transport = {
            send: (to, content, cid) => ob.messaging.send(to, content, cid),
            sendJson: (to, data, cid) => ob.messaging.sendJson(to, data, cid),
        };
        ob.l1 = {
            yellowPages: new yellow_pages_1.YellowPagesClient(transport, ypOpenid, ob.l1Dispatcher, config.l1.requestTimeoutMs, config.l1.heartbeatIntervalMs),
            ca: new ca_1.CAClient(transport, config.l1.trustedCAs[0]?.ca_openid || '', config.l1.trustedCAs, ob.l1Dispatcher, config.l1.requestTimeoutMs),
            reputation: new reputation_1.ReputationClient(transport, config.l1.repOpenid, ob.l1Dispatcher, config.l1.requestTimeoutMs),
        };
        return ob;
    }
    // Identity convenience methods
    async register() {
        const data = await this.identity.register();
        await this.keyStore.save(this.identity.toState());
        return data;
    }
    async whoami() {
        const data = await this.identity.whoami();
        return { agent_id: this.identity.getAgentId(), openid: data.my_openid };
    }
    async getOpenId() {
        return this.identity.getOpenId();
    }
    /** One-liner: generate an Ed25519 keypair and return everything needed for Yellow Pages registration. */
    async createServiceKey() {
        const keypair = await (0, ed25519_1.generateKeypair)();
        const { publicKey } = (0, ed25519_1.keypairToBase64url)(keypair);
        const signer = async (payload) => (0, ed25519_1.sign)(keypair.secretKey, payload);
        return { publicKey, signer, keypair };
    }
    // API Key convenience methods
    async createApiKey() {
        return this.keys.createApiKeyWithRetry();
    }
    async revokeApiKey(keyId) {
        return this.keys.revokeApiKey(keyId);
    }
    // Yellow Pages convenience methods
    /**
     * One-step publish to Yellow Pages.
     * Handles key generation, signing, identity, and heartbeat internally.
     *
     * @example
     * await ob.publish({
     *   tags: ['insurance', 'health', 'Beijing'],
     *   description: '小王 — 10年健康险专家，免费咨询'
     * });
     */
    async publish(options) {
        const key = await this.createServiceKey();
        const openid = await this.getOpenId();
        this.l1.yellowPages.setIdentity(openid, key.signer, key.publicKey);
        return this.l1.yellowPages.publish(options);
    }
    /**
     * One-step unpublish from Yellow Pages.
     * Stops heartbeat and removes the entry.
     */
    async unpublish() {
        return this.l1.yellowPages.unpublish();
    }
    // Messaging convenience methods
    async send(toOpenid, content, opts) {
        return this.messaging.send(toOpenid, content, opts?.clientMsgId);
    }
    async sendJson(toOpenid, data, opts) {
        return this.messaging.sendJson(toOpenid, data, opts?.clientMsgId);
    }
    // Mailbox convenience methods
    async sync(sinceSeq, limit) {
        return this.mailbox.sync(sinceSeq, limit);
    }
    startListening(onMessage, options) {
        if (this.poller)
            this.poller.stop();
        // Let L1Dispatcher share the unified poller instead of spinning up its own
        this.l1Dispatcher?.setUseExternalPoller(true);
        this.poller = new poller_1.AutoPollEngine(this.mailbox, async (msg) => {
            // Route 1: L1 request/response matching (dispatcher consumes the message)
            if (this.l1Dispatcher && this.l1Dispatcher.tryDispatch(msg))
                return;
            // Route 2: user inbox — run through interceptor chain
            if (this.config.interceptor.enabled) {
                const ctx = {
                    agentId: this.identity.getAgentId() || '',
                    timestamp: Date.now(),
                };
                const result = await this.interceptors.process(msg, ctx);
                if (result.decision.action === 'block')
                    return; // silent discard
                if (result.decision.action === 'flag') {
                    msg.flagged = true;
                    msg.flagReason = result.decision.reason;
                }
            }
            await onMessage(msg);
        }, (err) => { console.error('[oceanbus] listen error:', err.message); }, options?.intervalMs ?? this.config.mailbox.pollIntervalMs);
        this.poller.start();
        return () => this.stopListening();
    }
    stopListening() {
        if (this.poller) {
            this.poller.stop();
            this.poller = null;
        }
        // Allow L1Dispatcher to create its own poller again for standalone use
        this.l1Dispatcher?.setUseExternalPoller(false);
    }
    // Blocklist convenience methods
    async blockSender(fromOpenid) {
        return this.blocklist.block(fromOpenid);
    }
    async unblockSender(fromOpenid) {
        return this.blocklist.unblock(fromOpenid);
    }
    isBlocked(fromOpenid) {
        return this.blocklist.isBlocked(fromOpenid);
    }
    getBlocklist() {
        return this.blocklist.getBlocklist();
    }
    async reverseLookup(openid) {
        return this.blocklist.reverseLookup(openid);
    }
    // Lifecycle
    async destroy() {
        // Best-effort deregister from Yellow Pages if identity was set
        if (this.l1 && this.l1.yellowPages && this.l1.yellowPages.hasIdentity()) {
            try {
                await this.l1.yellowPages.deregisterService();
            }
            catch {
                // Best effort — the entry will expire on its own (90-day TTL)
            }
        }
        // Destroy L1 dispatcher first (rejects pending requests, stops internal engine)
        if (this.l1Dispatcher) {
            this.l1Dispatcher.destroy();
            this.l1Dispatcher = null;
        }
        this.stopListening();
        await this.cursor.save();
        await this.blocklist.saveLocal();
        if (this.identity.getAgentId()) {
            await this.keyStore.save(this.identity.toState());
        }
    }
}
exports.OceanBus = OceanBus;
async function createOceanBus(config) {
    return OceanBus.create(config);
}
// Re-export all types
__exportStar(require("./types"), exports);
__exportStar(require("./client/errors"), exports);
// Re-export Roster for standalone use (without full OceanBus instance)
var index_2 = require("./roster/index");
Object.defineProperty(exports, "RosterService", { enumerable: true, get: function () { return index_2.RosterService; } });
var store_2 = require("./roster/store");
Object.defineProperty(exports, "RosterStore", { enumerable: true, get: function () { return store_2.RosterStore; } });
//# sourceMappingURL=index.js.map