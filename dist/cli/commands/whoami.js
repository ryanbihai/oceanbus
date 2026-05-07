"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whoamiCommand = void 0;
const index_1 = require("../../index");
exports.whoamiCommand = {
    command: 'whoami',
    describe: 'Show current agent_id and latest OpenID',
    handler: async () => {
        try {
            const ob = await (0, index_1.createOceanBus)();
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