"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommand = void 0;
const index_1 = require("../../index");
exports.registerCommand = {
    command: 'register',
    describe: 'Register a new Agent identity',
    handler: async () => {
        try {
            const ob = await (0, index_1.createOceanBus)();
            const data = await ob.register();
            console.log(JSON.stringify(data, null, 2));
            console.error('Identity saved to ~/.oceanbus/credentials.json');
        }
        catch (err) {
            console.error('Registration failed:', err.message);
            process.exit(1);
        }
    },
};
//# sourceMappingURL=register.js.map