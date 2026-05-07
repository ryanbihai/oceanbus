import { HttpClient } from '../client/http-client';
export declare class MessagingService {
    private http;
    private getApiKey;
    constructor(http: HttpClient, getApiKey: () => string | null);
    send(toOpenid: string, content: string, clientMsgId?: string): Promise<void>;
    sendJson(toOpenid: string, data: object, clientMsgId?: string): Promise<void>;
}
//# sourceMappingURL=send.d.ts.map