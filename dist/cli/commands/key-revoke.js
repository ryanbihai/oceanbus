"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyRevokeCommand = void 0;
const index_1 = require("../../index");
exports.keyRevokeCommand = {
    command: 'key revoke <key_id>',
    describe: 'Revoke an API key',
    builder: (yargs) => yargs.positional('key_id', {
        type: 'string',
        describe: 'API key ID to revoke',
        demandOption: true,
    }),
    handler: async (argv) => {
        try {
            const ob = await (0, index_1.createOceanBus)();
            await ob.revokeApiKey(argv.key_id);
            console.log(JSON.stringify({ code: 0, msg: 'revoked' }));
        }
        catch (err) {
            console.error('Revoke failed:', err.message);
            process.exit(1);
        }
    },
};
//# sourceMappingURL=key-revoke.js.map