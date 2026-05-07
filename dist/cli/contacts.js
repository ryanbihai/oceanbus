"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadContacts = loadContacts;
exports.saveContact = saveContact;
exports.resolveAlias = resolveAlias;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const CONTACTS_FILE = path_1.default.join(os_1.default.homedir(), '.oceanbus', 'contacts.json');
function loadContacts() {
    try {
        if (fs_1.default.existsSync(CONTACTS_FILE)) {
            return JSON.parse(fs_1.default.readFileSync(CONTACTS_FILE, 'utf-8'));
        }
    }
    catch { }
    return {};
}
function saveContact(name, openid) {
    const dir = path_1.default.dirname(CONTACTS_FILE);
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
    const contacts = loadContacts();
    contacts[name] = openid;
    fs_1.default.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
}
function resolveAlias(name) {
    const contacts = loadContacts();
    return contacts[name] || null;
}
//# sourceMappingURL=contacts.js.map