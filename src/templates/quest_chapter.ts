/**
 * FTB Quests 章节模板生成器
 * 生成符合 KubeJS 2001.6.5 / FTB Quests 2001.4.22 规范的 SNBT 章节文件
 */

export interface QuestChapter {
  id: string;
  group: string;
  filename: string;
  order_index: number;
  icon: string;
  default_quest_shape: string;
  default_hide_dependency_lines: boolean;
  quests: QuestEntry[];
  quest_links: string[];
}

export interface QuestEntry {
  id: string;
  icon: string;
  title: string;
  description: string[];
  dependencies: string[];
  dependency_requirement: string;
  x: number;
  y: number;
  shape: string;
  tasks: QuestTask[];
  rewards: QuestReward[];
}

export interface QuestTask {
  id: string;
  type: "item" | "kill" | "location" | "advancement" | "checklist";
  title?: string;
  icon?: string;
  item?: string;
  count?: number;
  entity?: string;
  advancement?: string;
}

export interface QuestReward {
  id: string;
  type: "item" | "random" | "command" | "xp" | "stage";
  item?: string;
  count?: number;
  table_id?: string;
  command?: string;
  xp?: number;
  stage?: string;
}

/**
 * 生成一个完整的 SNBT 章节文件内容
 */
export function generateChapterSnbt(chapter: QuestChapter): string {
  const questsSnbt = chapter.quests.map(q => generateQuestSnbt(q, chapter.id)).join('\n');

  return `{
\tdefault_hide_dependency_lines: ${chapter.default_hide_dependency_lines}
\tdefault_quest_shape: "${chapter.default_quest_shape}"
\tfilename: "${chapter.filename}"
\tgroup: "${chapter.group}"
\ticon: "${chapter.icon}"
\tid: "${chapter.id}"
\torder_index: ${chapter.order_index}
\tquest_links: [${chapter.quest_links.length > 0 ? '\n\t\t' + chapter.quest_links.map(l => `"${l}"`).join('\n\t\t') + '\n\t' : ' '}]
\tquests: [${questsSnbt ? '\n' + questsSnbt + '\n\t' : ''}]
}`;
}

/**
 * 生成单个任务的 SNBT 内容
 */
export function generateQuestSnbt(quest: QuestEntry, _chapterId: string): string {
  const tasksSnbt = quest.tasks.map(t => generateTaskSnbt(t)).join('\n');
  const rewardsSnbt = quest.rewards.map(r => generateRewardSnbt(r)).join('\n');

  const depsSnbt = quest.dependencies.length > 0
    ? quest.dependencies.map(d => `\t\t\t\t"${d}"`).join('\n')
    : '';

  return `\t\t{
\t\t\tdependencies: [${depsSnbt ? '\n' + depsSnbt + '\n\t\t\t' : ' '}]
\t\t\tdependency_requirement: "${quest.dependency_requirement}"
\t\t\tdescription: [${quest.description.map(d => `\n\t\t\t\t"${escapeSnbtString(d)}"`).join('') + '\n\t\t\t'}]
\t\t\ticon: "${quest.icon}"
\t\t\tid: "${quest.id}"
\t\t\tquest_shape: "${quest.shape}"
\t\t\trewards: [${rewardsSnbt ? '\n' + rewardsSnbt + '\n\t\t\t' : ' '}]
\t\t\ttasks: [${tasksSnbt ? '\n' + tasksSnbt + '\n\t\t\t' : ' '}]
\t\t\ttitle: "${escapeSnbtString(quest.title)}"
\t\t\tx: ${quest.x.toFixed(0)}d
\t\t\ty: ${quest.y.toFixed(0)}d
\t\t}`;
}

/**
 * 生成单个任务的 SNBT 内容
 */
export function generateTaskSnbt(task: QuestTask): string {
  switch (task.type) {
    case 'item':
      return `\t\t\t\t{
\t\t\t\t\tid: "${task.id}"
\t\t\t\t\titem: { Count: ${task.count || 1}b, id: "${task.item || 'minecraft:stick'}" }
\t\t\t\t\ttype: "item"
\t\t\t\t}`;
    case 'kill':
      return `\t\t\t\t{
\t\t\t\t\tid: "${task.id}"
\t\t\t\t\tentity: "${task.entity || 'minecraft:zombie'}"
\t\t\t\t\tcount: ${task.count || 1}
\t\t\t\t\ttype: "kill"
\t\t\t\t}`;
    case 'location':
      return `\t\t\t\t{
\t\t\t\t\tid: "${task.id}"
\t\t\t\t\ttype: "location"
\t\t\t\t\tdimension: "${task.item || 'minecraft:overworld'}"
\t\t\t\t\tx: 0
\t\t\t\t\ty: 0
\t\t\t\t\tz: 0
\t\t\t\t}`;
    case 'advancement':
      return `\t\t\t\t{
\t\t\t\t\tid: "${task.id}"
\t\t\t\t\tadvancement: "${task.advancement || 'minecraft:story/root'}"
\t\t\t\t\ttype: "advancement"
\t\t\t\t}`;
    case 'checklist':
      return `\t\t\t\t{
\t\t\t\t\tid: "${task.id}"
\t\t\t\t\ttitle: "${escapeSnbtString(task.title || 'Checklist')}"
\t\t\t\t\ticon: "${task.icon || 'minecraft:paper'}"
\t\t\t\t\ttype: "checklist"
\t\t\t\t}`;
    default:
      return `\t\t\t\t{
\t\t\t\t\tid: "${task.id}"
\t\t\t\t\ttype: "checklist"
\t\t\t\t\ttitle: "${escapeSnbtString(task.title || 'Task')}"
\t\t\t\t}`;
  }
}

/**
 * 生成奖励的 SNBT 内容
 */
export function generateRewardSnbt(reward: QuestReward): string {
  switch (reward.type) {
    case 'item':
      return `\t\t\t\t{
\t\t\t\t\tid: "${reward.id}"
\t\t\t\t\titem: { Count: ${reward.count || 1}b, id: "${reward.item || 'minecraft:stick'}" }
\t\t\t\t\ttype: "item"
\t\t\t\t}`;
    case 'random':
      return `\t\t\t\t{
\t\t\t\t\tid: "${reward.id}"
\t\t\t\t\ttable_id: ${reward.table_id || '0'}L
\t\t\t\t\ttype: "random"
\t\t\t\t}`;
    case 'command':
      return `\t\t\t\t{
\t\t\t\t\tid: "${reward.id}"
\t\t\t\t\tcommand: "${escapeSnbtString(reward.command || 'say reward')}"
\t\t\t\t\ttype: "command"
\t\t\t\t}`;
    case 'xp':
      return `\t\t\t\t{
\t\t\t\t\tid: "${reward.id}"
\t\t\t\t\ttype: "xp"
\t\t\t\t\txp: ${reward.xp || 100}
\t\t\t\t}`;
    case 'stage':
      return `\t\t\t\t{
\t\t\t\t\tid: "${reward.id}"
\t\t\t\t\tcommand: "/kubejs stage add @s ${reward.stage || 'stage_complete'}"
\t\t\t\t\ttype: "command"
\t\t\t\t}`;
    default:
      return `\t\t\t\t{
\t\t\t\t\tid: "${reward.id}"
\t\t\t\t\titem: { Count: 1b, id: "minecraft:stick" }
\t\t\t\t\ttype: "item"
\t\t\t\t}`;
  }
}

/**
 * 生成随机十六进制 ID（16位）
 */
export function generateHexId(): string {
  const chars = '0123456789ABCDEF';
  let id = '';
  for (let i = 0; i < 16; i++) {
    id += chars[Math.floor(Math.random() * 16)];
  }
  return id;
}

/**
 * 转义 SNBT 字符串中的特殊字符
 */
function escapeSnbtString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}