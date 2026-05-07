"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openidCommand = void 0;
const index_1 = require("../../index");
exports.openidCommand = {
    command: 'openid',
    describe: 'Get and print current OpenID',
    handler: async () => {
        try {
            const ob = await (0, index_1.createOceanBus)();
            const openid = await ob.getOpenId();
            console.log(openid);
        }
        catch (err) {
            console.error('openid failed:', err.message);
            process.exit(1);
        }
    },
};
//# sourceMappingURL=openid.js.map