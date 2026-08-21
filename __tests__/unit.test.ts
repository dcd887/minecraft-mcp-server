import { describe, it, expect } from 'vitest';
import {
  generateChapterSnbt,
  generateQuestSnbt,
  generateTaskSnbt,
  generateRewardSnbt,
  generateHexId,
  QuestChapter,
  QuestEntry,
  QuestTask,
  QuestReward,
} from '../src/templates/quest_chapter';
import {
  generateShapedRecipe,
  generateShapelessRecipe,
  generateSmeltingRecipe,
  generateSmithingRecipe,
  generateRecipeScript,
  generateRemoveRecipeScript,
  ShapedRecipe,
  ShapelessRecipe,
  SmeltingRecipe,
  SmithingRecipe,
} from '../src/templates/kubejs_recipe';
import {
  generateBasicItem,
  generateWeaponItem,
  generateArmorTier,
  generateItemRegistryScript,
  ItemConfig,
  WeaponConfig,
  ArmorSetConfig,
} from '../src/templates/kubejs_item';
import {
  handleValidateSnbt,
  handleCheckKubeJS,
  handleGenerateTexturePath,
  handleGenerateChapterGroup,
  handleGenerateQuestData,
} from '../src/tools/validate';
import {
  handleGenerateWeapon,
  handleGenerateArmorSet,
  handleGenerateShapedRecipe,
  handleGenerateShapelessRecipe,
  handleGenerateSmelting,
  handleGenerateRemoveRecipe,
} from '../src/tools/kubejs';
import { handleGenerateQuestChapter, handleGenerateQuestTask, handleGenerateHexId } from '../src/tools/quest';

// ============================================================
// 1. Quest Chapter Generation
// ============================================================
describe('generateHexId', () => {
  it('generates a 16-character uppercase hex string', () => {
    const id = generateHexId();
    expect(id).toHaveLength(16);
    expect(/^[0-9A-F]{16}$/.test(id)).toBe(true);
  });

  it('generates different IDs on consecutive calls', () => {
    const id1 = generateHexId();
    const id2 = generateHexId();
    expect(id1).not.toBe(id2);
  });
});

describe('generateQuestSnbt', () => {
  const baseQuest: QuestEntry = {
    id: 'TEST000000000001',
    icon: 'minecraft:diamond_sword',
    title: 'Test Quest',
    description: ['Complete this quest'],
    dependencies: [],
    dependency_requirement: 'all',
    x: 0,
    y: 0,
    shape: 'square',
    tasks: [],
    rewards: [],
  };

  it('generates valid SNBT for a basic quest', () => {
    const snbt = generateQuestSnbt(baseQuest, 'CHAPTER0000000001');
    expect(snbt).toContain('id: "TEST000000000001"');
    expect(snbt).toContain('title: "Test Quest"');
    expect(snbt).toContain('icon: "minecraft:diamond_sword"');
    expect(snbt).toContain('dependencies: [ ]');
  });

  it('includes dependency list when dependencies exist', () => {
    const quest = { ...baseQuest, dependencies: ['DEP00000000000001', 'DEP00000000000002'] };
    const snbt = generateQuestSnbt(quest, 'CHAPTER0000000001');
    expect(snbt).toContain('"DEP00000000000001"');
    expect(snbt).toContain('"DEP00000000000002"');
  });

  it('escapes special characters in title', () => {
    const quest = { ...baseQuest, title: 'Test "quoted" quest' };
    const snbt = generateQuestSnbt(quest, 'CHAPTER0000000001');
    expect(snbt).toContain('Test \\"quoted\\" quest');
  });
});

describe('generateTaskSnbt', () => {
  it('generates item task SNBT', () => {
    const task: QuestTask = { id: 'T001', type: 'item', item: 'minecraft:diamond', count: 5 };
    const snbt = generateTaskSnbt(task);
    expect(snbt).toContain('type: "item"');
    expect(snbt).toContain('id: "T001"');
    expect(snbt).toContain('Count: 5b');
  });

  it('generates kill task SNBT', () => {
    const task: QuestTask = { id: 'T002', type: 'kill', entity: 'minecraft:zombie', count: 10 };
    const snbt = generateTaskSnbt(task);
    expect(snbt).toContain('type: "kill"');
    expect(snbt).toContain('entity: "minecraft:zombie"');
  });

  it('generates advancement task SNBT', () => {
    const task: QuestTask = { id: 'T003', type: 'advancement', advancement: 'minecraft:story/root' };
    const snbt = generateTaskSnbt(task);
    expect(snbt).toContain('type: "advancement"');
    expect(snbt).toContain('advancement: "minecraft:story/root"');
  });

  it('generates checklist task SNBT', () => {
    const task: QuestTask = { id: 'T004', type: 'checklist', title: 'My Checklist', icon: 'minecraft:paper' };
    const snbt = generateTaskSnbt(task);
    expect(snbt).toContain('type: "checklist"');
    expect(snbt).toContain('title: "My Checklist"');
  });
});

describe('generateRewardSnbt', () => {
  it('generates item reward SNBT', () => {
    const reward: QuestReward = { id: 'R001', type: 'item', item: 'minecraft:diamond', count: 3 };
    const snbt = generateRewardSnbt(reward);
    expect(snbt).toContain('type: "item"');
    expect(snbt).toContain('Count: 3b');
  });

  it('generates xp reward SNBT', () => {
    const reward: QuestReward = { id: 'R002', type: 'xp', xp: 100 };
    const snbt = generateRewardSnbt(reward);
    expect(snbt).toContain('type: "xp"');
    expect(snbt).toContain('xp: 100');
  });

  it('generates command reward SNBT', () => {
    const reward: QuestReward = { id: 'R003', type: 'command', command: '/give @s diamond' };
    const snbt = generateRewardSnbt(reward);
    expect(snbt).toContain('type: "command"');
    expect(snbt).toContain('/give @s diamond');
  });

  it('generates random reward SNBT', () => {
    const reward: QuestReward = { id: 'R004', type: 'random', table_id: 'loot_tables/my_table' };
    const snbt = generateRewardSnbt(reward);
    expect(snbt).toContain('type: "random"');
    expect(snbt).toContain('table_id: loot_tables/my_tableL');
  });
});

describe('generateChapterSnbt', () => {
  const chapter: QuestChapter = {
    id: 'CH00000000000001',
    group: 'main',
    filename: '01_prologue',
    order_index: 0,
    icon: 'minecraft:writable_book',
    default_quest_shape: 'square',
    default_hide_dependency_lines: true,
    quests: [],
    quest_links: [],
  };

  it('generates a valid SNBT chapter with no quests', () => {
    const snbt = generateChapterSnbt(chapter);
    expect(snbt).toContain('id: "CH00000000000001"');
    expect(snbt).toContain('filename: "01_prologue"');
    expect(snbt).toContain('group: "main"');
    expect(snbt).toContain('order_index: 0');
  });

  it('includes quests when provided', () => {
    const quest: QuestEntry = {
      id: 'Q000000000000001',
      icon: 'minecraft:diamond',
      title: 'First Quest',
      description: ['Get a diamond'],
      dependencies: [],
      dependency_requirement: 'all',
      x: 0,
      y: 0,
      shape: 'square',
      tasks: [{ id: 'T001', type: 'item', item: 'minecraft:diamond', count: 1 }],
      rewards: [{ id: 'R001', type: 'item', item: 'minecraft:diamond', count: 1 }],
    };
    const ch = { ...chapter, quests: [quest] };
    const snbt = generateChapterSnbt(ch);
    expect(snbt).toContain('Q000000000000001');
    expect(snbt).toContain('First Quest');
  });
});

// ============================================================
// 2. KubeJS Recipe Generation
// ============================================================
describe('generateShapedRecipe', () => {
  it('generates valid shaped recipe code', () => {
    const recipe: ShapedRecipe = {
      type: 'shaped',
      result: 'kubejs:iron_sword',
      count: 1,
      pattern: [' III', ' I ', ' S '],
      keys: { I: 'minecraft:iron_ingot', S: 'minecraft:stick' },
    };
    const code = generateShapedRecipe(recipe);
    expect(code).toContain("event.shaped(");
    expect(code).toContain("'kubejs:iron_sword'");
    expect(code).toContain("I: 'minecraft:iron_ingot'");
  });
});

describe('generateShapelessRecipe', () => {
  it('generates valid shapeless recipe code', () => {
    const recipe: ShapelessRecipe = {
      type: 'shapeless',
      result: 'kubejs:dirt_ball',
      count: 4,
      ingredients: ['minecraft:dirt', 'minecraft:dirt', 'minecraft:dirt', 'minecraft:dirt'],
    };
    const code = generateShapelessRecipe(recipe);
    expect(code).toContain("event.shapeless(");
    expect(code).toContain("'kubejs:dirt_ball'");
  });
});

describe('generateSmeltingRecipe', () => {
  it('generates valid smelting recipe code', () => {
    const recipe: SmeltingRecipe = {
      type: 'smelting',
      input: 'minecraft:iron_ore',
      result: 'minecraft:iron_ingot',
      xp: 1.0,
      cookTime: 200,
    };
    const code = generateSmeltingRecipe(recipe);
    expect(code).toContain("event.smelting(");
    expect(code).toContain("'minecraft:iron_ingot'");
    expect(code).toContain('.cookingTime(200)');
  });
});

describe('generateSmithingRecipe', () => {
  it('generates valid smithing recipe code', () => {
    const recipe: SmithingRecipe = {
      type: 'smithing',
      base: 'minecraft:diamond_sword',
      addition: 'minecraft:golden_ingot',
      result: 'kubejs:enchanted_sword',
    };
    const code = generateSmithingRecipe(recipe);
    expect(code).toContain("event.smithing(");
    expect(code).toContain("'kubejs:enchanted_sword'");
  });
});

describe('generateRecipeScript', () => {
  it('wraps recipes in ServerEvents.recipes block', () => {
    const recipes: Recipe[] = [
      { type: 'shaped', result: 'kubejs:test', count: 1, pattern: ['AAA'], keys: { A: 'minecraft:stone' } },
    ];
    const code = generateRecipeScript(recipes as any[], 'my_mod');
    expect(code).toContain('ServerEvents.recipes(event => {');
    expect(code).toContain('// 适用Mod：my_mod');
    expect(code).toContain('})');
  });
});

describe('generateRemoveRecipeScript', () => {
  it('generates removal script with multiple IDs', () => {
    const ids = ['minecraft:iron_ingot', 'kubejs:bad_recipe'];
    const code = generateRemoveRecipeScript(ids);
    expect(code).toContain("event.remove({ id: 'minecraft:iron_ingot' })");
    expect(code).toContain("event.remove({ id: 'kubejs:bad_recipe' })");
  });
});

// ============================================================
// 3. KubeJS Item Generation
// ============================================================
describe('generateBasicItem', () => {
  it('generates basic item registration code', () => {
    const config: ItemConfig = { name: 'kubejs:test_gem', displayName: '测试宝石', type: 'basic', rarity: 'rare' };
    const code = generateBasicItem(config);
    expect(code).toContain("event.create('kubejs:test_gem')");
    expect(code).toContain("displayName('测试宝石')");
    expect(code).toContain(".rarity('rare')");
  });
});

describe('generateWeaponItem', () => {
  it('generates warrior weapon code with correct attributes', () => {
    const config: WeaponConfig = {
      name: 'warrior_greatsword',
      displayName: '巨剑',
      classType: 'warrior',
      attackDamage: 10,
      attackSpeed: -3.2,
      maxDamage: 500,
      tooltip: '旋风斩(右键)',
      skillName: 'whirlwind',
    };
    const code = generateWeaponItem(config);
    expect(code).toContain('attack_damage');
    expect(code).toContain('10');
    expect(code).toContain('attack_speed');
    expect(code).toContain('-3.2');
    expect(code).toContain('fireResistant(true)');
  });
});

describe('generateArmorTier', () => {
  it('generates armor tier definition and item registrations', () => {
    const config: ArmorSetConfig = {
      className: 'warrior',
      classDisplayName: '战士重甲',
      color: '§c',
      tierName: 'warrior_armor',
      durabilityMultiplier: 25,
      slotProtections: [3, 8, 6, 3],
      toughness: 3.0,
      enchantmentValue: 10,
      equipSound: 'minecraft:item.armor.equip_diamond',
      repairIngredient: '#forge:ingots/iron',
      pieces: {
        helm: { name: 'warrior_helm', displayName: '战士头盔', maxDamage: 11 },
        chest: { name: 'warrior_chest', displayName: '战士胸甲', maxDamage: 16 },
        legs: { name: 'warrior_legs', displayName: '战士护腿', maxDamage: 13 },
        boots: { name: 'warrior_boots', displayName: '战士靴子', maxDamage: 11 },
      },
    };
    const code = generateArmorTier(config);
    expect(code).toContain('warriorArmorTier');
    expect(code).toContain("tier.name = 'warrior_armor'");
    expect(code).toContain('.modifyTier(warriorArmorTier)');
    expect(code).toContain("minecraft:item.armor.equip_diamond");
  });
});

describe('generateItemRegistryScript', () => {
  it('wraps items in StartupEvents.registry block', () => {
    const items: ItemConfig[] = [
      { name: 'kubejs:test_gem', displayName: '测试宝石', type: 'basic' },
    ];
    const code = generateItemRegistryScript(items);
    expect(code).toContain("StartupEvents.registry('item', event => {");
    expect(code).toContain('})');
  });
});

// ============================================================
// 4. Validation Tools
// ============================================================
describe('handleValidateSnbt', () => {
  it('returns valid for well-formed SNBT', () => {
    const result = handleValidateSnbt({ snbt_content: '{\n\tid: "test"\n\ttype: "item"\n}' });
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('detects brace mismatch', () => {
    const result = handleValidateSnbt({ snbt_content: '{\n\tid: "test"\n' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('花括号'))).toBe(true);
  });

  it('detects bracket mismatch', () => {
    const result = handleValidateSnbt({ snbt_content: '[\n\t"id": "test"\n' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('中括号'))).toBe(true);
  });

  it('warns about Count >= 128b', () => {
    const result = handleValidateSnbt({ snbt_content: '{\n\tCount: 200b\n}' });
    expect(result.warnings.some(w => w.includes('128'))).toBe(true);
  });

  it('warns about custom type', () => {
    const result = handleValidateSnbt({ snbt_content: 'type: "custom"' });
    expect(result.warnings.some(w => w.includes('custom'))).toBe(true);
  });

  it('warns when no id field found', () => {
    const result = handleValidateSnbt({ snbt_content: '{\n\tname: "test"\n}' });
    expect(result.warnings.some(w => w.includes('id'))).toBe(true);
  });
});

describe('handleCheckKubeJS', () => {
  it('detects deprecated onEvent item.registry', () => {
    const result = handleCheckKubeJS({ script_content: "onEvent('item.registry', e => {})" });
    expect(result.errors.some(e => e.includes('item.registry'))).toBe(true);
  });

  it('detects deprecated armorTexture', () => {
    const result = handleCheckKubeJS({ script_content: '.armorTexture("test")' });
    expect(result.errors.some(e => e.includes('armorTexture'))).toBe(true);
  });

  it('detects invalid getSlot usage', () => {
    const result = handleCheckKubeJS({ script_content: 'player.inventory.getSlot(0)' });
    expect(result.errors.some(e => e.includes('getSlot'))).toBe(true);
  });

  it('passes clean script without errors', () => {
    const result = handleCheckKubeJS({ script_content: "StartupEvents.registry('item', e => {\n  e.create('kubejs:test')\n})" });
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});

describe('handleGenerateTexturePath', () => {
  it('generates correct paths for weapon type', () => {
    const result = handleGenerateTexturePath({ item_name: 'warrior_sword', item_type: 'weapon' });
    expect(result.paths.inventory_texture).toContain('assets/kubejs/textures/item/warrior_sword.png');
    expect(result.paths.code).toContain(".texture('kubejs:item/warrior_sword')");
  });

  it('generates armor layer paths for helmet', () => {
    const result = handleGenerateTexturePath({ item_name: 'warrior_helm', item_type: 'armor_helm' });
    expect(result.paths.worn_layer1).toContain('armor/warrior_layer_1.png');
    expect(result.paths.note).toContain('tier.name');
  });
});

// ============================================================
// 5. Chapter Group & Quest Data
// ============================================================
describe('handleGenerateChapterGroup', () => {
  it('generates valid chapter_groups SNBT', () => {
    const result = handleGenerateChapterGroup({
      groups: [
        { id: 'MAIN000000000001', title: '§l&6主线任务' },
        { id: 'SIDE000000000001', title: '§l&a支线任务' },
      ],
    });
    expect(result.filename).toBe('chapter_groups.snbt');
    expect(result.content).toContain('MAIN000000000001');
    expect(result.content).toContain('SIDE000000000001');
  });
});

describe('handleGenerateQuestData', () => {
  it('generates valid data.snbt', () => {
    const result = handleGenerateQuestData({
      title: '§l&c战斗之章',
      icon: 'minecraft:nether_star',
      quest_shape: 'rsquare',
      progression_mode: 'linear',
      show_lock_icons: true,
    });
    expect(result.filename).toBe('data.snbt');
    expect(result.content).toContain('title: "§l&c战斗之章"');
    expect(result.content).toContain('progression_mode: "linear"');
  });
});

// ============================================================
// 6. Tool Handler Integration
// ============================================================
describe('handleGenerateQuestChapter', () => {
  it('generates a chapter with multiple quests', () => {
    const result = handleGenerateQuestChapter({
      title: '初入世间',
      group_id: '723AE4EA49A6043A',
      icon: 'minecraft:writable_book',
      order_index: 0,
      filename: '00_prologue',
      quest_count: 3,
    });
    expect(result).toHaveProperty('content');
    expect(result.content).toContain('00_prologue');
    // Each quest should have a unique ID
    const questIds = result.content.match(/id: "[0-9A-F]{16}"/g) || [];
    expect(questIds.length).toBeGreaterThanOrEqual(3);
  });
});

describe('handleGenerateQuestTask', () => {
  it('generates item-type quest task', () => {
    const result = handleGenerateQuestTask({
      title: '收集钻石',
      description: '获得 5 个钻石',
      icon: 'minecraft:diamond',
      task_type: 'item',
      target_item: 'minecraft:diamond',
      target_count: 5,
    });
    const task = JSON.parse(result.snbt_fragment).tasks[0];
    expect(task.type).toBe('item');
    expect(task.item).toBe('minecraft:diamond');
  });

  it('generates kill-type quest task', () => {
    const result = handleGenerateQuestTask({
      title: '击杀僵尸',
      description: '击杀 10 只僵尸',
      icon: 'minecraft:zombie_spawn_egg',
      task_type: 'kill',
      target_entity: 'minecraft:zombie',
      target_count: 10,
    });
    const task = JSON.parse(result.snbt_fragment).tasks[0];
    expect(task.type).toBe('kill');
    expect(task.entity).toBe('minecraft:zombie');
  });
});

describe('handleGenerateHexId', () => {
  it('returns a 16-char hex ID', () => {
    const result = handleGenerateHexId({});
    const id = result.id;
    expect(id).toHaveLength(16);
    expect(/^[0-9A-F]{16}$/.test(id)).toBe(true);
  });
});

describe('handleGenerateWeapon', () => {
  it('generates warrior weapon code', () => {
    const result = handleGenerateWeapon({
      name: 'warrior_greatsword',
      display_name: '巨剑',
      class_type: 'warrior',
      attack_damage: 10,
      attack_speed: -3.2,
      max_damage: 500,
      tooltip: '旋风斩(右键)',
    });
    expect(result.code).toContain('warrior_greatsword');
    expect(result.class_type).toBe('warrior');
  });
});

describe('handleGenerateArmorSet', () => {
  it('generates full armor set code', () => {
    const result = handleGenerateArmorSet({
      class_name: 'warrior',
      class_display_name: '战士重甲',
      color_code: '§c',
      durability_multiplier: 25,
      slot_protections: [3, 8, 6, 3],
      toughness: 3.0,
      enchantment_value: 10,
      equip_sound: 'minecraft:item.armor.equip_diamond',
      repair_ingredient: '#forge:ingots/iron',
      helm_name: 'warrior_helm',
      helm_display: '战士头盔',
      helm_durability: 11,
      chest_name: 'warrior_chest',
      chest_display: '战士胸甲',
      chest_durability: 16,
      legs_name: 'warrior_legs',
      legs_display: '战士护腿',
      legs_durability: 13,
      boots_name: 'warrior_boots',
      boots_display: '战士靴子',
      boots_durability: 11,
    });
    expect(result.code).toContain('warriorArmorTier');
    expect(result.pieces).toHaveLength(4);
  });
});

describe('handleGenerateShapedRecipe', () => {
  it('generates shaped recipe code', () => {
    const result = handleGenerateShapedRecipe({
      result: 'kubejs:iron_sword',
      count: 1,
      pattern: [' III', ' I ', ' S '],
      keys: { I: 'minecraft:iron_ingot', S: 'minecraft:stick' },
    });
    expect(result.code).toContain('event.shaped(');
  });
});

describe('handleGenerateShapelessRecipe', () => {
  it('generates shapeless recipe code', () => {
    const result = handleGenerateShapelessRecipe({
      result: 'kubejs:dirt_ball',
      count: 4,
      ingredients: ['minecraft:dirt', 'minecraft:dirt', 'minecraft:dirt', 'minecraft:dirt'],
    });
    expect(result.code).toContain('event.shapeless(');
  });
});

describe('handleGenerateSmelting', () => {
  it('generates smelting recipe code', () => {
    const result = handleGenerateSmelting({
      input: 'minecraft:iron_ore',
      result: 'minecraft:iron_ingot',
      xp: 1.0,
      cook_time: 200,
    });
    expect(result.code).toContain('event.smelting(');
    expect(result.code).toContain('.cookingTime(200)');
  });
});

describe('handleGenerateRemoveRecipe', () => {
  it('generates removal code for multiple recipes', () => {
    const result = handleGenerateRemoveRecipe({
      recipe_ids: ['minecraft:iron_ingot', 'kubejs:bad_recipe'],
    });
    expect(result.code).toContain("event.remove({ id: 'minecraft:iron_ingot' })");
    expect(result.code).toContain("event.remove({ id: 'kubejs:bad_recipe' })");
  });
});
