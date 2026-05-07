/**
 * OceanBus LangChain Tools
 *
 * 这些工具把 OceanBus 的能力包装成 LangChain 标准格式。
 * 开发者在 LangChain/CrewAI 代码里导入后，
 * 他们的 AI Agent 就能直接发消息、搜黄页、查声誉。
 *
 * 用法示例：
 *
 *   import { ChatOpenAI } from "@langchain/openai";
 *   import { AgentExecutor, createToolCallingAgent } from "langchain";
 *   import {
 *     oceanbusSendTool,
 *     oceanbusDiscoverTool,
 *   } from "oceanbus-langchain";
 *
 *   const agent = createToolCallingAgent({
 *     llm: new ChatOpenAI({ model: "gpt-4" }),
 *     tools: [oceanbusSendTool, oceanbusDiscoverTool],
 *     prompt: chatPrompt,
 *   });
 */

import { tool, type StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { createOceanBus, type OceanBus } from "oceanbus";
import { getTelemetry } from "./telemetry.js";

const TELEMETRY_OPENID = "2jrPWgSoWdJ8veJgChcooDhlmEx0SYok8G50sHpk_gZLLbVmv83Ya9G3CRp3Uzguw8YwEn-o8nQzqOqW";

const telem = getTelemetry({
  reportOpenid: TELEMETRY_OPENID,
  source: "langchain",
  reportHour: 23,
});

// ============================================================
// 共享的 OceanBus 实例
// ============================================================
// 懒加载单例——第一次用到 OceanBus 时才初始化

let _ob: OceanBus | null = null;
let _lastSeq = 0;  // 信箱游标，每次 sync 后更新

async function getOB(): Promise<OceanBus> {
  if (!_ob) {
    _ob = await createOceanBus();
    try {
      const info = await _ob.whoami();
      telem.setOceanBus(_ob, info.agent_id);
    } catch {
      telem.setOceanBus(_ob);
    }
  }
  return _ob;
}

// ============================================================
// 工具1：发送消息
// ============================================================

export const oceanbusSendTool = tool(
  async ({ to_openid, content }) => {
    telem.record("send_message");
    try {
      const ob = await getOB();
      await ob.send(to_openid, content);
      return JSON.stringify({
        success: true,
        message: "消息已通过 OceanBus L0 加密路由发送成功",
      });
    } catch (error: any) {
      return JSON.stringify({ success: false, error: error.message });
    }
  },
  {
    name: "oceanbus_send",
    description:
      "给另一个 AI Agent 发送消息。需要对方的 OpenID 地址。消息内容端到端加密。",
    schema: z.object({
      to_openid: z.string().describe("目标 Agent 的公开地址（OpenID）"),
      content: z.string().describe("要发送的消息内容"),
    }),
  }
);

// ============================================================
// 工具2：搜索黄页
// ============================================================

export const oceanbusDiscoverTool = tool(
  async ({ tags, limit = 20 }) => {
    telem.record("search_yellow_pages");
    try {
      const ob = await getOB();
      const result = await ob.l1.yellowPages.discover(tags || [], limit);
      const data = result.data as any;
      return JSON.stringify({
        success: true,
        total: data.total,
        entries: (data.entries || []).map((e: any) => ({
          openid: e.openid,
          tags: e.tags,
          description: e.description,
          last_heartbeat: e.last_heartbeat,
        })),
        next_cursor: data.next_cursor,
      });
    } catch (error: any) {
      return JSON.stringify({ success: false, error: error.message });
    }
  },
  {
    name: "oceanbus_discover",
    description:
      "搜索 OceanBus 黄页，发现提供特定服务的 AI Agent。" +
      "例如搜 ['insurance', 'health'] 能找到保险和健康相关的 Agent。" +
      "返回 Agent 的公开地址、标签、描述和最后在线时间。",
    schema: z.object({
      tags: z
        .array(z.string())
        .describe("搜索标签，如 ['insurance', 'beijing']"),
      limit: z
        .number()
        .optional()
        .default(20)
        .describe("返回数量上限"),
    }),
  }
);

// ============================================================
// 工具3：查询声誉 [等待 L1 声誉服务部署]
// ============================================================
export const oceanbusReputationTool = tool(
  async ({ openids }) => {
    try {
      const ob = await getOB();
      const result = await ob.l1.reputation.queryReputation(openids);
      return JSON.stringify({
        success: true,
        results: result.data?.results,
        note: "这些是原始信号，不是评分。请综合标签计数、标记者画像等多维信息自行判断。",
      });
    } catch (error: any) {
      return JSON.stringify({ success: false, error: error.message });
    }
  },
  {
    name: "oceanbus_query_reputation",
    description:
      "查询 Agent 的声誉数据。返回可靠/骚扰/违法等标签的分布，" +
      "以及标记者画像。不返回评分——AI 需要自行判断。",
    schema: z.object({
      openids: z
        .array(z.string())
        .describe("要查询的 Agent 的 OpenID 列表，一次最多100个"),
    }),
  }
);

// ============================================================
// 工具4：获取自己的 OpenID
// ============================================================

export const oceanbusGetOpenIdTool = tool(
  async () => {
    telem.record("get_openid");
    try {
      const ob = await getOB();
      const openid = await ob.getOpenId();
      return JSON.stringify({
        success: true,
        openid: openid,
        note: "这是你的公开地址。分享给其他 Agent 就能收到他们的消息。",
      });
    } catch (error: any) {
      return JSON.stringify({ success: false, error: error.message });
    }
  },
  {
    name: "oceanbus_get_openid",
    description: "获取你自己的 OceanBus 公开地址（OpenID）。其他 Agent 可以通过这个地址给你发消息。",
  }
);

// ============================================================
// 工具5：注册到黄页
// ============================================================

export const oceanbusPublishTool = tool(
  async ({ tags, description }) => {
    telem.record("publish_to_yellow_pages");
    try {
      const ob = await getOB();
      const result = await ob.publish({ tags, description, autoHeartbeat: true });
      return JSON.stringify({
        success: true,
        registered_at: result.registered_at,
        message: "黄页注册成功！你的 Agent 现在可以被搜索到了。",
      });
    } catch (error: any) {
      return JSON.stringify({ success: false, error: error.message });
    }
  },
  {
    name: "oceanbus_publish",
    description:
      "把你的 Agent 注册到 OceanBus 黄页。注册后其他 Agent 搜索时就可能找到你。" +
      "tags 是服务标签如 ['insurance', 'beijing']，description 是自然语言描述（上限800字符）。",
    schema: z.object({
      tags: z
        .array(z.string())
        .describe("服务标签，如 ['insurance', 'health']"),
      description: z
        .string()
        .describe("服务描述，AI 会从中理解你的服务内容"),
    }),
  }
);

// ============================================================
// 工具6：检查收件箱
// ============================================================

export const oceanbusCheckMailboxTool = tool(
  async () => {
    telem.record("check_mailbox");
    try {
      const ob = await getOB();
      const messages = await ob.sync(_lastSeq, 10);
      if (messages.length > 0) {
        _lastSeq = Math.max(...messages.map((m: any) => m.seq_id));
      }
      return JSON.stringify({
        success: true,
        last_seq: _lastSeq,
        count: messages.length,
        messages: messages.map((m: any) => ({
          from: m.from_openid,
          content: m.content,
          received_at: m.created_at,
        })),
      });
    } catch (error: any) {
      return JSON.stringify({ success: false, error: error.message });
    }
  },
  {
    name: "oceanbus_check_mailbox",
    description: "检查你的 OceanBus 收件箱，获取新消息。",
  }
);

// ============================================================
// 便捷导出：所有工具打包在一起
// ============================================================

export const oceanbusTools: StructuredTool[] = [
  oceanbusSendTool,
  oceanbusDiscoverTool,
  oceanbusReputationTool,
  oceanbusGetOpenIdTool,
  oceanbusPublishTool,
  oceanbusCheckMailboxTool,
];
