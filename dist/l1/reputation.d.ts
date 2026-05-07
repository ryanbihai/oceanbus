import { L1Client, L1Transport } from './base-client';
import type { L1Dispatcher } from './dispatcher';
import type { ReputationResult } from '../types/l1';
import type { L1Response } from '../types/l1';
export type PayloadSigner = (payload: Record<string, unknown>) => Promise<string>;
export declare class ReputationClient extends L1Client {
    private defaultOpenid;
    private defaultSigner;
    private defaultPublicKey;
    constructor(sendFn: L1Transport, serviceOpenid: string, dispatcher?: L1Dispatcher, requestTimeoutMs?: number);
    setIdentity(openid: string, signer: PayloadSigner, publicKey?: string): void;
    clearIdentity(): void;
    private resolveIdentity;
    /** tag：打标签（核心标签或自由标签） */
    tag(targetOpenid: string, label: string, evidence?: Record<string, unknown>, openid?: string, signer?: PayloadSigner, publicKey?: string): Promise<L1Response>;
    /** untag：撤销自己打过的标签 */
    untag(targetOpenid: string, label: string, openid?: string, signer?: PayloadSigner, publicKey?: string): Promise<L1Response>;
    /** queryReputation：查询声誉——返回标签计数 + Agent 基本数据 */
    queryReputation(openids: string[]): Promise<L1Response<{
        results: ReputationResult[];
    }>>;
}
//# sourceMappingURL=reputation.d.ts.map