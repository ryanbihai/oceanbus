import type { Contact, SearchResult, RosterFilter, DuplicateHint } from '../types/roster';
/**
 * Search contacts with conservative fuzzy matching.
 * Exact: query matches id, name, or any alias exactly (case-insensitive).
 * Fuzzy: query is a substring of name or alias (after normalizing spaces/punctuation).
 * byTag: query matches any tag.
 * byNote: query appears in notes.
 *
 * The result is a structured candidate set — disambiguation is the LLM's job.
 */
export declare function search(contacts: Contact[], query: string): SearchResult;
export declare function getById(contacts: Contact[], id: string): Contact | null;
export declare function findByAgentId(contacts: Contact[], indexes: {
    byAgentId: Record<string, string>;
}, agentId: string): Contact | null;
export declare function findByOpenId(contacts: Contact[], indexes: {
    byOpenId: Record<string, string>;
}, openId: string): Contact | null;
export declare function list(contacts: Contact[], filter?: RosterFilter): Contact[];
/** Generate a slug from a Chinese or English name */
export declare function slugFromName(name: string): string;
/**
 * Check if a new or updated contact looks like a duplicate of an existing one.
 * Rules (in priority order):
 *   1. Same OpenID — high confidence (0.95)
 *   2. Same AgentID — high confidence (0.90)
 *   3. Name highly similar — medium confidence (0.60–0.85)
 *
 * Returns hints for NEW potential duplicates not already in existingHints.
 */
export declare function findDuplicates(incoming: Contact, existingContacts: Contact[], existingHints: DuplicateHint[], now: string): DuplicateHint[];
/** Dismiss a hint (called after user decides keep-separate or after merge) */
export declare function dismissHintsForContact(hints: DuplicateHint[], contactId: string): DuplicateHint[];
//# sourceMappingURL=search.d.ts.map