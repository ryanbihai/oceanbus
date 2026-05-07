/**
 * Compute Hashcash-style Proof of Work.
 * `difficulty` is in BITS — the number of leading zero bits required in the SHA-256 hash.
 * A hex character covers 4 bits, so difficulty=20 translates to 5 leading hex zeros.
 */
export declare function computeHashcash(challenge: string, difficulty?: number): {
    solution: string;
    hash: string;
};
/**
 * Verify a Hashcash solution.
 */
export declare function verifyHashcash(challenge: string, solution: string, difficulty?: number): boolean;
//# sourceMappingURL=pow.d.ts.map