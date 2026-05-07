import type { MailboxSync } from '../mailbox/sync';
import type { Message } from '../types/messaging';
import type { L1Response } from '../types/l1';
export declare class L1Dispatcher {
    private mailbox;
    private engine;
    private pending;
    private requestTimeoutMs;
    private pollIntervalMs;
    private useExternalPoller;
    constructor(mailbox: MailboxSync, requestTimeoutMs?: number, pollIntervalMs?: number);
    /** Called by the unified poller in startListening(). Returns true if msg was an L1 response that matched a pending request. */
    tryDispatch(msg: Message): boolean;
    get hasPending(): boolean;
    /**
     * When a unified poller (startListening) is running, the L1Dispatcher
     * must not create its own internal poller — both would race on the seq cursor.
     */
    setUseExternalPoller(v: boolean): void;
    register(requestId: string, timeoutMs?: number): Promise<L1Response>;
    /** Clean up a pending request (e.g. when the send itself failed). */
    cancel(requestId: string): void;
    get pendingCount(): number;
    destroy(): void;
}
//# sourceMappingURL=dispatcher.d.ts.map