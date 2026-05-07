"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCommand = void 0;
const contacts_1 = require("../contacts");
exports.addCommand = {
    command: 'add <name> <openid>',
    describe: 'Save a contact alias for quick messaging',
    builder: (yargs) => yargs
        .positional('name', { type: 'string', describe: 'Short name for this contact', demandOption: true })
        .positional('openid', { type: 'string', describe: 'Contact OpenID', demandOption: true }),
    handler: (argv) => {
        (0, contacts_1.saveContact)(argv.name, argv.openid);
        console.log(JSON.stringify({ code: 0, msg: 'saved', name: argv.name }));
    },
};
//# sourceMappingURL=add.js.map