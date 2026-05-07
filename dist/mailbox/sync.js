"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailboxSync = void 0;
const errors_1 = require("../client/errors");
const MAX_PAGE_SIZE = 500;
const MAX_PAGINATION_ITERATIONS = 50;
class MailboxSync {
    http;
    getApiKey;
    cursor;
    defaultPageSize;
    constructor(http, getApiKey, cursor, defaultPageSize = 100) {
        this.http = http;
        this.getApiKey = getApiKey;
        this.cursor = cursor;
        this.defaultPageSize = Math.min(defaultPageSize, MAX_PAGE_SIZE);
    }
    getCursor() {
        return this.cursor;
    }
    async sync(sinceSeq, limit) {
        const apiKey = this.getApiKey();
        if (!apiKey)
            throw new errors_1.OceanBusError('Not authenticated');
        const allMessages = [];
        let currentSince = sinceSeq ?? this.cursor.get();
        const pageSize = limit ?? this.defaultPageSize;
        let iteration = 0;
        while (iteration < MAX_PAGINATION_ITERATIONS) {
            iteration++;
            const res = await this.http.get('/messages/sync', {
                apiKey,
                query: {
                    since_seq: currentSince,
                    limit: pageSize,
                },
            });
            const { messages, has_more } = res.data;
            if (messages && messages.length > 0) {
                allMessages.push(...messages);
                for (const msg of messages) {
                    this.cursor.set(msg.seq_id);
                }
                currentSince = this.cursor.get();
            }
            // Exit conditions
            if (!has_more)
                break;
            // Guard: if has_more is true but no messages were returned, break to avoid infinite loop
            if (!messages || messages.length === 0)
                break;
            if (limit && allMessages.length >= limit)
                break;
        }
        await this.cursor.save();
        return allMessages;
    }
}
exports.MailboxSync = MailboxSync;
//# sourceMappingURL=sync.js.map