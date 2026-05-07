import type { AgentState } from '../types/agent';
export interface KeyStore {
    save(state: AgentState): Promise<void>;
    load(): Promise<AgentState | null>;
    clear(): Promise<void>;
    getPath(): string;
}
export declare class MemoryKeyStore implements KeyStore {
    private state;
    save(state: AgentState): Promise<void>;
    load(): Promise<AgentState | null>;
    clear(): Promise<void>;
    getPath(): string;
}
export declare class FileKeyStore implements KeyStore {
    private filePath;
    constructor(filePath?: string);
    save(state: AgentState): Promise<void>;
    load(): Promise<AgentState | null>;
    clear(): Promise<void>;
    getPath(): string;
}
//# sourceMappingURL=store.d.ts.map