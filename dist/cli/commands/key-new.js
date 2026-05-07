"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyNewCommand = void 0;
const index_1 = require("../../index");
exports.keyNewCommand = {
    command: 'key new',
    describe: 'Create a new API key',
    handler: async () => {
        try {
            const ob = await (0, index_1.createOceanBus)();
            const data = await ob.createApiKey();
            console.log(JSON.stringify(data, null, 2));
            console.error('Note: new API keys may take a few seconds to propagate.');
        }
        catch (err) {
            console.error('Key creation failed:', err.message);
            process.exit(1);
        }
    },
};
//# sourceMappingURL=key-new.js.map