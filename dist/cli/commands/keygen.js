"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keygenCommand = void 0;
const ed25519_1 = require("../../crypto/ed25519");
exports.keygenCommand = {
    command: 'keygen',
    describe: 'Generate Ed25519 keypair',
    handler: async () => {
        try {
            const keypair = await (0, ed25519_1.generateKeypair)();
            const hex = (0, ed25519_1.keypairToHex)(keypair);
            console.log(JSON.stringify(hex, null, 2));
        }
        catch (err) {
            console.error('Keygen failed:', err.message);
            process.exit(1);
        }
    },
};
//# sourceMappingURL=keygen.js.map