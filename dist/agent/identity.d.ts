import { HttpClient } from '../client/http-client';
import type { RegistrationData, OpenIDData, AgentState, ApiKeyData } from '../types/agent';
export declare class AgentIdentityManager {
    private http;
    private apiKey;
    private agentId;
    private extraKeys;
    private openidCache;
    constructor(http: HttpClient, apiKey?: string, agentId?: string);
    getApiKey(): string | null;
    getAgentId(): string | null;
    getCachedOpenId(): string | null;
    updateCredential(apiKey: string, agentId?: string): void;
    register(): Promise<RegistrationData>;
    private savedOpenid;
    whoami(): Promise<OpenIDData>;
    getSavedOpenid(): string | null;
    getOpenId(): Promise<string>;
    ensureRegistered(): Promise<AgentState>;
    toState(): AgentState;
    fromState(state: AgentState): void;
    trackExtraKey(key: ApiKeyData): void;
    private ensureAuth;
}
//# sourceMappingURL=identity.d.ts.map