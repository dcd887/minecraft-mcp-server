/**
 * FTB Quests 任务书工具
 * 提供任务书章节、任务、奖励的生成功能
 */
import { z } from "zod";
import {
  generateChapterSnbt,
  generateHexId,
  QuestChapter,
  QuestEntry,
  QuestTask,
  QuestReward,
} from "../templates/quest_chapter";

// 武器类型定义（对应 CLASS_WEAPON_OPTIONS）
export const questToolSchemas = {
  generate_quest_chapter: {
    description: "生成一个完整的 FTB Quests 章节文件（SNBT 格式）",
    params: z.object({
      title: z.string().describe("章节标题（如：初入世间）"),
      group_id: z.string().describe("章节分组 ID（如：723AE4EA49A6043A）"),
      icon: z.string().describe("章节图标物品 ID（如：minecraft:writable_book）"),
      order_index: z.number().int().min(0).describe("章节排序索引"),
      filename: z.string().describe("文件名（如：00_prologue）"),
      quest_count: z.number().int().min(1).max(20).describe("要生成的任务数量"),
      stage_key: z.string().optional().describe("阶段 key（如 s1_complete），用于最终任务奖励"),
    }),
  },

  generate_quest_task: {
    description: "生成单个任务定义（SNBT 格式片段）",
    params: z.object({
      title: z.string().describe("任务标题"),
      description: z.string().describe("任务描述（支持 § 颜色代码）"),
      icon: z.string().describe("任务图标物品 ID"),
      task_type: z.enum(["item", "kill", "advancement", "checklist"]).describe("任务类型"),
      target_item: z.string().optional().describe("提交物品 ID（item 类型用）"),
      target_count: z.number().int().optional().describe("需要数量"),
      target_entity: z.string().optional().describe("击杀实体 ID（kill 类型用）"),
      target_advancement: z.string().optional().describe("进度 ID（advancement 类型用）"),
      reward_items: z.string().optional().describe("奖励物品（逗号分隔的 item:count 格式）"),
      x: z.number().optional().default(0).describe("任务在章节中的 X 坐标"),
      y: z.number().optional().default(0).describe("任务在章节中的 Y 坐标"),
      dependencies: z.string().optional().describe("前置任务 ID（逗号分隔）"),
    }),
  },

  generate_hex_id: {
    description: "生成一个 16 位随机十六进制 ID（用于 FTB Quests 章节/任务 ID）",
    params: z.object({}).describe("无需参数"),
  },
};

export function handleGenerateQuestChapter(params: z.infer<typeof questToolSchemas.generate_quest_chapter.params>) {
  const chapterId = generateHexId();
  const quests: QuestEntry[] = [];

  for (let i = 0; i < params.quest_count; i++) {
    const questId = generateHexId();
    const taskId = generateHexId();
    const rewardId = generateHexId();
    const isLast = i === params.quest_count - 1;

    const tasks: QuestTask[] = [{
      id: taskId,
      type: "item" as const,
      item: "minecraft:stick",
      count: 1,
    }];

    const rewards: QuestReward[] = [{
      id: rewardId,
      type: "item" as const,
      item: "minecraft:bread",
      count: 1,
    }];

    // 如果是最后一个任务且提供了 stage_key，添加阶段奖励
    if (isLast && params.stage_key) {
      const stageRewardId = generateHexId();
      rewards.push({
        id: stageRewardId,
        type: "stage" as const,
        stage: params.stage_key,
      });
    }

    quests.push({
      id: questId,
      icon: "minecraft:paper",
      title: `${params.title} - 任务 ${i + 1}`,
      description: ["请完成此任务以推进章节进度。"],
      dependencies: i > 0 ? [quests[i - 1].id] : [],
      dependency_requirement: "all_completed",
      x: (i % 5) * 2.0,
      y: Math.floor(i / 5) * 2.0,
      shape: "hexagon",
      tasks,
      rewards,
    });
  }

  const chapter: QuestChapter = {
    id: chapterId,
    group: params.group_id,
    filename: params.filename,
    order_index: params.order_index,
    icon: params.icon,
    default_quest_shape: "hexagon",
    default_hide_dependency_lines: false,
    quests,
    quest_links: [],
  };

  return {
    chapter_id: chapterId,
    filename: `${params.filename}.snbt`,
    content: generateChapterSnbt(chapter),
    quest_count: quests.length,
    quest_ids: quests.map(q => q.id),
  };
}

export function handleGenerateQuestTask(params: z.infer<typeof questToolSchemas.generate_quest_task.params>) {
  const taskId = generateHexId();
  const rewardId = generateHexId();

  let taskType: "item" | "kill" | "advancement" | "checklist" = params.task_type;

  const task: QuestTask = {
    id: taskId,
    type: taskType,
  };

  switch (taskType) {
    case "item":
      task.item = params.target_item || "minecraft:stick";
      task.count = params.target_count || 1;
      break;
    case "kill":
      task.entity = params.target_entity || "minecraft:zombie";
      task.count = params.target_count || 1;
      break;
    case "advancement":
      task.advancement = params.target_advancement || "minecraft:story/root";
      break;
    case "checklist":
      task.title = params.title;
      task.icon = params.icon;
      break;
  }

  const rewards: QuestReward[] = [{
    id: rewardId,
    type: "item" as const,
    item: "minecraft:bread",
    count: 1,
  }];

  // 解析奖励物品
  if (params.reward_items) {
    rewards.length = 0;
    params.reward_items.split(",").forEach(itemStr => {
      const parts = itemStr.trim().split(":");
      if (parts.length >= 2) {
        const itemId = parts.slice(0, -1).join(":") || "minecraft:stick";
        const count = parseInt(parts[parts.length - 1]) || 1;
        rewards.push({
          id: generateHexId(),
          type: "item" as const,
          item: itemId,
          count,
        });
      }
    });
  }

  const quest: QuestEntry = {
    id: generateHexId(),
    icon: params.icon,
    title: params.title,
    description: params.description.split("\n"),
    dependencies: params.dependencies ? params.dependencies.split(",").map(d => d.trim()) : [],
    dependency_requirement: "all_completed",
    x: params.x || 0,
    y: params.y || 0,
    shape: "hexagon",
    tasks: [task],
    rewards,
  };

  return {
    quest_id: quest.id,
    task_id: taskId,
    reward_id: rewardId,
    snbt_fragment: JSON.stringify(quest, null, 2),
  };
}

export function handleGenerateHexId() {
  return { id: generateHexId() };
}