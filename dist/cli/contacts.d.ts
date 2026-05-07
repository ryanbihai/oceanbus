type ContactsData = Record<string, any>;
export declare function loadContacts(): ContactsData;
export declare function saveContact(name: string, openid: string): void;
export declare function resolveAlias(name: string): string | null;
/** Get the myOpenId assigned to a contact. Returns null if none. */
export declare function getMyOpenId(name: string): string | null;
/** Store the myOpenId for a contact. */
export declare function setMyOpenId(name: string, openid: string): void;
/** List all contact names (excluding internal keys) */
export declare function listContactNames(): string[];
export {};
//# sourceMappingURL=contacts.d.ts.map