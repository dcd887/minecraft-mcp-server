---
name: "minecraft-mod-mcp-helper"
description: "Minecraft Modpack 开发助手：生成 FTB Quests 任务书、KubeJS 武器/盔甲/配方代码、验证 SNBT 和 KubeJS 脚本。Invoke when user says '生成任务书', '生成 KubeJS 武器', '验证 SNBT', '生成合成配方', 'FTB Quests', 'KubeJS item', 'crafting recipe', or wants to generate mod content for Minecraft 1.20.1."
---

# Minecraft Mod MCP Helper

Minecraft 整合包开发助手，覆盖 FTB Quests 任务书生成、KubeJS 物品/武器/盔甲/配方生成、SNBT/KubeJS 验证四大核心工作流。

---

## When To Use

在以下情况时主动执行本 skill：
- 用户需要生成 FTB Quests 任务书章节（`generate_quest_chapter`）
- 用户需要生成单个任务（`generate_quest_task`）
- 用户需要生成武器/盔甲的 KubeJS 注册代码（`generate_kubejs_weapon` / `generate_kubejs_armor_set`）
- 用户需要生成合成/熔炼/移除配方（`generate_kubejs_shaped_recipe` / `generate_kubejs_smelting` / `generate_kubejs_remove_recipe`）
- 用户需要验证 SNBT 语法正确性（`validate_snbt`）
- 用户需要检查 KubeJS 脚本中的常见问题（`check_kubejs_errors`）
- 用户需要生成纹理路径指南（`generate_item_texture_path`）

---

## Inputs

| 输入 | 说明 | 来源 |
|---|---|---|
| `title` | 章节/任务标题 | 用户指定 |
| `group_id` | 章节分组 ID（16位十六进制） | 自动生成或用户提供 |
| `icon` | 图标物品 ID（如 `minecraft:writable_book`） | 用户提供 |
| `quest_count` | 任务数量（1-20） | 用户提供 |
| `filename` | 文件名（如 `00_prologue`） | 用户提供 |
| `item_name` | 物品注册名（如 `warrior_sword`） | 用户提供 |
| `item_type` | 类型：`item` / `weapon` / `armor_helm` 等 | 用户提供 |
| `snbt_content` | SNBT 文件内容 | 用户粘贴或文件读取 |
| `script_content` | KubeJS 脚本内容 | 用户粘贴或文件读取 |

---

## Workflow

### Phase 1 — FTB Quests 任务书生成

#### 步骤 1：生成章节 ID 和分组

调用 `generate_hex_id` 生成 16 位随机十六进制 ID：
```json
{}
```
返回 `{ "id": "A1B2C3D4E5F6G7H8" }`。

调用 `generate_chapter_group_snbt` 生成章节分组配置：
```json
{
  "groups": [
    { "id": "MAIN000000000001", "title": "§l&6主线任务" },
    { "id": "SIDE000000000001", "title": "§l&a支线任务" }
  ]
}
```

#### 步骤 2：生成章节内容

调用 `generate_quest_chapter` 生成完整章节：
```json
{
  "title": "初入世间",
  "group_id": "723AE4EA49A6043A",
  "icon": "minecraft:writable_book",
  "order_index": 0,
  "filename": "00_prologue",
  "quest_count": 3
}
```

返回结构：
```json
{
  "chapter_id": "A1B2C3D4E5F6G7H8",
  "filename": "00_prologue.snbt",
  "content": "{ ... SNBT 内容 ... }",
  "quest_count": 3,
  "quest_ids": ["id1", "id2", "id3"]
}
```

#### 步骤 3：生成单个任务（可选）

调用 `generate_quest_task` 生成单独任务定义：
```json
{
  "title": "收集钻石",
  "description": "获得 5 个钻石",
  "icon": "minecraft:diamond",
  "task_type": "item",
  "target_item": "minecraft:diamond",
  "target_count": 5,
  "x": 0,
  "y": 0
}
```

支持的任务类型：`item` / `kill` / `advancement` / `checklist`

---

### Phase 2 — KubeJS 物品/武器/盔甲生成

#### 步骤 1：生成职业武器

调用 `generate_kubejs_weapon`：
```json
{
  "name": "warrior_greatsword",
  "display_name": "巨剑",
  "class_type": "warrior",
  "attack_damage": 10,
  "attack_speed": -3.2,
  "max_damage": 500,
  "tooltip": "旋风斩(右键)",
  "skill_name": "whirlwind"
}
```

返回 KubeJS 注册代码，包含 `attack_damage`、`attack_speed`、`max_damage` 等属性。

#### 步骤 2：生成盔甲套装

调用 `generate_kubejs_armor_set`：
```json
{
  "class_name": "warrior",
  "tier_name": "warrior",
  "material": "diamond",
  "defense": 8,
  "toughness": 3.0,
  "knockback_resistance": 0.1
}
```

返回完整的四件套（头盔/胸甲/护腿/靴子）注册代码，包含 `tier.name` 纹理路径设置。

---

### Phase 3 — KubeJS 配方生成

#### 有序合成配方

调用 `generate_kubejs_shaped_recipe`：
```json
{
  "result": "kubejs:iron_sword",
  "count": 1,
  "pattern": [" III", " I ", " S "],
  "keys": { "I": "minecraft:iron_ingot", "S": "minecraft:stick" }
}
```

#### 无序合成配方

调用 `generate_kubejs_shapeless_recipe`：
```json
{
  "result": "kubejs:dirt_ball",
  "count": 4,
  "ingredients": ["minecraft:dirt", "minecraft:dirt", "minecraft:dirt", "minecraft:dirt"]
}
```

#### 熔炼配方

调用 `generate_kubejs_smelting`：
```json
{
  "result": "minecraft:iron_ingot",
  "input": "minecraft:iron_ore",
  "xp": 1.0,
  "cook_time": 200
}
```

#### 移除配方

调用 `generate_kubejs_remove_recipe`：
```json
{
  "ids": ["minecraft:iron_ingot", "kubejs:bad_recipe"]
}
```

---

### Phase 4 — 验证与诊断

#### SNBT 验证

调用 `validate_snbt`：
```json
{
  "snbt_content": "{\n\ttitle: \"Test\"\n\tid: \"ABC123\"\n}"
}
```

检查项：
- 花括号 `{}` 配对
- 中括号 `[]` 配对
- `Count >= 128b` 格式警告
- `type: "custom"` 废弃警告
- 缺少 `id` 字段警告

#### KubeJS 脚本检查

调用 `check_kubejs_errors`：
```json
{
  "script_content": "StartupEvents.registry('item', e => {\n  e.create('kubejs:test')\n})"
}
```

检查项：
- 废弃的 `onEvent('item.registry')` 用法
- 无效的 `armorTexture()` 方法
- 无效的 `getSlot(i)` 用法
- 无效的 `Arguments.INTEGER` 用法
- 重复 `var` 声明警告

#### 纹理路径生成

调用 `generate_item_texture_path`：
```json
{
  "item_name": "warrior_sword",
  "item_type": "weapon"
}
```

返回：
- `inventory_texture`：纹理文件路径（`assets/kubejs/textures/item/xxx.png`）
- `code`：KubeJS `.texture()` 调用代码
- `worn_layer1` / `worn_layer2`：盔甲穿戴层纹理路径（armor 类型）

---

## Verification Matrix

| Operation | Expected Postcondition | Valid Evidence | Failure and Recovery |
|---|---|---|---|
| V1 — 生成章节 SNBT | 输出包含完整章节结构和任务定义 | SNBT 花括号配对，包含 chapter_id 和 quest_ids | 重新生成；若 quest_count > 20 则截断为 20 |
| V2 — 生成任务 SNBT | 输出包含任务 ID、类型、图标和奖励 | snbt_fragment 包含 task.type 和 reward.id | 检查 task_type 是否为有效枚举值 |
| V3 — 生成 KubeJS 武器代码 | 输出包含 attack_damage 等属性 | 代码包含 `attack_damage` 和 class_type 方法链 | 检查 class_type 是否支持对应属性 |
| V4 — 生成合成配方代码 | 输出包含 event.shaped/shapeless 调用 | 代码包含 `event.shaped(` 或 `event.shapeless(` | 检查 pattern 是否为有效 1-3 行数组 |
| V5 — 验证 SNBT | valid=true 当且仅当无错误 | errors 数组为空，warnings 列表准确 | 向用户报告具体错误行和内容 |
| V6 — 检查 KubeJS | valid=true 当且仅当无废弃 API | errors 数组为空 | 提供修复建议：将 onEvent 改为 StartupEvents |

---

## Output

### 章节生成成功
```
✅ 章节已生成
文件名：00_prologue.snbt
章节 ID：A1B2C3D4E5F6G7H8
任务数量：3
任务 IDs：[id1, id2, id3]
```

### 任务生成成功
```
✅ 任务已生成
任务 ID：A1B2C3D4E5F6G7H8
类型：item
物品：minecraft:diamond
数量：5
奖励：minecraft:bread x1
```

### 武器注册代码
```javascript
// KubeJS - Warrior Weapon
StartupEvents.registry('item', event => {
  event.create('kubejs:warrior_greatsword')
    .displayName('巨剑')
    .damage(500)
    .fireResistant(true)
    .attributes({
      'minecraft:generic.attack_damage': 10,
      'minecraft:generic.attack_speed': -3.2
    })
    .texture('kubejs:item/warrior_greatsword')
    .rightClickAction('skill', 'whirlwind');
});
```

### SNBT 验证结果
```
✅ SNBT 语法检查通过
警告：0 个
错误：0 个
```
或
```
❌ SNBT 存在错误
错误：
  - 花括号不匹配：{ 出现 3 次，} 出现 2 次
警告：
  - 发现 Count: 256b：建议改为 Count: 256
```

---

## Safety

- 本 MCP 所有工具均为纯代码生成，不修改任何文件系统
- 生成的 SNBT/KubeJS 代码由用户审查后使用
- 不执行任何外部网络请求
- 不存储或传输任何用户敏感信息

---

## MCP 集成

本 skill 可与以下已配置的 MCP 协同工作：

### mc-modpack-mcp
用于整合包整体诊断：
- 生成任务书后，用 `check_pack_compatibility` 检查任务书是否与现有模组兼容

### mc-pack-builder-mcp
用于整合包构建流程：
- 生成 KubeJS 代码后，将其放入 `assets/kubejs/scripts/server/` 目录
- 生成纹理路径后，创建对应的纹理文件

---

## 常用 KubeJS 版本参考

| 功能 | KubeJS 2001.6.5 写法 | 废弃写法 |
|---|---|---|
| 物品注册 | `StartupEvents.registry('item', e => { ... })` | `onEvent('item.registry', e => { ... })` |
| 配方注册 | `ServerEvents.recipes(event => { ... })` | `onEvent('recipes', event => { ... })` |
| 盔甲纹理 | `tier.name = 'warrior'` | `.armorTexture('warrior')` |
| 物品槽位 | `player.inventory.get(i)` | `player.inventory.getSlot(i)` |

---

## 已知限制

- `generate_quest_chapter` 每个任务默认生成一个 item 类型任务和面包奖励，高级自定义需调用 `generate_quest_task` 后手动合并
- KubeJS 代码生成基于 2001.6.5 版本 API，旧版 KubeJS 可能不支持部分方法
- 纹理路径为建议路径，实际纹理文件需由用户手动放置
