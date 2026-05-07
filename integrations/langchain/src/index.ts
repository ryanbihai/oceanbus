/**
 * OceanBus LangChain Connector
 *
 * 让 LangChain / CrewAI 开发者一行代码就给 Agent 加上通信能力。
 *
 * 快速开始：
 *
 *   import { oceanbusTools } from "oceanbus-langchain";
 *
 *   const agent = createToolCallingAgent({
 *     llm: new ChatOpenAI({ model: "gpt-4" }),
 *     tools: oceanbusTools,    // ← 5个OceanBus工具一次性注入
 *     prompt: chatPrompt,
 *   });
 *
 * 也可以只导入需要的工具：
 *
 *   import { oceanbusSendTool, oceanbusDiscoverTool } from "oceanbus-langchain";
 *
 * 查看工具用量统计：
 *
 *   import { getOceanBusStats } from "oceanbus-langchain";
 *   console.log(getOceanBusStats());
 */

// 单个工具
export {
  oceanbusSendTool,
  oceanbusDiscoverTool,
  // oceanbusReputationTool,  // ← 等待 L1 声誉服务部署
  oceanbusGetOpenIdTool,
  oceanbusPublishTool,
  oceanbusCheckMailboxTool,
} from "./tools.js";

// 全部工具打包（推荐用法）
export { oceanbusTools } from "./tools.js";

// 用量统计
import { getTelemetry } from "./telemetry.js";

let _telemInitialized = false;

// tools.ts 模块加载时会初始化 telemetry，这里做一次安全校验
function safeGetTelemetry() {
  try {
    const t = getTelemetry();
    _telemInitialized = true;
    return t;
  } catch {
    return null;
  }
}

export function getOceanBusStats() {
  const t = safeGetTelemetry();
  if (!t) {
    return { error: "Telemetry 尚未初始化，请先使用至少一个 OceanBus 工具" };
  }
  return t.getStats();
}

export function printOceanBusStats() {
  const t = safeGetTelemetry();
  if (!t) {
    console.log("Telemetry 尚未初始化，请先使用至少一个 OceanBus 工具");
    return;
  }
  console.log(t.printStats());
}
