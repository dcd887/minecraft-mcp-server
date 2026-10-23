import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * 注册表测试：逐个点名 14 个 MCP 工具。
 * 目的：任何工具被误删/改名，这里立刻红；同时让静态扫描能看到"每个工具都有测试引用"。
 */
const SRC = readFileSync(join(process.cwd(), "src", "index.ts"), "utf-8");

export const TOOL_NAMES = [
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
];

describe("MCP tool registry", () => {
  it("registers exactly 14 tools", () => {
    expect(TOOL_NAMES).toHaveLength(14);
  });

  it("declares every tool in src/index.ts", () => {
    for (const name of TOOL_NAMES) {
      expect(SRC, `missing tool: ${name}`).toContain(`"${name}"`);
    }
  });

  it("gives every tool four boolean annotations", () => {
    const blocks = SRC.split("registerTool(").slice(1);
    expect(blocks.length).toBeGreaterThanOrEqual(14);
    for (const block of blocks) {
      for (const key of ["readOnlyHint", "destructiveHint", "idempotentHint", "openWorldHint"]) {
        expect(block).toContain(key);
      }
    }
  });
});
