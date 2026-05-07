import type { Ed25519KeyPair } from '../types/crypto';
export declare function generateKeypair(): Promise<Ed25519KeyPair>;
export declare function sign(secretKey: Uint8Array, payload: Record<string, unknown>): Promise<string>;
export declare function verify(publicKey: Uint8Array, payload: Record<string, unknown>, signature: string): Promise<boolean>;
export declare function keypairToBase64url(keypair: Ed25519KeyPair): {
    publicKey: string;
    secretKey: string;
};
export declare function base64urlToKeypair(publicKeyStr: string, secretKeyStr: string): Ed25519KeyPair;
export declare function bufferToHex(buf: Uint8Array): string;
export declare function hexToBuffer(hex: string): Uint8Array;
/** @deprecated Use keypairToBase64url instead. */
export declare function keypairToHex(keypair: Ed25519KeyPair): {
    publicKey: string;
    secretKey: string;
};
export declare function hexToKeypair(publicKeyHex: string, secretKeyHex: string): Ed25519KeyPair;
//# sourceMappingURL=ed25519.d.ts.map