"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCli = runCli;
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const register_1 = require("./commands/register");
const whoami_1 = require("./commands/whoami");
const openid_1 = require("./commands/openid");
const send_1 = require("./commands/send");
const listen_1 = require("./commands/listen");
const block_1 = require("./commands/block");
const keygen_1 = require("./commands/keygen");
const key_new_1 = require("./commands/key-new");
const key_revoke_1 = require("./commands/key-revoke");
const add_1 = require("./commands/add");
function runCli(argv = process.argv) {
    (0, yargs_1.default)((0, helpers_1.hideBin)(argv))
        .scriptName('oceanbus')
        .usage('$0 <command> [options]')
        .command(register_1.registerCommand)
        .command(whoami_1.whoamiCommand)
        .command(openid_1.openidCommand)
        .command(send_1.sendCommand)
        .command(listen_1.listenCommand)
        .command(block_1.blockCommand)
        .command(add_1.addCommand)
        .command(keygen_1.keygenCommand)
        .command(key_new_1.keyNewCommand)
        .command(key_revoke_1.keyRevokeCommand)
        .demandCommand(1, 'Please specify a command')
        .help()
        .version()
        .strict()
        .parse();
}
//# sourceMappingURL=index.js.map