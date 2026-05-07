"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCommand = void 0;
const index_1 = require("../../index");
const contacts_1 = require("../contacts");
exports.sendCommand = {
    command: 'send <openid>',
    describe: 'Send a message to a recipient OpenID or contact alias',
    builder: (yargs) => yargs
        .positional('openid', {
        type: 'string',
        describe: 'Recipient OpenID or saved contact name',
        demandOption: true,
    })
        .option('message', {
        alias: 'm',
        type: 'string',
        describe: 'Message content (default: read from stdin)',
    }),
    handler: async (argv) => {
        try {
            const content = argv.message || await readStdin();
            if (!content) {
                console.error('No message content. Use -m "message" or pipe content.');
                process.exit(1);
            }
            const target = (0, contacts_1.resolveAlias)(argv.openid) || argv.openid;
            const ob = await (0, index_1.createOceanBus)();
            await ob.send(target, content);
            console.log(JSON.stringify({ code: 0, msg: 'sent' }));
        }
        catch (err) {
            console.error('Send failed:', err.message);
            process.exit(1);
        }
    },
};
function readStdin() {
    return new Promise((resolve) => {
        if (process.stdin.isTTY) {
            resolve('');
            return;
        }
        let data = '';
        let resolved = false;
        process.stdin.setEncoding('utf-8');
        process.stdin.on('data', (chunk) => { data += chunk; });
        process.stdin.on('end', () => {
            if (!resolved) {
                resolved = true;
                resolve(data.trim());
            }
        });
        process.stdin.on('error', () => {
            if (!resolved) {
                resolved = true;
                resolve('');
            }
        });
        process.stdin.resume();
    });
}
//# sourceMappingURL=send.js.map