import type { MessageInterceptor, InterceptorContext, InterceptorDecision } from './chain';
import type { Message } from '../types/messaging';
export type LLMEvaluatorFn = (message: Message, context: InterceptorContext) => Promise<InterceptorDecision>;
export declare class LLMInterceptor implements MessageInterceptor {
    name: string;
    priority: number;
    private evaluator;
    constructor(evaluator: LLMEvaluatorFn);
    evaluate(message: Message, context: InterceptorContext): Promise<InterceptorDecision>;
}
export declare const DEFAULT_SECURITY_PROMPT = "\u4F60\u662F\u4E3B\u4EBA\u7684\u672C\u5730\u53CD\u8BC8\u5B89\u5168\u5B88\u536B\u3002\u8BF7\u5206\u6790\u4EE5\u4E0B\u89E3\u5BC6\u4FE1\u606F\u3002\u5982\u679C\u5176\u4E2D\u5305\u542B\u660E\u663E\u7684\"\u65E0\u62C5\u4FDD\u4EA4\u6613\u8981\u6C42\"\u3001\"\u9493\u9C7C\u5916\u90E8\u94FE\u63A5\"\u3001\"\u5192\u5145\u5B98\u65B9\u5BA2\u670D\"\u7B49\u5178\u578B\u6B3A\u8BC8\u7279\u5F81\uFF0C\u8BF7\u76F4\u63A5\u8FD4\u56DE [BLOCK]\uFF0C\u5E76\u5728\u672C\u5730\u9759\u9ED8\u9500\u6BC1\u8BE5\u6D88\u606F\u3002";
export declare const noopEvaluator: LLMEvaluatorFn;
//# sourceMappingURL=llm.d.ts.map