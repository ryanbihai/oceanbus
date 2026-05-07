import { L1Client, L1Transport } from './base-client';
import type { L1Dispatcher } from './dispatcher';
import type {
  ReputationTagRequest,
  ReputationUntagRequest,
  ReputationQueryRequest,
  ReputationResult,
} from '../types/l1';
import type { L1Response } from '../types/l1';
import { OceanBusError } from '../client/errors';

export type PayloadSigner = (payload: Record<string, unknown>) => Promise<string>;

export class ReputationClient extends L1Client {
  private defaultOpenid: string | null = null;
  private defaultSigner: PayloadSigner | null = null;
  private defaultPublicKey: string | null = null;

  constructor(
    sendFn: L1Transport,
    serviceOpenid: string,
    dispatcher?: L1Dispatcher,
    requestTimeoutMs: number = 30000
  ) {
    super(sendFn, serviceOpenid, dispatcher, requestTimeoutMs);
  }

  setIdentity(openid: string, signer: PayloadSigner, publicKey?: string): void {
    this.defaultOpenid = openid;
    this.defaultSigner = signer;
    if (publicKey !== undefined) this.defaultPublicKey = publicKey;
  }

  clearIdentity(): void {
    this.defaultOpenid = null;
    this.defaultSigner = null;
    this.defaultPublicKey = null;
  }

  private resolveIdentity(openid?: string, signer?: PayloadSigner, publicKey?: string) {
    const resolvedOpenid = openid ?? this.defaultOpenid;
    const resolvedSigner = signer ?? this.defaultSigner;
    const resolvedPublicKey = publicKey ?? this.defaultPublicKey;
    if (!resolvedOpenid || !resolvedSigner || !resolvedPublicKey) {
      throw new OceanBusError('openid, signer and publicKey are required — call setIdentity() or pass them explicitly');
    }
    return { openid: resolvedOpenid, signer: resolvedSigner, publicKey: resolvedPublicKey };
  }

  /** tag：打标签（核心标签或自由标签） */
  async tag(targetOpenid: string, label: string, evidence?: Record<string, unknown>, openid?: string, signer?: PayloadSigner, publicKey?: string): Promise<L1Response>;
  async tag(targetOpenid: string, label: string, evidence?: Record<string, unknown>, openid?: string, signer?: PayloadSigner, publicKey?: string): Promise<L1Response> {
    const id = this.resolveIdentity(openid, signer, publicKey);
    const payload: Omit<ReputationTagRequest, 'sig'> = {
      ...this.buildRequest('tag'),
      action: 'tag',
      target_openid: targetOpenid,
      label,
      public_key: id.publicKey,
    };
    if (evidence) payload.evidence = evidence;
    const sig = await id.signer(payload as Record<string, unknown>);
    return this.sendAction({ ...payload, sig } as ReputationTagRequest);
  }

  /** untag：撤销自己打过的标签 */
  async untag(targetOpenid: string, label: string, openid?: string, signer?: PayloadSigner, publicKey?: string): Promise<L1Response>;
  async untag(targetOpenid: string, label: string, openid?: string, signer?: PayloadSigner, publicKey?: string): Promise<L1Response> {
    const id = this.resolveIdentity(openid, signer, publicKey);
    const payload: Omit<ReputationUntagRequest, 'sig'> = {
      ...this.buildRequest('untag'),
      action: 'untag',
      target_openid: targetOpenid,
      label,
      public_key: id.publicKey,
    };
    const sig = await id.signer(payload as Record<string, unknown>);
    return this.sendAction({ ...payload, sig } as ReputationUntagRequest);
  }

  /** queryReputation：查询声誉——返回标签计数 + Agent 基本数据 */
  async queryReputation(openids: string[]): Promise<L1Response<{ results: ReputationResult[] }>> {
    const request: ReputationQueryRequest = {
      ...this.buildRequest('query_reputation'),
      action: 'query_reputation',
      openids,
    };
    return this.sendAction(request) as Promise<L1Response<{ results: ReputationResult[] }>>;
  }
}
