"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whoamiCommand = void 0;
const index_1 = require("../../index");
exports.whoamiCommand = {
    command: 'whoami',
    describe: 'Show current agent identity (must register first)',
    handler: async () => {
        try {
            const ob = await (0, index_1.createOceanBus)();
            if (!ob.identity.getApiKey()) {
                console.error('No identity found. Run "oceanbus register" first to create a persistent agent identity.');
                console.error('Once registered, whoami will always show the same OpenID — your permanent global address.');
                process.exit(1);
            }
            const data = await ob.whoami();
            console.log(JSON.stringify(data, null, 2));
        }
        catch (err) {
            console.error('whoami failed:', err.message);
            process.exit(1);
        }
    },
};
//# sourceMappingURL=whoami.js.map