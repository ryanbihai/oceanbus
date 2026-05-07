import type { CommandModule } from 'yargs';
import { loadContacts, saveContact } from '../contacts';

interface AddArgs {
  name: string;
  openid: string;
}

export const addCommand: CommandModule = {
  command: 'add <name> <openid>',
  describe: 'Save a contact alias for quick messaging',
  builder: (yargs) =>
    yargs
      .positional('name', { type: 'string', describe: 'Short name for this contact', demandOption: true })
      .positional('openid', { type: 'string', describe: 'Contact OpenID', demandOption: true }),
  handler: (argv: any) => {
    saveContact(argv.name, argv.openid);
    console.log(JSON.stringify({ code: 0, msg: 'saved', name: argv.name }));
  },
};
