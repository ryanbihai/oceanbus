"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YellowPagesClient = void 0;
const base_client_1 = require("./base-client");
const l1_1 = require("../types/l1");
const errors_1 = require("../client/errors");
const idgen_1 = require("../messaging/idgen");
const DEFAULT_HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes (real-time services)
class YellowPagesClient extends base_client_1.L1Client {
    heartbeatTimer = null;
    heartbeatIntervalMs;
    heartbeatOpenid = null;
    heartbeatSigner = null;
    onHeartbeatError = null;
    // ── Stored identity — set once, skip openid/signer on every call ──
    defaultOpenid = null;
    defaultSigner = null;
    defaultPublicKey = null;
    constructor(sendFn, serviceOpenid, dispatcher, requestTimeoutMs = 30000, heartbeatIntervalMs = DEFAULT_HEARTBEAT_INTERVAL_MS) {
        super(sendFn, serviceOpenid, dispatcher, requestTimeoutMs);
        this.heartbeatIntervalMs = heartbeatIntervalMs;
    }
    // ── identity management ──
    /** Store default identity so subsequent calls can omit openid/signer. */
    setIdentity(openid, signer, publicKey) {
        this.defaultOpenid = openid;
        this.defaultSigner = signer;
        if (publicKey !== undefined)
            this.defaultPublicKey = publicKey;
    }
    /** Clear stored identity. */
    clearIdentity() {
        this.defaultOpenid = null;
        this.defaultSigner = null;
        this.defaultPublicKey = null;
    }
    hasIdentity() {
        return this.defaultOpenid !== null && this.defaultSigner !== null;
    }
    resolveIdentity(openid, signer) {
        const resolvedOpenid = openid ?? this.defaultOpenid;
        const resolvedSigner = signer ?? this.defaultSigner;
        if (!resolvedOpenid || !resolvedSigner) {
            throw new errors_1.OceanBusError('openid and signer are required — call setIdentity() or pass them explicitly');
        }
        return { openid: resolvedOpenid, signer: resolvedSigner };
    }
    async registerService(openidOrTags, tagsOrDesc, descOrPubKey, pubKeyOrSigner, signerOrNothing) {
        let openid;
        let tags;
        let description;
        let publicKey;
        let signer;
        if (Array.isArray(openidOrTags)) {
            // Short form: registerService(tags, description, publicKey?)
            tags = openidOrTags;
            description = tagsOrDesc;
            publicKey = descOrPubKey ?? this.defaultPublicKey ?? '';
            ({ openid, signer } = this.resolveIdentity());
        }
        else {
            // Long form: registerService(openid, tags, description, publicKey, signer)
            openid = openidOrTags;
            tags = tagsOrDesc;
            description = descOrPubKey;
            publicKey = pubKeyOrSigner;
            signer = signerOrNothing;
        }
        const totalTagChars = tags.reduce((sum, t) => sum + t.length, 0);
        if (totalTagChars > 120)
            throw new errors_1.OceanBusError('Tags total character count exceeds 120');
        if (description.length > 800)
            throw new errors_1.OceanBusError('Description exceeds 800 characters');
        const payload = {
            action: 'register_service',
            request_id: (0, idgen_1.generateRequestId)(),
            openid,
            tags,
            description,
            public_key: publicKey,
        };
        const sig = await signer(payload);
        return this.sendAction({ ...payload, sig });
    }
    // ── discover (read-only, no signature needed) ──
    async discover(tags, limit, cursor) {
        const request = {
            ...this.buildRequest('discover'),
            action: 'discover',
            tags,
            limit,
            cursor,
        };
        const response = await this.sendAction(request);
        if (response.code === l1_1.YP_CODE.OK && response.data) {
            const d = response.data;
            if (!Array.isArray(d.entries)) {
                throw new errors_1.OceanBusError('Yellow Pages discover response missing entries array');
            }
        }
        return response;
    }
    async heartbeat(openid, signer) {
        const resolved = this.resolveIdentity(openid, signer);
        const payload = {
            action: 'heartbeat',
            request_id: (0, idgen_1.generateRequestId)(),
            openid: resolved.openid,
        };
        const sig = await resolved.signer(payload);
        return this.sendAction({ ...payload, sig });
    }
    startHeartbeat(openidOrOptions, signer, options) {
        let openid;
        let resolvedSigner;
        let resolvedOptions;
        if (typeof openidOrOptions === 'string') {
            // Long form
            openid = openidOrOptions;
            resolvedSigner = signer;
            resolvedOptions = options || {};
        }
        else {
            // Short form
            const resolved = this.resolveIdentity();
            openid = resolved.openid;
            resolvedSigner = resolved.signer;
            resolvedOptions = openidOrOptions || {};
        }
        const intervalMs = resolvedOptions.intervalMs ?? this.heartbeatIntervalMs;
        if (intervalMs <= 0) {
            throw new errors_1.OceanBusError('Heartbeat interval must be > 0 to enable auto-heartbeat');
        }
        this.stopHeartbeat();
        this.heartbeatOpenid = openid;
        this.heartbeatSigner = resolvedSigner;
        this.onHeartbeatError = resolvedOptions.onError || null;
        const effectiveIntervalMs = intervalMs;
        this.heartbeatTimer = setInterval(async () => {
            try {
                await this.heartbeat(openid, resolvedSigner);
            }
            catch (e) {
                if (this.onHeartbeatError) {
                    this.onHeartbeatError(e instanceof Error ? e : new Error(String(e)));
                }
            }
        }, effectiveIntervalMs);
    }
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
        this.heartbeatOpenid = null;
        this.heartbeatSigner = null;
        this.onHeartbeatError = null;
    }
    isHeartbeating() {
        return this.heartbeatTimer !== null;
    }
    async updateService(openidOrTags, signerOrDesc, tagsOrNothing, description) {
        let openid;
        let signer;
        let tags;
        let desc;
        if (typeof openidOrTags === 'string' && typeof signerOrDesc === 'function') {
            // Long form: updateService(openid, signer, tags?, description?)
            openid = openidOrTags;
            signer = signerOrDesc;
            tags = tagsOrNothing;
            desc = description;
        }
        else {
            // Short form: updateService(tags?, description?)
            ({ openid, signer } = this.resolveIdentity());
            tags = openidOrTags;
            desc = signerOrDesc;
        }
        const payload = {
            action: 'update_service',
            request_id: (0, idgen_1.generateRequestId)(),
            openid,
        };
        if (tags !== undefined)
            payload.tags = tags;
        if (desc !== undefined)
            payload.description = desc;
        const sig = await signer(payload);
        return this.sendAction({ ...payload, sig });
    }
    async deregisterService(openid, signer) {
        this.stopHeartbeat();
        const resolved = this.resolveIdentity(openid, signer);
        const payload = {
            action: 'deregister_service',
            request_id: (0, idgen_1.generateRequestId)(),
            openid: resolved.openid,
        };
        const sig = await resolved.signer(payload);
        return this.sendAction({ ...payload, sig });
    }
    // ── High-level publish / unpublish ──
    /**
     * Publish to Yellow Pages using the already-set identity.
     * Call ob.publish() for the one-step high-level API that handles key setup.
     */
    async publish(options) {
        const autoHeartbeat = options.autoHeartbeat !== false;
        const resolved = this.resolveIdentity();
        const result = await this.registerService(resolved.openid, options.tags, options.description, this.defaultPublicKey || '', resolved.signer);
        if (result.code === 0 && autoHeartbeat) {
            this.startHeartbeat(resolved.openid, resolved.signer);
        }
        return result;
    }
    /**
     * One-step unpublish: stops heartbeat and deregisters from Yellow Pages.
     */
    async unpublish() {
        const resolved = this.resolveIdentity();
        const result = await this.deregisterService(resolved.openid, resolved.signer);
        return result;
    }
}
exports.YellowPagesClient = YellowPagesClient;
//# sourceMappingURL=yellow-pages.js.map