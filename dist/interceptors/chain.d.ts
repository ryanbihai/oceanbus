import type { Message } from '../types/messaging';
export interface InterceptorContext {
    agentId: string;
    timestamp: number;
    sessionCount?: number;
    [key: string]: unknown;
}
export type InterceptorDecision = {
    action: 'pass';
} | {
    action: 'flag';
    reason: string;
    risk: 'low' | 'medium' | 'high';
} | {
    action: 'block';
    reason: string;
};
export interface MessageInterceptor {
    name: string;
    priority: number;
    evaluate(message: Message, context: InterceptorContext): Promise<InterceptorDecision>;
}
export declare class InterceptorChain {
    private interceptors;
    register(interceptor: MessageInterceptor): void;
    remove(name: string): boolean;
    list(): ReadonlyArray<MessageInterceptor>;
    process(message: Message, context: InterceptorContext): Promise<{
        decision: InterceptorDecision;
        by: string;
    }>;
}
//# sourceMappingURL=chain.d.ts.map