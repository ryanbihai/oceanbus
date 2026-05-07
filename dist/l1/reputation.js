"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationClient = void 0;
const base_client_1 = require("./base-client");
const errors_1 = require("../client/errors");
class ReputationClient extends base_client_1.L1Client {
    defaultOpenid = null;
    defaultSigner = null;
    defaultPublicKey = null;
    constructor(sendFn, serviceOpenid, dispatcher, requestTimeoutMs = 30000) {
        super(sendFn, serviceOpenid, dispatcher, requestTimeoutMs);
    }
    setIdentity(openid, signer, publicKey) {
        this.defaultOpenid = openid;
        this.defaultSigner = signer;
        if (publicKey !== undefined)
            this.defaultPublicKey = publicKey;
    }
    clearIdentity() {
        this.defaultOpenid = null;
        this.defaultSigner = null;
        this.defaultPublicKey = null;
    }
    resolveIdentity(openid, signer, publicKey) {
        const resolvedOpenid = openid ?? this.defaultOpenid;
        const resolvedSigner = signer ?? this.defaultSigner;
        const resolvedPublicKey = publicKey ?? this.defaultPublicKey;
        if (!resolvedOpenid || !resolvedSigner || !resolvedPublicKey) {
            throw new errors_1.OceanBusError('openid, signer and publicKey are required — call setIdentity() or pass them explicitly');
        }
        return { openid: resolvedOpenid, signer: resolvedSigner, publicKey: resolvedPublicKey };
    }
    async tag(targetOpenid, label, evidence, openid, signer, publicKey) {
        const id = this.resolveIdentity(openid, signer, publicKey);
        const payload = {
            ...this.buildRequest('tag'),
            action: 'tag',
            target_openid: targetOpenid,
            label,
            public_key: id.publicKey,
        };
        if (evidence)
            payload.evidence = evidence;
        const sig = await id.signer(payload);
        return this.sendAction({ ...payload, sig });
    }
    async untag(targetOpenid, label, openid, signer, publicKey) {
        const id = this.resolveIdentity(openid, signer, publicKey);
        const payload = {
            ...this.buildRequest('untag'),
            action: 'untag',
            target_openid: targetOpenid,
            label,
            public_key: id.publicKey,
        };
        const sig = await id.signer(payload);
        return this.sendAction({ ...payload, sig });
    }
    /** queryReputation：查询声誉——返回标签计数 + Agent 基本数据 */
    async queryReputation(openids) {
        const request = {
            ...this.buildRequest('query_reputation'),
            action: 'query_reputation',
            openids,
        };
        return this.sendAction(request);
    }
}
exports.ReputationClient = ReputationClient;
//# sourceMappingURL=reputation.js.map