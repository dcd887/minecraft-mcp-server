/**
 * Minecraft Mod MCP Server - Entry Point
 *
 * 部署后可通过以下地址访问：
 *   https://minecraft-mod-mcp.<你的账户>.workers.dev/mcp
 *
 * 本地测试：
 *   npm start
 *   然后用 MCP Inspector 连接 http://localhost:8788/mcp
 */
import { createLegacyMcpHandler } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env } from "./types";

import { questToolSchemas, handleGenerateQuestChapter, handleGenerateQuestTask, handleGenerateHexId } from "./tools/quest";
import { kubejsToolSchemas, handleGenerateWeapon, handleGenerateArmorSet, handleGenerateShapedRecipe, handleGenerateShapelessRecipe, handleGenerateSmelting, handleGenerateRemoveRecipe } from "./tools/kubejs";
import { validateToolSchemas, handleValidateSnbt, handleCheckKubeJS, handleGenerateTexturePath, handleGenerateChapterGroup, handleGenerateQuestData } from "./tools/validate";

// 所有工具均为纯代码生成/验证，不写入文件系统、不访问网络
const READONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
} as const;

// 确定性工具：相同输入永远产生相同输出
const IDEMPOTENT_ANNOTATIONS = { ...READONLY_ANNOTATIONS, idempotentHint: true } as const;

// 非确定性工具：包含随机ID生成，相同输入可能产生不同输出
const NON_IDEMPOTENT_ANNOTATIONS = { ...READONLY_ANNOTATIONS, idempotentHint: false } as const;

function buildServer(): McpServer {
  const server = new McpServer({
    name: "minecraft-mod-mcp",
    version: "1.0.0",
  });

  // =========================================
  // 1. FTB Quests 任务书工具
  // =========================================

  server.tool(
    "generate_quest_chapter",
    "生成一个完整的 FTB Quests 章节文件（SNBT 格式），包含多个任务、依赖关系和奖励",
    questToolSchemas.generate_quest_chapter.params.shape,
    NON_IDEMPOTENT_ANNOTATIONS,
    async (params) => ({
      content: [{ type: "text", text: JSON.stringify(handleGenerateQuestChapter(params), null, 2) }],
    })
  );

  server.tool(
    "generate_quest_task",
    "生成单个 FTB Quests 任务定义，支持 item/kill/advancement/checklist 四种类型",
    questToolSchemas.generate_quest_task.params.shape,
    NON_IDEMPOTENT_ANNOTATIONS,
    async (params) => ({
      content: [{ type: "text", text: JSON.stringify(handleGenerateQuestTask(params), null, 2) }],
    })
  );

  server.tool(
    "generate_hex_id",
    "生成一个 16 位随机十六进制 ID（用于 FTB Quests 章节/任务 ID）",
    {},
    NON_IDEMPOTENT_ANNOTATIONS,
    async () => ({
      content: [{ type: "text", text: JSON.stringify(handleGenerateHexId()) }],
    })
  );

  server.tool(
    "generate_chapter_group_snbt",
    "生成 chapter_groups.snbt 配置文件，用于定义任务书的分组（主线/支线）",
    validateToolSchemas.generate_chapter_group_snbt.params.shape,
    IDEMPOTENT_ANNOTATIONS,
    async (params) => ({
      content: [{ type: "text", text: handleGenerateChapterGroup(params).content }],
    })
  );

  server.tool(
    "generate_quest_data_snbt",
    "生成 data.snbt 任务书主配置文件，包含标题、图标、进度模式等设置",
    validateToolSchemas.generate_quest_data_snbt.params.shape,
    IDEMPOTENT_ANNOTATIONS,
    async (params) => ({
      content: [{ type: "text", text: handleGenerateQuestData(params).content }],
    })
  );

  // =========================================
  // 2. KubeJS 物品/武器/盔甲生成
  // =========================================

  server.tool(
    "generate_kubejs_weapon",
    "生成 KubeJS 职业武器注册代码，包含攻击力、速度、耐久和技能描述",
    kubejsToolSchemas.generate_kubejs_weapon.params.shape,
    IDEMPOTENT_ANNOTATIONS,
    async (params) => ({
      content: [{ type: "text", text: handleGenerateWeapon(params).code }],
    })
  );

  server.tool(
    "generate_kubejs_armor_set",
    "生成 KubeJS 职业盔甲套装注册代码（含 tier 定义），包含头盔、胸甲、护腿、靴子四件套",
    kubejsToolSchemas.generate_kubejs_armor_set.params.shape,
    IDEMPOTENT_ANNOTATIONS,
    async (params) => ({
      content: [{ type: "text", text: handleGenerateArmorSet(params).code }],
    })
  );

  // =========================================
  // 3. KubeJS 配方生成
  // =========================================

  server.tool(
    "generate_kubejs_shaped_recipe",
    "生成 KubeJS 有序合成配方代码，需要指定 3x3 合成模式和材料映射",
    kubejsToolSchemas.generate_kubejs_shaped_recipe.params.shape,
    IDEMPOTENT_ANNOTATIONS,
    async (params) => ({
      content: [{ type: "text", text: handleGenerateShapedRecipe(params).code }],
    })
  );

  server.tool(
    "generate_kubejs_shapeless_recipe",
    "生成 KubeJS 无序合成配方代码，只需指定材料和产物",
    kubejsToolSchemas.generate_kubejs_shapeless_recipe.params.shape,
    IDEMPOTENT_ANNOTATIONS,
    async (params) => ({
      content: [{ type: "text", text: handleGenerateShapelessRecipe(params).code }],
    })
  );

  server.tool(
    "generate_kubejs_smelting",
    "生成 KubeJS 熔炉/高炉/烟熏炉配方代码",
    kubejsToolSchemas.generate_kubejs_smelting.params.shape,
    IDEMPOTENT_ANNOTATIONS,
    async (params) => ({
      content: [{ type: "text", text: handleGenerateSmelting(params).code }],
    })
  );

  server.tool(
    "generate_kubejs_remove_recipe",
    "生成 KubeJS 移除配方代码，用于覆盖或禁用原版/模组的配方",
    kubejsToolSchemas.generate_kubejs_remove_recipe.params.shape,
    IDEMPOTENT_ANNOTATIONS,
    async (params) => ({
      content: [{ type: "text", text: handleGenerateRemoveRecipe(params).code }],
    })
  );

  // =========================================
  // 4. 验证 & 诊断工具
  // =========================================

  server.tool(
    "validate_snbt",
    "验证 SNBT 文件语法是否正确（检查常见错误如花括号不匹配、Count 格式问题等）",
    validateToolSchemas.validate_snbt.params.shape,
    IDEMPOTENT_ANNOTATIONS,
    async (params) => ({
      content: [{ type: "text", text: JSON.stringify(handleValidateSnbt(params), null, 2) }],
    })
  );

  server.tool(
    "check_kubejs_errors",
    "检查 KubeJS 脚本中的常见错误（废弃 API、Rhino 引擎兼容性问题等）",
    validateToolSchemas.check_kubejs_common_errors.params.shape,
    IDEMPOTENT_ANNOTATIONS,
    async (params) => ({
      content: [{ type: "text", text: JSON.stringify(handleCheckKubeJS(params), null, 2) }],
    })
  );

  server.tool(
    "generate_item_texture_path",
    "生成 KubeJS 物品/盔甲纹理路径指南，帮助正确放置纹理文件",
    validateToolSchemas.generate_item_texture_path.params.shape,
    IDEMPOTENT_ANNOTATIONS,
    async (params) => ({
      content: [{ type: "text", text: JSON.stringify(handleGenerateTexturePath(params), null, 2) }],
    })
  );

  return server;
}

const server = buildServer();
const mcpHandler = createLegacyMcpHandler(server, { route: "/mcp" });

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.pathname === "/mcp") {
      return mcpHandler(request, env, ctx);
    }
    return new Response(
      JSON.stringify({
        name: "Minecraft Mod MCP Server",
        version: "1.0.0",
        status: "running",
        endpoint: "/mcp (Streamable HTTP)",
        tools: [
          "generate_quest_chapter",
          "generate_quest_task",
          "generate_hex_id",
          "generate_chapter_group_snbt",
          "generate_quest_data_snbt",
          "generate_kubejs_weapon",
          "generate_kubejs_armor_set",
          "generate_kubejs_shaped_recipe",
          "generate_kubejs_shapeless_recipe",
          "generate_kubejs_smelting",
          "generate_kubejs_remove_recipe",
          "validate_snbt",
          "check_kubejs_errors",
          "generate_item_texture_path",
        ],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  },
};
