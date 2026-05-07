"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CAClient = void 0;
const base_client_1 = require("./base-client");
const crypto_1 = require("../crypto");
class CAClient extends base_client_1.L1Client {
    trustedCAs;
    constructor(sendFn, serviceOpenid, trustedCAs = [], dispatcher, requestTimeoutMs = 30000) {
        super(sendFn, serviceOpenid, dispatcher, requestTimeoutMs);
        this.trustedCAs = new Map();
        for (const ca of trustedCAs) {
            const keyMap = new Map();
            for (const key of ca.keys) {
                if (key.status === 'active') {
                    keyMap.set(key.key_id, (0, crypto_1.hexToBuffer)(key.public_key.replace('ed25519:', '')));
                }
            }
            this.trustedCAs.set(ca.issuer, keyMap);
        }
    }
    addTrustAnchor(anchor) {
        const keyMap = new Map();
        for (const key of anchor.keys) {
            if (key.status === 'active') {
                keyMap.set(key.key_id, (0, crypto_1.hexToBuffer)(key.public_key.replace('ed25519:', '')));
            }
        }
        this.trustedCAs.set(anchor.issuer, keyMap);
    }
    async applyCert(application) {
        const request = {
            ...this.buildRequest('apply_cert'),
            action: 'apply_cert',
            application,
        };
        return this.sendAction(request);
    }
    async challengeResponse(applicationId, signedNonce) {
        const request = {
            ...this.buildRequest('cert_challenge_response'),
            action: 'cert_challenge_response',
            application_id: applicationId,
            signed_nonce: signedNonce,
        };
        return this.sendAction(request);
    }
    async verifyCertOnline(certId) {
        const request = {
            ...this.buildRequest('verify_cert'),
            action: 'verify_cert',
            cert_id: certId,
        };
        return this.sendAction(request);
    }
    async getCRL() {
        const request = {
            ...this.buildRequest('get_crl'),
            action: 'get_crl',
        };
        return this.sendAction(request);
    }
    async verifyCertificateOffline(certificate) {
        try {
            const issuerKeys = this.trustedCAs.get(certificate.cert.issuer);
            if (!issuerKeys) {
                return { valid: false, error: `Unknown CA issuer: ${certificate.cert.issuer}` };
            }
            const caPk = issuerKeys.get(certificate.cert.issuer_key_id);
            if (!caPk) {
                return { valid: false, error: `Unknown CA key_id: ${certificate.cert.issuer_key_id}` };
            }
            const valid = await (0, crypto_1.verify)(caPk, certificate.cert, certificate.sig);
            if (!valid) {
                return { valid: false, error: 'Signature verification failed' };
            }
            const now = new Date();
            const expires = new Date(certificate.cert.expires_at);
            if (isNaN(expires.getTime())) {
                return { valid: false, error: 'Invalid expiry date' };
            }
            if (now > expires) {
                return { valid: false, error: 'Certificate expired' };
            }
            return { valid: true, level: certificate.cert.level };
        }
        catch (err) {
            return { valid: false, error: err.message };
        }
    }
}
exports.CAClient = CAClient;
//# sourceMappingURL=ca.js.map