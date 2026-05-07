import { HttpClient } from './client/http-client';
import { AgentIdentityManager } from './agent/identity';
import { ApiKeyManager } from './agent/keys';
import { MessagingService } from './messaging/send';
import { BlocklistManager } from './messaging/blocklist';
import { MailboxSync } from './mailbox/sync';
import type { MessageHandler } from './mailbox/poller';
import type { OceanBusConfig, PartialConfig } from './types/config';
import type { RegistrationData } from './types/agent';
import type { Message } from './types/messaging';
import type { ListenOptions, SendOptions } from './types/messaging';
import { RosterService } from './roster/index';
import type { Ed25519KeyPair, Certificate, CertVerifyResult, TrustAnchor } from './types/crypto';
import { YellowPagesClient } from './l1/yellow-pages';
import type { PayloadSigner } from './l1/yellow-pages';
import { CAClient } from './l1/ca';
import { ReputationClient } from './l1/reputation';
import { InterceptorChain } from './interceptors/chain';
export declare class OceanBus {
    config: OceanBusConfig;
    http: HttpClient;
    identity: AgentIdentityManager;
    keys: ApiKeyManager;
    messaging: MessagingService;
    blocklist: BlocklistManager;
    mailbox: MailboxSync;
    private poller;
    private keyStore;
    private cursor;
    private l1Dispatcher;
    crypto: {
        generateKeypair: () => Promise<Ed25519KeyPair>;
        sign: (keypair: Ed25519KeyPair, payload: Record<string, unknown>) => Promise<string>;
        verify: (publicKey: Uint8Array, payload: Record<string, unknown>, sig: string) => Promise<boolean>;
        canonicalize: (obj: unknown) => string;
        keypairToHex: (kp: Ed25519KeyPair) => {
            publicKey: string;
            secretKey: string;
        };
        hexToKeypair: (pubHex: string, secHex: string) => Ed25519KeyPair;
        keypairToBase64url: (kp: Ed25519KeyPair) => {
            publicKey: string;
            secretKey: string;
        };
        base64urlToKeypair: (pubStr: string, secStr: string) => Ed25519KeyPair;
        verifyCertificate: (cert: Certificate, trustedCAs: TrustAnchor[]) => Promise<CertVerifyResult>;
    };
    l1: {
        yellowPages: YellowPagesClient;
        ca: CAClient;
        reputation: ReputationClient;
    };
    interceptors: InterceptorChain;
    roster: RosterService;
    private constructor();
    static create(userConfig?: PartialConfig): Promise<OceanBus>;
    register(): Promise<RegistrationData>;
    whoami(): Promise<{
        agent_id: string;
        openid: string;
    }>;
    getOpenId(): Promise<string>;
    /** One-liner: generate an Ed25519 keypair and return everything needed for Yellow Pages registration. */
    createServiceKey(): Promise<{
        publicKey: string;
        signer: PayloadSigner;
        keypair: Ed25519KeyPair;
    }>;
    createApiKey(): Promise<{
        key_id: string;
        api_key: string;
    }>;
    revokeApiKey(keyId: string): Promise<void>;
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
    publish(options: {
        tags: string[];
        description: string;
        autoHeartbeat?: boolean;
    }): Promise<{
        code: number;
        openid?: string;
        registered_at?: string;
    }>;
    /**
     * One-step unpublish from Yellow Pages.
     * Stops heartbeat and removes the entry.
     */
    unpublish(): Promise<{
        code: number;
    }>;
    send(toOpenid: string, content: string, opts?: SendOptions): Promise<void>;
    sendJson(toOpenid: string, data: object, opts?: SendOptions): Promise<void>;
    sync(sinceSeq?: number, limit?: number): Promise<Message[]>;
    startListening(onMessage: MessageHandler, options?: ListenOptions): () => void;
    stopListening(): void;
    blockSender(fromOpenid: string): Promise<void>;
    unblockSender(fromOpenid: string): Promise<void>;
    isBlocked(fromOpenid: string): boolean;
    getBlocklist(): string[];
    reverseLookup(openid: string): Promise<{
        real_agent_id: string;
    }>;
    destroy(): Promise<void>;
}
export declare function createOceanBus(config?: PartialConfig): Promise<OceanBus>;
export * from './types';
export * from './client/errors';
export { RosterService } from './roster/index';
export { RosterStore } from './roster/store';
//# sourceMappingURL=index.d.ts.map