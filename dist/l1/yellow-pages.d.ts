import { L1Client, L1Transport } from './base-client';
import type { L1Dispatcher } from './dispatcher';
import type { L1Response, YpEntry } from '../types/l1';
export type PayloadSigner = (payload: Record<string, unknown>) => Promise<string>;
export type HeartbeatErrorCallback = (error: Error) => void;
export interface HeartbeatOptions {
    intervalMs?: number;
    onError?: HeartbeatErrorCallback;
}
export declare class YellowPagesClient extends L1Client {
    private heartbeatTimer;
    private heartbeatIntervalMs;
    private heartbeatOpenid;
    private heartbeatSigner;
    private onHeartbeatError;
    private defaultOpenid;
    private defaultSigner;
    private defaultPublicKey;
    constructor(sendFn: L1Transport, serviceOpenid: string, dispatcher?: L1Dispatcher, requestTimeoutMs?: number, heartbeatIntervalMs?: number);
    /** Store default identity so subsequent calls can omit openid/signer. */
    setIdentity(openid: string, signer: PayloadSigner, publicKey?: string): void;
    /** Clear stored identity. */
    clearIdentity(): void;
    hasIdentity(): boolean;
    private resolveIdentity;
    /** Short form: uses stored identity. */
    registerService(tags: string[], description: string, publicKey?: string): Promise<L1Response>;
    /** Long form: explicit params (backward compatible). */
    registerService(openid: string, tags: string[], description: string, publicKey: string, signer: PayloadSigner): Promise<L1Response>;
    discover(tags?: string[], limit?: number, cursor?: string | null): Promise<L1Response<{
        entries: YpEntry[];
        total: number;
        next_cursor: string | null;
    }>>;
    /** Short form: uses stored identity. */
    heartbeat(): Promise<L1Response>;
    /** Long form: explicit params (backward compatible). */
    heartbeat(openid: string, signer: PayloadSigner): Promise<L1Response>;
    /** Short form: uses stored identity. */
    startHeartbeat(options?: HeartbeatOptions): void;
    /** Long form: explicit params (backward compatible). */
    startHeartbeat(openid: string, signer: PayloadSigner, options?: HeartbeatOptions): void;
    stopHeartbeat(): void;
    isHeartbeating(): boolean;
    /** Short form: uses stored identity. */
    updateService(tags?: string[], description?: string): Promise<L1Response>;
    /** Long form: explicit params (backward compatible). */
    updateService(openid: string, signer: PayloadSigner, tags?: string[], description?: string): Promise<L1Response>;
    /** Short form: uses stored identity. */
    deregisterService(): Promise<L1Response>;
    /** Long form: explicit params (backward compatible). */
    deregisterService(openid: string, signer: PayloadSigner): Promise<L1Response>;
    /**
     * Publish to Yellow Pages using the already-set identity.
     * Call ob.publish() for the one-step high-level API that handles key setup.
     */
    publish(options: {
        tags: string[];
        description: string;
        autoHeartbeat?: boolean;
    }): Promise<L1Response>;
    /**
     * One-step unpublish: stops heartbeat and deregisters from Yellow Pages.
     */
    unpublish(): Promise<L1Response>;
}
//# sourceMappingURL=yellow-pages.d.ts.map