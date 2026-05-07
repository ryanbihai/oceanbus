import type { RosterData } from '../types/roster';
export declare class RosterStore {
    private filePath;
    private data;
    constructor(filePath?: string);
    getPath(): string;
    load(): Promise<RosterData>;
    save(data: RosterData): Promise<void>;
    private flush;
    /** Clear in-memory cache (force re-read on next load) */
    invalidate(): void;
    delete(): Promise<void>;
}
//# sourceMappingURL=store.d.ts.map