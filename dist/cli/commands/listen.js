"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenCommand = void 0;
const index_1 = require("../../index");
exports.listenCommand = {
    command: 'listen',
    describe: 'Listen for incoming messages',
    builder: (yargs) => yargs.option('format', {
        type: 'string',
        choices: ['json', 'text'],
        default: 'text',
        description: 'Output format',
    }),
    handler: async (argv) => {
        try {
            const ob = await (0, index_1.createOceanBus)();
            const format = argv.format || 'text';
            console.error(`Listening for messages... (format: ${format})`);
            console.error('Press Ctrl+C to stop.\n');
            const stop = ob.startListening((msg) => {
                if (format === 'json') {
                    console.log(JSON.stringify(msg));
                }
                else {
                    const toStr = msg.to_openid ? `→${msg.to_openid.slice(0, 12)}...` : '';
                    console.log(`[seq:${msg.seq_id}] ${msg.from_openid.slice(0, 16)}... ${toStr}: ${msg.content}`);
                }
            });
            // Graceful shutdown
            process.on('SIGINT', () => {
                console.error('\nStopping...');
                stop();
                process.exit(0);
            });
            process.on('SIGTERM', () => {
                stop();
                process.exit(0);
            });
        }
        catch (err) {
            console.error('Listen failed:', err.message);
            process.exit(1);
        }
    },
};
//# sourceMappingURL=listen.js.map