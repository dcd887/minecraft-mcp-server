/**
 * Minecraft 整合包验证工具
 * 提供 SNBT 语法检查、KubeJS 常见问题检测等功能
 */
import { z } from "zod";

export const validateToolSchemas = {
  validate_snbt: {
    description: "验证 SNBT 文件语法是否正确（检查常见错误）",
    params: z.object({
      snbt_content: z.string().describe("SNBT 文件内容"),
    }),
  },

  check_kubejs_common_errors: {
    description: "检查 KubeJS 脚本中的常见错误",
    params: z.object({
      script_content: z.string().describe("KubeJS 脚本内容"),
    }),
  },

  generate_item_texture_path: {
    description: "生成 KubeJS 物品纹理路径指南",
    params: z.object({
      item_name: z.string().describe("物品注册名（如：warrior_greatsword）"),
      item_type: z.enum(["item", "weapon", "armor_helm", "armor_chest", "armor_legs", "armor_boots"]).describe("物品类型"),
    }),
  },

  generate_chapter_group_snbt: {
    description: "生成 chapter_groups.snbt 配置文件",
    params: z.object({
      groups: z.array(z.object({
        id: z.string().describe("分组 ID（16位十六进制）"),
        title: z.string().describe("分组标题（支持 § 颜色代码，如 &l&c☆主线☆）"),
      })).describe("分组列表"),
    }),
  },

  generate_quest_data_snbt: {
    description: "生成 data.snbt 任务书主配置文件",
    params: z.object({
      title: z.string().describe("任务书标题（如 &l&c☆战斗之章☆）"),
      icon: z.string().describe("图标物品 ID（如 minecraft:nether_star）"),
      quest_shape: z.string().default("rsquare").describe("默认任务形状"),
      progression_mode: z.enum(["linear", "flexible", "skill"]).default("linear").describe("进度模式"),
      show_lock_icons: z.boolean().default(true).describe("是否显示锁定图标"),
    }),
  },
};

export function handleValidateSnbt(params: z.infer<typeof validateToolSchemas.validate_snbt.params>) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const content = params.snbt_content;

  // 检查常见 SNBT 语法错误
  if (content.includes("',{")) {
    errors.push("发现 '{\" 错误：JSON 风格的逗号+花括号，应使用 SNBT 格式");
  }
  if (content.includes(",\n")) {
    // Check for trailing commas in arrays
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.endsWith(',') && (trimmed.startsWith('"') || trimmed.match(/^\d/))) {
        // This is fine for SNBT, but warn about unnecessary trailing commas
      }
    });
  }

  // 检查 Count: Xb 格式（X>=128 的问题）
  const countMatches = content.match(/Count:\s*(\d+)b/g);
  if (countMatches) {
    countMatches.forEach(m => {
      const num = parseInt(m.match(/\d+/)?.[0] || "0");
      if (num >= 128) {
        warnings.push(`发现 ${m}：Count >= 128 时使用 'b' 后缀可能导致 FTB Quests 解析失败，建议改为 Count: ${num}`);
      }
    });
  }

  // 检查 id 格式
  if (!content.includes('id:') && !content.includes('"id":')) {
    warnings.push("未找到任何 id 字段，SNBT 可能缺少必要字段");
  }

  // 检查 type 字段
  const typeMatches = content.match(/type:\s*"(\w+)"/g);
  if (typeMatches) {
    typeMatches.forEach(t => {
      const typeName = t.match(/"(\w+)"/)?.[1] || "";
      if (typeName === "custom") {
        warnings.push("发现 type: 'custom'，FTB Quests 2001.x 已移除该类型，建议改用 item/checklist");
      }
    });
  }

  // 检查大括号配对
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`花括号不匹配：{ 出现 ${openBraces} 次，} 出现 ${closeBraces} 次`);
  }

  // 检查中括号配对
  const openBrackets = (content.match(/\[/g) || []).length;
  const closeBrackets = (content.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push(`中括号不匹配：[ 出现 ${openBrackets} 次，] 出现 ${closeBrackets} 次`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: errors.length > 0
      ? `发现 ${errors.length} 个错误，${warnings.length} 个警告`
      : warnings.length > 0
        ? `语法正确，但有 ${warnings.length} 个警告`
        : "语法检查通过",
  };
}

export function handleCheckKubeJS(params: z.infer<typeof validateToolSchemas.check_kubejs_common_errors.params>) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const content = params.script_content;

  // 检查废弃的 onEvent 语法
  if (content.includes("onEvent(")) {
    if (content.includes("onEvent('command.registry'")) {
      errors.push("使用已废弃的 onEvent('command.registry')，应改用 ServerEvents.commandRegistry");
    }
    if (content.includes("onEvent('item.registry'")) {
      errors.push("使用已废弃的 onEvent('item.registry')，应改用 StartupEvents.registry('item')");
    }
    if (content.includes("onEvent('recipes'")) {
      warnings.push("使用 onEvent('recipes') 建议改用 ServerEvents.recipes");
    }
  }

  // 检查 armorTexture 方法
  if (content.includes(".armorTexture(")) {
    errors.push("KubeJS 2001.6.5 没有 armorTexture() 方法，应使用 tier.name 设置纹理名");
  }

  // 检查 const 在循环中的使用
  if (content.includes("for (const ")) {
    warnings.push("Rhino 引擎可能不支持 for...of 循环，建议改用 for (var i = 0; i < n; i++)");
  }

  // 检查 getSlot 用法
  if (content.includes("getSlot(")) {
    errors.push("player.inventory.getSlot(i) 无效，应改用 player.inventory.get(i)");
  }

  // 检查 Arguments.INTEGER
  if (content.includes("Arguments.INTEGER") || content.includes("IntegerArgumentType")) {
    errors.push("使用 Arguments.INTEGER 可能导致类型兼容问题，建议改用子命令方式（Commands.literal('1')）");
  }

  // 检查 var 重复声明
  const varMatches = content.match(/var\s+(\w+)/g);
  if (varMatches) {
    const varNames = varMatches.map(v => v.replace("var ", ""));
    const duplicates = varNames.filter((name, i) => varNames.indexOf(name) !== i);
    if (duplicates.length > 0) {
      warnings.push(`发现重复 var 声明：${[...new Set(duplicates)].join(", ")}，可能导致 Rhino 重声明错误`);
    }
  }

  // 检查 playSound 可能的方法歧义
  if (content.includes("playSound(") && !content.includes("player.level.playSound(player,")) {
    const playSoundLines = content.split('\n').filter(l => l.includes('playSound('));
    playSoundLines.forEach(line => {
      if (!line.includes('player.level.playSound(player')) {
        warnings.push("playSound 调用可能缺少 player 对象作为第一个参数，导致方法重载歧义");
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: errors.length > 0
      ? `发现 ${errors.length} 个错误，${warnings.length} 个警告`
      : warnings.length > 0
        ? `脚本无明显错误，但有 ${warnings.length} 个警告建议处理`
        : "脚本检查通过，未发现常见问题",
  };
}

export function handleGenerateTexturePath(params: z.infer<typeof validateToolSchemas.generate_item_texture_path.params>) {
  const paths: Record<string, string> = {};

  switch (params.item_type) {
    case "item":
    case "weapon":
      paths.inventory_texture = `assets/kubejs/textures/item/${params.item_name}.png`;
      paths.inventory_texture_size = "16x16 像素";
      paths.code = `.texture('kubejs:item/${params.item_name}')`;
      break;
    case "armor_helm":
    case "armor_chest":
    case "armor_legs":
    case "armor_boots":
      // 通过 tier.name 共享纹理
      const tierName = params.item_name.replace(/(helm|chest|legs|boots)$/, "").replace(/_$/, "");
      paths.worn_layer1 = `assets/kubejs/textures/models/armor/${tierName}_layer_1.png (64x32 像素)`;
      paths.worn_layer2 = `assets/kubejs/textures/models/armor/${tierName}_layer_2.png (64x32 像素)`;
      paths.inventory_texture = `assets/kubejs/textures/item/${params.item_name}.png (16x16 像素)`;
      paths.code = `tier.name = '${tierName}'  // 在 modifyTier 回调中设置`;
      paths.note = `所有 ${tierName} 系列盔甲共享同一套穿戴纹理，tier.name 必须一致`;
      break;
  }

  return {
    paths,
    summary: `纹理路径已生成，将纹理文件放在对应目录即可`,
  };
}

export function handleGenerateChapterGroup(params: z.infer<typeof validateToolSchemas.generate_chapter_group_snbt.params>) {
  const groups = params.groups.map(g => `\t\t{ id: "${g.id}", title: "${g.title}" }`);
  const content = `{\n\tchapter_groups: [\n${groups.join('\n')}\n\t]\n}`;

  return {
    content,
    filename: "chapter_groups.snbt",
  };
}

export function handleGenerateQuestData(params: z.infer<typeof validateToolSchemas.generate_quest_data_snbt.params>) {
  const content = `{\n\tdefault_autoclaim_rewards: "disabled"\n\tdefault_consume_items: false\n\tdefault_quest_disable_jei: false\n\tdefault_quest_shape: "${params.quest_shape}"\n\tdefault_reward_team: false\n\tdetection_delay: 20\n\tdisable_gui: false\n\tdrop_book_on_death: false\n\tdrop_loot_crates: false\n\ticon: "${params.icon}"\n\tlock_message: ""\n\tloot_crate_no_drop: {\n\t\tboss: 0\n\t\tmonster: 600\n\t\tpassive: 4000\n\t}\n\tpause_game: false\n\tprogression_mode: "${params.progression_mode}"\n\tshow_lock_icons: ${params.show_lock_icons}\n\ttitle: "${params.title}"\n\tversion: 13\n}`;

  return {
    content,
    filename: "data.snbt",
    fields: {
      title: params.title,
      icon: params.icon,
      shape: params.quest_shape,
      progression: params.progression_mode,
      show_lock_icons: params.show_lock_icons,
    },
  };
}