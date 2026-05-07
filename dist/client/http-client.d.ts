import type { ApiResponse } from '../types/api';
import type { HttpConfig } from '../types/config';
import { RetryPolicy } from './retry';
type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';
export interface RequestOptions {
    apiKey?: string;
    query?: Record<string, string | number | undefined>;
}
export declare class HttpClient {
    private baseUrl;
    private timeout;
    retryPolicy: RetryPolicy;
    constructor(baseUrl: string, config: HttpConfig);
    private url;
    private req;
    private checkDeprecated;
    request<T = unknown>(method: HttpMethod, path: string, body?: unknown, opts?: RequestOptions): Promise<ApiResponse<T>>;
    get<T = unknown>(path: string, opts?: RequestOptions): Promise<ApiResponse<T>>;
    post<T = unknown>(path: string, body?: unknown, opts?: RequestOptions): Promise<ApiResponse<T>>;
    put<T = unknown>(path: string, body?: unknown, opts?: RequestOptions): Promise<ApiResponse<T>>;
    del<T = unknown>(path: string, opts?: RequestOptions): Promise<ApiResponse<T>>;
}
export {};
//# sourceMappingURL=http-client.d.ts.map