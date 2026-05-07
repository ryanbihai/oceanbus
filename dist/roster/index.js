"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RosterService = void 0;
const store_1 = require("./store");
const search_1 = require("./search");
const indexes_1 = require("./indexes");
const auto_discovery_1 = require("./auto-discovery");
class RosterService {
    store;
    data = null;
    constructor(store) {
        this.store = store || new store_1.RosterStore();
    }
    async ensureLoaded() {
        if (!this.data) {
            this.data = await this.store.load();
        }
        return this.data;
    }
    async save() {
        if (!this.data)
            return;
        await this.store.save(this.data);
    }
    // ── Query ──
    async search(query) {
        const d = await this.ensureLoaded();
        return (0, search_1.search)(d.contacts, query);
    }
    async get(id) {
        const d = await this.ensureLoaded();
        return (0, search_1.getById)(d.contacts, id);
    }
    async findByAgentId(agentId) {
        const d = await this.ensureLoaded();
        return (0, search_1.findByAgentId)(d.contacts, d.indexes, agentId);
    }
    async findByOpenId(openId) {
        const d = await this.ensureLoaded();
        return (0, search_1.findByOpenId)(d.contacts, d.indexes, openId);
    }
    async list(filter) {
        const d = await this.ensureLoaded();
        return (0, search_1.list)(d.contacts, filter);
    }
    // ── Write ──
    async add(input) {
        const d = await this.ensureLoaded();
        const now = new Date().toISOString();
        const id = input.id || (0, search_1.slugFromName)(input.name);
        // Check uniqueness
        if (d.contacts.some(c => c.id === id && c.status !== 'archived')) {
            throw new Error(`Contact with id "${id}" already exists`);
        }
        const provenance = buildProvenance(input.source, null, now);
        const contact = {
            id,
            name: input.name,
            agents: input.agents || [],
            myOpenId: input.myOpenId,
            tags: input.tags || [],
            aliases: input.aliases || [],
            notes: input.notes || '',
            source: input.source,
            provenance,
            status: input.status || 'active',
            lastContactAt: now,
            createdAt: now,
            updatedAt: now,
            apps: {},
        };
        d.contacts.push(contact);
        (0, indexes_1.addToIndexes)(d.indexes, contact);
        // Auto-detect duplicates
        const newHints = (0, search_1.findDuplicates)(contact, d.contacts, d.duplicateHints, now);
        if (newHints.length > 0) {
            d.duplicateHints.push(...newHints);
        }
        await this.save();
        return { contact, duplicateHints: newHints };
    }
    async update(id, patch) {
        const d = await this.ensureLoaded();
        const contact = (0, search_1.getById)(d.contacts, id);
        if (!contact)
            throw new Error(`Contact "${id}" not found`);
        const oldTags = [...contact.tags];
        const oldAgentIds = contact.agents.map(a => a.agentId);
        const oldOpenIds = contact.agents.map(a => a.openId);
        if (patch.name !== undefined)
            contact.name = patch.name;
        if (patch.agents !== undefined)
            contact.agents = patch.agents;
        if (patch.myOpenId !== undefined)
            contact.myOpenId = patch.myOpenId;
        if (patch.tags !== undefined)
            contact.tags = patch.tags;
        if (patch.aliases !== undefined)
            contact.aliases = patch.aliases;
        if (patch.notes !== undefined)
            contact.notes = patch.notes;
        if (patch.source !== undefined)
            contact.source = patch.source;
        if (patch.status !== undefined)
            contact.status = patch.status;
        if (patch.lastContactAt !== undefined)
            contact.lastContactAt = patch.lastContactAt;
        contact.updatedAt = new Date().toISOString();
        if (contact.provenance)
            contact.provenance.lastVerifiedAt = contact.updatedAt;
        // Update indexes
        if (patch.tags) {
            (0, indexes_1.updateTagsInIndexes)(d.indexes, contact, oldTags, patch.tags);
        }
        if (patch.agents) {
            (0, indexes_1.updateAgentsInIndexes)(d.indexes, contact.id, oldAgentIds, oldOpenIds, contact.agents.map(a => a.agentId), contact.agents.map(a => a.openId));
        }
        await this.save();
        return contact;
    }
    async updateAppData(id, appName, data) {
        const d = await this.ensureLoaded();
        const contact = (0, search_1.getById)(d.contacts, id);
        if (!contact)
            throw new Error(`Contact "${id}" not found`);
        contact.apps[appName] = data;
        contact.updatedAt = new Date().toISOString();
        if (contact.provenance)
            contact.provenance.lastVerifiedAt = contact.updatedAt;
        await this.save();
        return contact;
    }
    async delete(id, soft = true) {
        const d = await this.ensureLoaded();
        const contact = (0, search_1.getById)(d.contacts, id);
        if (!contact)
            throw new Error(`Contact "${id}" not found`);
        if (soft) {
            contact.status = 'archived';
            contact.updatedAt = new Date().toISOString();
            (0, indexes_1.removeFromIndexes)(d.indexes, contact);
        }
        else {
            (0, indexes_1.removeFromIndexes)(d.indexes, contact);
            d.contacts = d.contacts.filter(c => c.id !== id);
        }
        await this.save();
    }
    async merge(keepId, discardId) {
        const d = await this.ensureLoaded();
        const keep = (0, search_1.getById)(d.contacts, keepId);
        const discard = (0, search_1.getById)(d.contacts, discardId);
        if (!keep)
            throw new Error(`Contact "${keepId}" not found`);
        if (!discard)
            throw new Error(`Contact "${discardId}" not found`);
        // Merge agents (dedup by openId — the one identifier we always have)
        const seenOpenIds = new Set(keep.agents.map(a => a.openId));
        for (const a of discard.agents) {
            if (!seenOpenIds.has(a.openId)) {
                keep.agents.push(a);
                seenOpenIds.add(a.openId);
            }
        }
        keep.aliases = [...new Set([...keep.aliases, ...discard.aliases, discard.name])];
        keep.tags = [...new Set([...keep.tags, ...discard.tags])];
        if (discard.notes)
            keep.notes = keep.notes ? `${keep.notes}; ${discard.notes}` : discard.notes;
        keep.lastContactAt = keep.lastContactAt > discard.lastContactAt ? keep.lastContactAt : discard.lastContactAt;
        keep.updatedAt = new Date().toISOString();
        if (keep.provenance)
            keep.provenance.lastVerifiedAt = keep.updatedAt;
        // Merge app data (keep wins on conflict)
        for (const [app, appData] of Object.entries(discard.apps)) {
            if (!keep.apps[app])
                keep.apps[app] = appData;
        }
        // Dismiss duplicate hints involving either contact
        d.duplicateHints = (0, search_1.dismissHintsForContact)(d.duplicateHints, keepId);
        d.duplicateHints = (0, search_1.dismissHintsForContact)(d.duplicateHints, discardId);
        // Soft-delete discard
        (0, indexes_1.removeFromIndexes)(d.indexes, discard);
        discard.status = 'archived';
        discard.updatedAt = new Date().toISOString();
        // Rebuild indexes for keep
        (0, indexes_1.removeFromIndexes)(d.indexes, keep);
        (0, indexes_1.addToIndexes)(d.indexes, keep);
        await this.save();
        return keep;
    }
    async addAlias(id, alias) {
        const contact = await this.get(id);
        if (!contact)
            throw new Error(`Contact "${id}" not found`);
        if (contact.aliases.includes(alias))
            return contact;
        return this.update(id, { aliases: [...contact.aliases, alias] });
    }
    async updateTags(id, tags) {
        return this.update(id, { tags });
    }
    async touch(id) {
        await this.update(id, { lastContactAt: new Date().toISOString() });
    }
    // ── Auto-discovery ──
    async scanText(text) {
        const d = await this.ensureLoaded();
        const names = (0, auto_discovery_1.extractNames)(text, d.autoDiscovery.ignoreList, d.contacts);
        const now = new Date().toISOString();
        const added = (0, auto_discovery_1.processPending)(d.autoDiscovery, names, now);
        if (added.length > 0)
            await this.save();
        return { newPending: added, totalPending: d.autoDiscovery.pending.length };
    }
    async getPending() {
        const d = await this.ensureLoaded();
        return d.autoDiscovery.pending;
    }
    async approvePending(pendingId) {
        const d = await this.ensureLoaded();
        const idx = d.autoDiscovery.pending.findIndex(p => p.id === pendingId);
        if (idx === -1)
            throw new Error(`Pending entry "${pendingId}" not found`);
        const entry = d.autoDiscovery.pending[idx];
        d.autoDiscovery.pending.splice(idx, 1);
        const { contact } = await this.add({
            name: entry.name,
            source: 'auto-discovery',
            notes: `Auto-discovered from: ${entry.contexts.join(' | ')}`,
        });
        await this.save();
        return contact;
    }
    async rejectPending(pendingId) {
        const d = await this.ensureLoaded();
        const entry = d.autoDiscovery.pending.find(p => p.id === pendingId);
        if (!entry)
            throw new Error(`Pending entry "${pendingId}" not found`);
        d.autoDiscovery.pending = d.autoDiscovery.pending.filter(p => p.id !== pendingId);
        if (!d.autoDiscovery.ignoreList.includes(entry.name)) {
            d.autoDiscovery.ignoreList.push(entry.name);
        }
        await this.save();
    }
    // ── Identities (self) ──
    async getIdentities() {
        const d = await this.ensureLoaded();
        return d.identities;
    }
    // ── Duplicate hints ──
    async getDuplicateHints() {
        const d = await this.ensureLoaded();
        return d.duplicateHints;
    }
    /** Dismiss a single hint (user chose "keep separate"). */
    async dismissDuplicateHint(contactA, contactB) {
        const d = await this.ensureLoaded();
        d.duplicateHints = d.duplicateHints.filter(h => !(h.contactA === contactA && h.contactB === contactB) &&
            !(h.contactA === contactB && h.contactB === contactA));
        await this.save();
    }
    // ── Stats ──
    async stats() {
        const d = await this.ensureLoaded();
        return {
            total: d.contacts.length,
            active: d.contacts.filter(c => c.status === 'active').length,
            pending: d.contacts.filter(c => c.status === 'pending').length,
            archived: d.contacts.filter(c => c.status === 'archived').length,
        };
    }
}
exports.RosterService = RosterService;
// ── Helpers ──
function buildProvenance(source, sourceId, now) {
    return {
        account: source,
        sourceId,
        firstSeenAt: now,
        lastVerifiedAt: now,
    };
}
//# sourceMappingURL=index.js.map