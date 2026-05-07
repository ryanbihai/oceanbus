import type { HttpConfig } from '../types/config';
export declare class RetryPolicy {
    private config;
    constructor(config: HttpConfig['retry']);
    shouldRetry(error: Error & {
        status?: number;
        response?: {
            status?: number;
        };
        httpStatus?: number;
    }): boolean;
    nextDelay(attempt: number): number;
    execute<T>(fn: () => Promise<T>): Promise<T>;
}
//# sourceMappingURL=retry.d.ts.map