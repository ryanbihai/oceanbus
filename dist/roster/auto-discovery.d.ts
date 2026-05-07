import type { PendingEntry, AutoDiscoveryConfig, Contact } from '../types/roster';
/**
 * Extract potential Chinese person names from a block of text.
 * Returns unique names sorted by occurrence count.
 */
export declare function extractNames(text: string, ignoreList: string[], existingContacts: Contact[]): Map<string, {
    count: number;
    contexts: string[];
}>;
/**
 * Process scan results against autoDiscovery config.
 * Returns new pending entries that met the minMentions threshold.
 */
export declare function processPending(config: AutoDiscoveryConfig, newNames: Map<string, {
    count: number;
    contexts: string[];
}>, now: string): PendingEntry[];
//# sourceMappingURL=auto-discovery.d.ts.map