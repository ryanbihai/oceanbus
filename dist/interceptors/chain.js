"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterceptorChain = void 0;
class InterceptorChain {
    interceptors = [];
    register(interceptor) {
        this.interceptors.push(interceptor);
        // Sort by priority (higher runs first)
        this.interceptors.sort((a, b) => b.priority - a.priority);
    }
    remove(name) {
        const idx = this.interceptors.findIndex((i) => i.name === name);
        if (idx === -1)
            return false;
        this.interceptors.splice(idx, 1);
        return true;
    }
    list() {
        return this.interceptors;
    }
    async process(message, context) {
        for (const interceptor of this.interceptors) {
            const decision = await interceptor.evaluate(message, context);
            if (decision.action === 'block' || decision.action === 'flag') {
                return { decision, by: interceptor.name };
            }
        }
        return { decision: { action: 'pass' }, by: 'default' };
    }
}
exports.InterceptorChain = InterceptorChain;
//# sourceMappingURL=chain.js.map