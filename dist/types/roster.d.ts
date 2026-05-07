export interface AgentRef {
    agentId: string;
    openId: string;
    purpose: string;
    isDefault: boolean;
}
/** Per-app data stored under contacts[].apps[appName] */
export type AppData = Record<string, unknown>;
export type ContactSource = 'manual' | 'yellow-pages' | 'auto-discovery' | 'chat';
export type ContactStatus = 'active' | 'pending' | 'archived';
/** Rich source tracking — tells us WHERE the contact came from and WHEN. */
export interface Provenance {
    account: ContactSource;
    sourceId: string | null;
    firstSeenAt: string;
    lastVerifiedAt: string;
}
export interface Contact {
    id: string;
    name: string;
    agents: AgentRef[];
    myOpenId?: string;
    tags: string[];
    aliases: string[];
    notes: string;
    lastContactAt: string;
    source: ContactSource;
    provenance?: Provenance;
    status: ContactStatus;
    createdAt: string;
    updatedAt: string;
    apps: Record<string, AppData>;
}
export interface NewContact {
    name: string;
    id?: string;
    agents?: AgentRef[];
    myOpenId?: string;
    aliases?: string[];
    tags?: string[];
    notes?: string;
    source: ContactSource;
    status?: ContactStatus;
}
export interface ContactPatch {
    name?: string;
    agents?: AgentRef[];
    myOpenId?: string;
    aliases?: string[];
    tags?: string[];
    notes?: string;
    source?: ContactSource;
    status?: ContactStatus;
    lastContactAt?: string;
}
export interface UserIdentity {
    id: string;
    name: string;
    purpose: string;
    agents: AgentRef[];
}
export interface PendingEntry {
    id: string;
    name: string;
    mentionCount: number;
    firstSeenAt: string;
    lastSeenAt: string;
    contexts: string[];
}
export interface AutoDiscoveryConfig {
    enabled: boolean;
    minMentions: number;
    sources: string[];
    ignoreList: string[];
    pending: PendingEntry[];
}
export interface RosterIndexes {
    byTag: Record<string, string[]>;
    byAgentId: Record<string, string>;
    byOpenId: Record<string, string>;
}
export interface MatchEntry {
    id: string;
    name: string;
    matchField: 'id' | 'name' | 'alias' | 'tag' | 'note';
    highlight: string;
    tags: string[];
    notes: string;
    agents: AgentRef[];
    source: ContactSource;
}
export interface SearchResult {
    query: string;
    exact: MatchEntry[];
    fuzzy: MatchEntry[];
    byTag: MatchEntry[];
    byNote: MatchEntry[];
}
export type DuplicateReason = 'same_openid' | 'same_agentId' | 'name_similarity';
export interface DuplicateHint {
    contactA: string;
    contactB: string;
    reason: DuplicateReason;
    detail: string;
    confidence: number;
    createdAt: string;
}
export interface RosterFilter {
    tags?: string[];
    source?: string;
    status?: string;
    sortBy?: 'name' | 'lastContactAt' | 'createdAt';
    order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}
export interface RosterData {
    version: number;
    updatedAt: string;
    contacts: Contact[];
    identities: UserIdentity[];
    autoDiscovery: AutoDiscoveryConfig;
    indexes: RosterIndexes;
    duplicateHints: DuplicateHint[];
}
//# sourceMappingURL=roster.d.ts.map