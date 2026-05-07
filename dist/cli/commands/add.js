"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCommand = void 0;
const index_1 = require("../../index");
const contacts_1 = require("../contacts");
exports.addCommand = {
    command: 'add <name> <openid>',
    describe: 'Save a contact with a dedicated sender OpenID for session continuity',
    builder: (yargs) => yargs
        .positional('name', { type: 'string', describe: 'Short name for this contact', demandOption: true })
        .positional('openid', { type: 'string', describe: 'Contact OpenID', demandOption: true }),
    handler: async (argv) => {
        try {
            const ob = await (0, index_1.createOceanBus)();
            if (!ob.identity.getApiKey()) {
                console.error('No identity found. Run "oceanbus register" first.');
                process.exit(1);
            }
            // Generate a dedicated OpenID for this contact
            let myOpenId;
            try {
                const me = await ob.identity.whoami();
                myOpenId = me.my_openid;
            }
            catch {
                myOpenId = ob.identity.getCachedOpenId() || '';
            }
            // Save to contacts.json (backward compat + CLI resolution)
            (0, contacts_1.saveContact)(argv.name, argv.openid);
            (0, contacts_1.setMyOpenId)(argv.name, myOpenId);
            // Also save to Roster if available
            try {
                await ob.roster.add({
                    name: argv.name,
                    source: 'manual',
                    myOpenId,
                    agents: [{ agentId: '', openId: argv.openid, purpose: '', isDefault: true }],
                });
            }
            catch { /* roster may not be initialized yet */ }
            console.log(JSON.stringify({
                code: 0,
                msg: 'saved',
                name: argv.name,
                my_openid_short: myOpenId.slice(0, 20) + '...',
                hint: `Use "oceanbus send ${argv.name} -m \\"hi\\"" — messages will always come from this address.`,
            }, null, 2));
        }
        catch (err) {
            console.error('add failed:', err.message);
            process.exit(1);
        }
    },
};
//# sourceMappingURL=add.js.map