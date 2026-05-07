export declare class SeqCursor {
    private filePath;
    private lastSeq;
    constructor(filePath?: string);
    get(): number;
    set(seq: number): void;
    load(): Promise<void>;
    save(): Promise<void>;
    reset(): Promise<void>;
}
//# sourceMappingURL=cursor.d.ts.map