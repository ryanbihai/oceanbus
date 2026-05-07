import { HttpClient } from '../client/http-client';
import type { ApiKeyData } from '../types/agent';
export declare class ApiKeyManager {
    private http;
    private getApiKey;
    constructor(http: HttpClient, getApiKey: () => string | null);
    createApiKey(): Promise<ApiKeyData>;
    createApiKeyWithRetry(maxWaitMs?: number): Promise<ApiKeyData>;
    revokeApiKey(keyId: string): Promise<void>;
}
//# sourceMappingURL=keys.d.ts.map