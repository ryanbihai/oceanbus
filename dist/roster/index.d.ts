import { RosterStore } from './store';
import type { Contact, NewContact, ContactPatch, SearchResult, RosterFilter, AppData, PendingEntry, RosterData, DuplicateHint, Provenance } from '../types/roster';
export type { Contact, NewContact, ContactPatch, SearchResult, RosterFilter, AppData, PendingEntry, RosterData, DuplicateHint, Provenance };
export declare class RosterService {
    private store;
    private data;
    constructor(store?: RosterStore);
    private ensureLoaded;
    private save;
    search(query: string): Promise<SearchResult>;
    get(id: string): Promise<Contact | null>;
    findByAgentId(agentId: string): Promise<Contact | null>;
    findByOpenId(openId: string): Promise<Contact | null>;
    list(filter?: RosterFilter): Promise<Contact[]>;
    add(input: NewContact): Promise<{
        contact: Contact;
        duplicateHints: DuplicateHint[];
    }>;
    update(id: string, patch: ContactPatch): Promise<Contact>;
    updateAppData(id: string, appName: string, data: AppData): Promise<Contact>;
    delete(id: string, soft?: boolean): Promise<void>;
    merge(keepId: string, discardId: string): Promise<Contact>;
    addAlias(id: string, alias: string): Promise<Contact>;
    updateTags(id: string, tags: string[]): Promise<Contact>;
    touch(id: string): Promise<void>;
    scanText(text: string): Promise<{
        newPending: PendingEntry[];
        totalPending: number;
    }>;
    getPending(): Promise<PendingEntry[]>;
    approvePending(pendingId: string): Promise<Contact>;
    rejectPending(pendingId: string): Promise<void>;
    getIdentities(): Promise<import("../types/roster").UserIdentity[]>;
    getDuplicateHints(): Promise<DuplicateHint[]>;
    /** Dismiss a single hint (user chose "keep separate"). */
    dismissDuplicateHint(contactA: string, contactB: string): Promise<void>;
    stats(): Promise<{
        total: number;
        active: number;
        pending: number;
        archived: number;
    }>;
}
//# sourceMappingURL=index.d.ts.map