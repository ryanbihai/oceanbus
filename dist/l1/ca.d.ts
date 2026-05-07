import { L1Client, L1Transport } from './base-client';
import type { L1Dispatcher } from './dispatcher';
import type { CaApplyRequest } from '../types/l1';
import type { L1Response } from '../types/l1';
import type { Certificate, TrustAnchor, CertVerifyResult } from '../types/crypto';
export declare class CAClient extends L1Client {
    private trustedCAs;
    constructor(sendFn: L1Transport, serviceOpenid: string, trustedCAs?: TrustAnchor[], dispatcher?: L1Dispatcher, requestTimeoutMs?: number);
    addTrustAnchor(anchor: TrustAnchor): void;
    applyCert(application: CaApplyRequest['application']): Promise<L1Response>;
    challengeResponse(applicationId: string, signedNonce: string): Promise<L1Response>;
    verifyCertOnline(certId: string): Promise<L1Response>;
    getCRL(): Promise<L1Response>;
    verifyCertificateOffline(certificate: Certificate): Promise<CertVerifyResult>;
}
//# sourceMappingURL=ca.d.ts.map