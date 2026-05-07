import type { Contact, RosterIndexes } from '../types/roster';
export declare function addToIndexes(indexes: RosterIndexes, contact: Contact): void;
export declare function removeFromIndexes(indexes: RosterIndexes, contact: Contact): void;
export declare function updateTagsInIndexes(indexes: RosterIndexes, contact: Contact, oldTags: string[], newTags: string[]): void;
export declare function updateAgentsInIndexes(indexes: RosterIndexes, contactId: string, oldAgentIds: string[], oldOpenIds: string[], newAgentIds: string[], newOpenIds: string[]): void;
//# sourceMappingURL=indexes.d.ts.map