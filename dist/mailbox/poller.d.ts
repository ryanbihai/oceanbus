import type { Message } from '../types/messaging';
import { MailboxSync } from './sync';
export type MessageHandler = (message: Message) => void | Promise<void>;
export type ErrorHandler = (error: Error) => void;
export declare class AutoPollEngine {
    private sync;
    private intervalMs;
    private running;
    private timer;
    private onMessage;
    private onError;
    constructor(sync: MailboxSync, onMessage: MessageHandler, onError?: ErrorHandler, intervalMs?: number);
    start(): void;
    stop(): void;
    isRunning(): boolean;
    private poll;
}
//# sourceMappingURL=poller.d.ts.map