import { HttpClient } from '../client/http-client';
import type { ReverseLookupData } from '../types/messaging';
export declare class BlocklistManager {
    private http;
    private getApiKey;
    private blocked;
    private filePath;
    constructor(http: HttpClient, getApiKey: () => string | null, filePath?: string);
    loadLocal(): Promise<void>;
    saveLocal(): Promise<void>;
    block(fromOpenid: string): Promise<void>;
    unblock(fromOpenid: string): Promise<void>;
    isBlocked(fromOpenid: string): boolean;
    getBlocklist(): string[];
    reverseLookup(openid: string): Promise<ReverseLookupData>;
}
//# sourceMappingURL=blocklist.d.ts.map