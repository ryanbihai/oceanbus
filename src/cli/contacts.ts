import fs from 'fs';
import path from 'path';
import os from 'os';

const CONTACTS_FILE = path.join(os.homedir(), '.oceanbus', 'contacts.json');

export function loadContacts(): Record<string, string> {
  try {
    if (fs.existsSync(CONTACTS_FILE)) {
      return JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf-8'));
    }
  } catch {}
  return {};
}

export function saveContact(name: string, openid: string): void {
  const dir = path.dirname(CONTACTS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const contacts = loadContacts();
  contacts[name] = openid;
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
}

export function resolveAlias(name: string): string | null {
  const contacts = loadContacts();
  return contacts[name] || null;
}
