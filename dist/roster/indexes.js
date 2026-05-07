"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToIndexes = addToIndexes;
exports.removeFromIndexes = removeFromIndexes;
exports.updateTagsInIndexes = updateTagsInIndexes;
exports.updateAgentsInIndexes = updateAgentsInIndexes;
function addToIndexes(indexes, contact) {
    for (const tag of contact.tags) {
        if (!indexes.byTag[tag])
            indexes.byTag[tag] = [];
        if (!indexes.byTag[tag].includes(contact.id))
            indexes.byTag[tag].push(contact.id);
    }
    for (const a of contact.agents) {
        // OpenID is always known (it's the public address). agentId is only known for our own identities.
        indexes.byOpenId[a.openId] = contact.id;
        if (a.agentId)
            indexes.byAgentId[a.agentId] = contact.id;
    }
}
function removeFromIndexes(indexes, contact) {
    for (const tag of contact.tags) {
        const list = indexes.byTag[tag];
        if (list) {
            indexes.byTag[tag] = list.filter(id => id !== contact.id);
            if (indexes.byTag[tag].length === 0)
                delete indexes.byTag[tag];
        }
    }
    for (const a of contact.agents) {
        if (indexes.byOpenId[a.openId] === contact.id)
            delete indexes.byOpenId[a.openId];
        if (a.agentId && indexes.byAgentId[a.agentId] === contact.id)
            delete indexes.byAgentId[a.agentId];
    }
}
function updateTagsInIndexes(indexes, contact, oldTags, newTags) {
    const added = newTags.filter(t => !oldTags.includes(t));
    const removed = oldTags.filter(t => !newTags.includes(t));
    for (const tag of added) {
        if (!indexes.byTag[tag])
            indexes.byTag[tag] = [];
        if (!indexes.byTag[tag].includes(contact.id))
            indexes.byTag[tag].push(contact.id);
    }
    for (const tag of removed) {
        const list = indexes.byTag[tag];
        if (list) {
            indexes.byTag[tag] = list.filter(id => id !== contact.id);
            if (indexes.byTag[tag].length === 0)
                delete indexes.byTag[tag];
        }
    }
}
function updateAgentsInIndexes(indexes, contactId, oldAgentIds, oldOpenIds, newAgentIds, newOpenIds) {
    for (const aid of oldAgentIds) {
        if (indexes.byAgentId[aid] === contactId)
            delete indexes.byAgentId[aid];
    }
    for (const oid of oldOpenIds) {
        if (indexes.byOpenId[oid] === contactId)
            delete indexes.byOpenId[oid];
    }
    for (let i = 0; i < newAgentIds.length; i++) {
        indexes.byOpenId[newOpenIds[i]] = contactId;
        if (newAgentIds[i])
            indexes.byAgentId[newAgentIds[i]] = contactId;
    }
}
//# sourceMappingURL=indexes.js.map