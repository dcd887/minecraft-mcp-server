/**
 * KubeJS 脚本生成工具
 * 提供物品注册、配方、脚本代码的生成功能
 */
import { z } from "zod";
import {
  generateWeaponItem,
  generateArmorTier,
  WeaponConfig,
  ArmorSetConfig,
} from "../templates/kubejs_item";
import {
  generateShapedRecipe,
  generateShapelessRecipe,
  generateSmeltingRecipe,
  generateSmithingRecipe,
  ShapedRecipe,
  ShapelessRecipe,
  SmeltingRecipe,
  SmithingRecipe,
} from "../templates/kubejs_recipe";

export const kubejsToolSchemas = {
  generate_kubejs_weapon: {
    description: "生成 KubeJS 职业武器注册代码",
    params: z.object({
      name: z.string().describe("物品注册名（如：warrior_greatsword）"),
      display_name: z.string().describe("显示名称（如：巨剑）"),
      class_type: z.enum(["warrior", "mage", "ranger", "assassin"]).describe("职业类型"),
      attack_damage: z.number().describe("攻击力加成"),
      attack_speed: z.number().describe("攻击速度（负值，如 -3.2）"),
      max_damage: z.number().int().describe("最大耐久"),
      tooltip: z.string().describe("技能描述（如：旋风斩(右键)）"),
    }),
  },

  generate_kubejs_armor_set: {
    description: "生成 KubeJS 职业盔甲套装注册代码（含 tier 定义）",
    params: z.object({
      class_name: z.string().describe("职业英文名（如：warrior）"),
      class_display_name: z.string().describe("职业中文名（如：战士重甲）"),
      color_code: z.string().describe("颜色代码（如：§c=红色）"),
      durability_multiplier: z.number().int().describe("耐久倍率"),
      slot_protections: z.array(z.number()).length(4).describe("四件套保护值 [头盔,胸甲,护腿,靴子]"),
      toughness: z.number().describe("盔甲韧性"),
      enchantment_value: z.number().int().describe("附魔能力"),
      equip_sound: z.string().describe("装备音效（如：minecraft:item.armor.equip_iron）"),
      repair_ingredient: z.string().describe("修复材料（如：#forge:ingots/iron）"),
      helm_name: z.string().describe("头盔注册名（如：warrior_helm）"),
      helm_display: z.string().describe("头盔显示名（如：战士头盔）"),
      helm_durability: z.number().int().describe("头盔额外耐久"),
      chest_name: z.string().describe("胸甲注册名"),
      chest_display: z.string().describe("胸甲显示名"),
      chest_durability: z.number().int().describe("胸甲额外耐久"),
      legs_name: z.string().describe("护腿注册名"),
      legs_display: z.string().describe("护腿显示名"),
      legs_durability: z.number().int().describe("护腿额外耐久"),
      boots_name: z.string().describe("靴子注册名"),
      boots_display: z.string().describe("靴子显示名"),
      boots_durability: z.number().int().describe("靴子额外耐久"),
    }),
  },

  generate_kubejs_shaped_recipe: {
    description: "生成 KubeJS 有序合成配方代码",
    params: z.object({
      result: z.string().describe("产物物品 ID"),
      count: z.number().int().default(1).describe("产物数量"),
      pattern: z.array(z.string()).length(3).describe("合成模式（3行，每行最多3字符）"),
      keys: z.record(z.string(), z.string()).describe("键值映射（如：{A: 'minecraft:iron_ingot', B: 'minecraft:stick'}）"),
    }),
  },

  generate_kubejs_shapeless_recipe: {
    description: "生成 KubeJS 无序合成配方代码",
    params: z.object({
      result: z.string().describe("产物物品 ID"),
      count: z.number().int().default(1).describe("产物数量"),
      ingredients: z.array(z.string()).describe("材料列表（物品 ID 数组）"),
    }),
  },

  generate_kubejs_smelting: {
    description: "生成 KubeJS 熔炉配方代码",
    params: z.object({
      input: z.string().describe("输入物品 ID"),
      result: z.string().describe("输出物品 ID"),
      xp: z.number().default(0.1).describe("经验值"),
      cook_time: z.number().int().default(200).describe("烧炼时间（tick）"),
    }),
  },

  generate_kubejs_remove_recipe: {
    description: "生成 KubeJS 移除配方代码",
    params: z.object({
      recipe_ids: z.array(z.string()).describe("要移除的配方 ID 列表"),
    }),
  },
};

export function handleGenerateWeapon(params: z.infer<typeof kubejsToolSchemas.generate_kubejs_weapon.params>) {
  const config: WeaponConfig = {
    name: params.name,
    displayName: params.display_name,
    classType: params.class_type,
    attackDamage: params.attack_damage,
    attackSpeed: params.attack_speed,
    maxDamage: params.max_damage,
    tooltip: params.tooltip,
    skillName: params.tooltip,
  };

  return {
    code: generateWeaponItem(config),
    class_type: params.class_type,
    registration_name: `kubejs:${params.name}`,
  };
}

export function handleGenerateArmorSet(params: z.infer<typeof kubejsToolSchemas.generate_kubejs_armor_set.params>) {
  const config: ArmorSetConfig = {
    className: params.class_name,
    classDisplayName: params.class_display_name,
    color: params.color_code,
    tierName: params.class_name,
    durabilityMultiplier: params.durability_multiplier,
    slotProtections: params.slot_protections as [number, number, number, number],
    toughness: params.toughness,
    enchantmentValue: params.enchantment_value,
    equipSound: params.equip_sound,
    repairIngredient: params.repair_ingredient,
    pieces: {
      helm: { name: params.helm_name, displayName: params.helm_display, maxDamage: params.helm_durability },
      chest: { name: params.chest_name, displayName: params.chest_display, maxDamage: params.chest_durability },
      legs: { name: params.legs_name, displayName: params.legs_display, maxDamage: params.legs_durability },
      boots: { name: params.boots_name, displayName: params.boots_display, maxDamage: params.boots_durability },
    },
  };

  return {
    code: generateArmorTier(config),
    pieces: ["helm", "chest", "legs", "boots"].map(p => `kubejs:${params.class_name}_${p}`),
  };
}

export function handleGenerateShapedRecipe(params: z.infer<typeof kubejsToolSchemas.generate_kubejs_shaped_recipe.params>) {
  const recipe: ShapedRecipe = {
    type: "shaped",
    result: params.result,
    count: params.count,
    pattern: params.pattern,
    keys: params.keys as Record<string, string>,
  };

  return { code: generateShapedRecipe(recipe) };
}

export function handleGenerateShapelessRecipe(params: z.infer<typeof kubejsToolSchemas.generate_kubejs_shapeless_recipe.params>) {
  const recipe: ShapelessRecipe = {
    type: "shapeless",
    result: params.result,
    count: params.count,
    ingredients: params.ingredients,
  };

  return { code: generateShapelessRecipe(recipe) };
}

export function handleGenerateSmelting(params: z.infer<typeof kubejsToolSchemas.generate_kubejs_smelting.params>) {
  const recipe: SmeltingRecipe = {
    type: "smelting",
    input: params.input,
    result: params.result,
    xp: params.xp,
    cookTime: params.cook_time,
  };

  return { code: generateSmeltingRecipe(recipe) };
}

export function handleGenerateRemoveRecipe(params: z.infer<typeof kubejsToolSchemas.generate_kubejs_remove_recipe.params>) {
  const header = `ServerEvents.recipes(event => {\n    // 移除配方\n`;
  const body = params.recipe_ids.map(id => `    event.remove({ id: '${id}' })`).join('\n');
  const footer = `\n})`;

  return { code: header + body + footer };
}