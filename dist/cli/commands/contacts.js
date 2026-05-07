"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactsCommand = void 0;
const contacts_1 = require("../contacts");
exports.contactsCommand = {
    command: 'contacts',
    describe: 'List saved contacts with their dedicated sender addresses',
    handler: () => {
        try {
            const names = (0, contacts_1.listContactNames)();
            if (names.length === 0) {
                console.log('No contacts saved. Use "oceanbus add <name> <openid>" to add one.');
                return;
            }
            console.log('Contacts:');
            for (const name of names) {
                const target = (0, contacts_1.resolveAlias)(name) || '(none)';
                const myId = (0, contacts_1.getMyOpenId)(name);
                console.log(`  ${name}`);
                console.log(`    对方: ${target.slice(0, 16)}...`);
                console.log(`    我方: ${myId ? myId.slice(0, 16) + '...' : '(未分配)'}`);
            }
        }
        catch (err) {
            console.error('contacts failed:', err.message);
            process.exit(1);
        }
    },
};
//# sourceMappingURL=contacts.js.map