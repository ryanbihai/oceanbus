"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noopEvaluator = exports.DEFAULT_SECURITY_PROMPT = exports.LLMInterceptor = void 0;
class LLMInterceptor {
    name = 'llm-security-scanner';
    priority = 100;
    evaluator;
    constructor(evaluator) {
        this.evaluator = evaluator;
    }
    async evaluate(message, context) {
        return this.evaluator(message, context);
    }
}
exports.LLMInterceptor = LLMInterceptor;
// Default system prompt for LLM-based fraud detection
exports.DEFAULT_SECURITY_PROMPT = `你是主人的本地反诈安全守卫。请分析以下解密信息。如果其中包含明显的"无担保交易要求"、"钓鱼外部链接"、"冒充官方客服"等典型欺诈特征，请直接返回 [BLOCK]，并在本地静默销毁该消息。`;
// No-op evaluator that passes everything (default when no LLM configured)
const noopEvaluator = async () => ({ action: 'pass' });
exports.noopEvaluator = noopEvaluator;
//# sourceMappingURL=llm.js.map