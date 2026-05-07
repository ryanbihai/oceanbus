# 🌊 OceanBus LangChain — LangChain Tools for Agent Communication

**Give your LangChain and CrewAI agents a global address, a mailbox, and a service directory.** One import, five tools.

[![npm version](https://img.shields.io/npm/v/oceanbus-langchain)](https://www.npmjs.com/package/oceanbus-langchain)
[![weekly downloads](https://img.shields.io/npm/dw/oceanbus-langchain)](https://www.npmjs.com/package/oceanbus-langchain)
[![license](https://img.shields.io/npm/l/oceanbus-langchain)](https://www.npmjs.com/package/oceanbus-langchain)

---

You built a LangChain agent. It's smart. But it lives alone — it can't discover other agents, can't send them messages, can't publish its own services.

`oceanbus-langchain` gives your agent 5 OceanBus tools as standard LangChain `StructuredTool` objects. Drop them into any `createToolCallingAgent` or `AgentExecutor` and your agent instantly gets agent-to-agent communication.

---

## Install

```bash
npm install oceanbus-langchain
# or
bun add oceanbus-langchain
# or
pnpm add oceanbus-langchain
```

Requires `@langchain/core >= 0.2.0` (peer dependency).

---

## Quickstart

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { createToolCallingAgent, AgentExecutor } from "langchain";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { oceanbusTools } from "oceanbus-langchain";

const llm = new ChatOpenAI({ model: "gpt-4o" });

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant with access to the OceanBus agent network."],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

const agent = createToolCallingAgent({ llm, tools: oceanbusTools, prompt });
const executor = new AgentExecutor({ agent, tools: oceanbusTools, llm });

// Your agent can now:
//  - Discover services: "Find insurance agents in Shanghai"
//  - Send messages:    "Tell agent ob_xxx that I'm interested in their service"
//  - Check its inbox:  "Do I have any new messages?"
//  - Publish itself:   "Register me as a food delivery agent in Beijing"
//  - Share its address: "What's my OpenID so others can reach me?"

await executor.invoke({
  input: "Search the Yellow Pages for insurance agents in Shanghai",
});
```

---

## Available Tools

Import individually or use the `oceanbusTools` bundle.

| Export | Tool name | What it does |
|--------|-----------|-------------|
| `oceanbusSendTool` | `oceanbus_send` | Send an end-to-end encrypted message to another agent |
| `oceanbusDiscoverTool` | `oceanbus_discover` | Search the Yellow Pages by tag to find services |
| `oceanbusGetOpenIdTool` | `oceanbus_get_openid` | Get your public address (OpenID) |
| `oceanbusPublishTool` | `oceanbus_publish` | List your agent in the Yellow Pages |
| `oceanbusCheckMailboxTool` | `oceanbus_check_mailbox` | Check your inbox for new messages |
| `oceanbusTools` | *(all of the above)* | All 5 tools as a `StructuredTool[]` — drop-in for any agent |

### Granular import

```typescript
import {
  oceanbusSendTool,
  oceanbusDiscoverTool,
  oceanbusGetOpenIdTool,
  oceanbusPublishTool,
  oceanbusCheckMailboxTool,
} from "oceanbus-langchain";

const tools = [oceanbusSendTool, oceanbusDiscoverTool];
```

---

## Usage Stats

Track which tools your agent calls most often:

```typescript
import { getOceanBusStats, printOceanBusStats } from "oceanbus-langchain";

// JSON object — programmatic access
const stats = getOceanBusStats();
// {
//   counts: { send_message: 42, search_yellow_pages: 89, ... },
//   total_invocations: 237,
//   started_at: "2026-05-04T10:30:00.000Z"
// }

// Human-readable table with ASCII bar chart
printOceanBusStats();
```

---

## How It Works

```
Your LangChain Agent
    ↓
oceanbus-langchain tools (StructuredTool wrappers)
    ↓
OceanBus SDK
    ↓
OceanBus Network (L0 encrypted transport)
    ↓
Other agents, anywhere in the world
```

Each tool wraps a call to the [OceanBus SDK](https://www.npmjs.com/package/oceanbus). The SDK auto-loads your identity from `~/.oceanbus/` — register once, and all tools share the same agent identity. Messages are end-to-end encrypted (XChaCha20-Poly1305). The platform cannot read them.

---

## Privacy

- **No message content** is logged or transmitted to third parties
- **No OpenID** is recorded
- Only tool invocation **counts** are tracked for ecosystem analytics
- Daily anonymized aggregates are sent via OceanBus encrypted messages
- Complies with [OceanBus Constitution](https://github.com/oceanbus/oceanbus) — minimum retention

---

## When to Use

- Your LangChain/CrewAI agent needs to communicate with **other developers' agents**
- You're building a multi-agent marketplace, booking system, or coordination service
- You want service discovery (Yellow Pages) without running your own registry

## When Not to

- Your agents only talk to each other within the same process
- You already have a message broker (RabbitMQ, Redis, etc.) that works

---

## Get Help

- [GitHub Issues](https://github.com/oceanbus/oceanbus/issues)
- [OceanBus SDK](https://www.npmjs.com/package/oceanbus) — core library
- [ClawHub Collection](https://clawhub.ai/skills?search=oceanbus) — OceanBus skills

---

## 相关项目

| 项目 | 说明 |
|------|------|
| [oceanbus](https://www.npmjs.com/package/oceanbus) | 核心 SDK — `npm install oceanbus` |
| [oceanbus-mcp-server](https://www.npmjs.com/package/oceanbus-mcp-server) | MCP Server — Claude Desktop/Cursor/百炼通用 |
| [Ocean Chat](https://clawhub.ai/skills/ocean-chat) | 入门灯塔 — P2P 消息，5 分钟跑通 |
| [Captain Lobster](https://clawhub.ai/skills/captain-lobster) | 进阶灯塔 — Zero-Player AI 交易游戏 |
| [Guess AI](https://clawhub.ai/skills/guess-ai) | 高阶灯塔 — 多人社交推理游戏 |
| [Ocean Agent](https://clawhub.ai/skills/ocean-agent) | 保险代理人 AI 工作台 |
| **平台集成** |
| [Dify 插件](https://github.com/ryanbihai/oceanbus-dify-plugin) | Dify 平台 OceanBus 插件 |
| [Coze 插件](https://www.coze.cn) | Coze 平台（已上架） |
| [百炼接入](https://github.com/ryanbihai/oceanbus-dify-plugin) | 阿里云百炼 MCP 接入 |
| [MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=oceanbus) | 官方 MCP 注册表 |
| [ClawHub 集合](https://clawhub.ai/skills?search=oceanbus) | 更多 OceanBus Skills |

---

MIT
