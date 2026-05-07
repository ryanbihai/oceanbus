import { HttpClient } from '../client/http-client';
import type { Message } from '../types/messaging';
import { SeqCursor } from './cursor';
export declare class MailboxSync {
    private http;
    private getApiKey;
    private cursor;
    private defaultPageSize;
    constructor(http: HttpClient, getApiKey: () => string | null, cursor: SeqCursor, defaultPageSize?: number);
    getCursor(): SeqCursor;
    sync(sinceSeq?: number, limit?: number): Promise<Message[]>;
}
//# sourceMappingURL=sync.d.ts.map