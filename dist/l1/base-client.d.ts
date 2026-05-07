import type { L1Request, L1Response } from '../types/l1';
import type { L1Dispatcher } from './dispatcher';
export interface L1Transport {
    send(toOpenid: string, content: string, clientMsgId?: string): Promise<void>;
    sendJson(toOpenid: string, data: object, clientMsgId?: string): Promise<void>;
}
export declare class L1Client {
    protected sendFn: L1Transport;
    protected serviceOpenid: string;
    protected requestTimeoutMs: number;
    private dispatcher;
    constructor(sendFn: L1Transport, serviceOpenid: string, dispatcher?: L1Dispatcher, requestTimeoutMs?: number);
    setDispatcher(dispatcher: L1Dispatcher): void;
    protected buildRequest(action: string, extra?: Record<string, unknown>): L1Request;
    sendAction(request: L1Request): Promise<L1Response>;
}
//# sourceMappingURL=base-client.d.ts.map