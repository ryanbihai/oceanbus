"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockCommand = void 0;
const index_1 = require("../../index");
exports.blockCommand = {
    command: 'block <openid>',
    describe: 'Block a sender by their from_openid',
    builder: (yargs) => yargs.positional('openid', {
        type: 'string',
        describe: 'Sender OpenID to block',
        demandOption: true,
    }),
    handler: async (argv) => {
        try {
            const ob = await (0, index_1.createOceanBus)();
            await ob.blockSender(argv.openid);
            console.log(JSON.stringify({ code: 0, msg: 'blocked' }));
        }
        catch (err) {
            console.error('Block failed:', err.message);
            process.exit(1);
        }
    },
};
//# sourceMappingURL=block.js.map