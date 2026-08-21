/**
 * KubeJS 物品注册代码生成器
 * 生成符合 KubeJS 2001.6.5 规范的物品注册脚本
 */

export interface ItemConfig {
  name: string;
  displayName: string;
  type: 'basic' | 'sword' | 'pickaxe' | 'axe' | 'shovel' | 'hoe' | 'helmet' | 'chestplate' | 'leggings' | 'boots';
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic';
  maxDamage?: number;
  tooltip?: string[];
  attackDamage?: number;
  attackSpeed?: number;
  glow?: boolean;
  fireResistant?: boolean;
  armorTier?: {
    name: string;
    durabilityMultiplier: number;
    slotProtections: [number, number, number, number];
    toughness: number;
    enchantmentValue: number;
    equipSound: string;
    repairIngredient: string;
  };
}

export interface WeaponConfig {
  name: string;
  displayName: string;
  classType: 'warrior' | 'mage' | 'ranger' | 'assassin';
  attackDamage: number;
  attackSpeed: number;
  maxDamage: number;
  tooltip: string;
  skillName: string;
}

export interface ArmorSetConfig {
  className: string;
  classDisplayName: string;
  color: string;
  tierName: string;
  durabilityMultiplier: number;
  slotProtections: [number, number, number, number];
  toughness: number;
  enchantmentValue: number;
  equipSound: string;
  repairIngredient: string;
  pieces: {
    helm: { name: string; displayName: string; maxDamage: number };
    chest: { name: string; displayName: string; maxDamage: number };
    legs: { name: string; displayName: string; maxDamage: number };
    boots: { name: string; displayName: string; maxDamage: number };
  };
}

/**
 * 生成基础物品注册代码
 */
export function generateBasicItem(config: ItemConfig): string {
  const lines: string[] = [];

  lines.push(`    event.create('${config.name}')`);
  lines.push(`        .displayName('${config.displayName}')`);

  if (config.rarity) {
    lines.push(`        .rarity('${config.rarity}')`);
  }
  if (config.glow) {
    lines.push(`        .glow(true)`);
  }
  if (config.fireResistant) {
    lines.push(`        .fireResistant(true)`);
  }
  if (config.maxDamage) {
    lines.push(`        .maxDamage(${config.maxDamage})`);
  }
  if (config.tooltip && config.tooltip.length > 0) {
    config.tooltip.forEach(t => lines.push(`        .tooltip('${t}')`));
  }

  return lines.join('\n');
}

/**
 * 生成武器物品注册代码（含属性修饰）
 */
export function generateWeaponItem(config: WeaponConfig): string {
  const colorCodes: Record<string, string> = {
    warrior: 'c',
    mage: '9',
    ranger: 'a',
    assassin: '8'
  };
  const color = colorCodes[config.classType] || 'f';

  return `    event.create('${config.name}')
        .displayName('§${color}${config.displayName}')
        .rarity('epic')
        .glow(true)
        .maxDamage(${config.maxDamage})
        .tooltip('§7${config.classType}专属 · ${config.tooltip}')
        .modifyAttribute('minecraft:generic.attack_damage', 'kubejs:${config.name}_ad', ${config.attackDamage}, 'addition')
        .modifyAttribute('minecraft:generic.attack_speed', 'kubejs:${config.name}_as', ${config.attackSpeed}, 'addition')
        .fireResistant(true)`;
}

/**
 * 生成盔甲 tier 定义代码
 */
export function generateArmorTier(config: ArmorSetConfig): string {
  const pieces = [
    { key: 'helm', ...config.pieces.helm },
    { key: 'chest', ...config.pieces.chest },
    { key: 'legs', ...config.pieces.legs },
    { key: 'boots', ...config.pieces.boots },
  ];

  const lines: string[] = [];

  // Generate tier function
  lines.push(`    const ${config.className}ArmorTier = tier => {`);
  lines.push(`        tier.name = '${config.tierName}'`);
  lines.push(`        tier.durabilityMultiplier = ${config.durabilityMultiplier}`);
  lines.push(`        tier.slotProtections = [${config.slotProtections.join(', ')}]`);
  lines.push(`        tier.toughness = ${config.toughness}`);
  lines.push(`        tier.enchantmentValue = ${config.enchantmentValue}`);
  lines.push(`        tier.equipSound = '${config.equipSound}'`);
  lines.push(`        tier.repairIngredient = '${config.repairIngredient}'`);
  lines.push(`    }`);
  lines.push(``);

  // Generate item registrations
  pieces.forEach(piece => {
    const typeMap: Record<string, string> = {
      helm: 'helmet',
      chest: 'chestplate',
      legs: 'leggings',
      boots: 'boots'
    };
    lines.push(`    event.create('${piece.key}', '${typeMap[piece.key]}')`);
    lines.push(`        .displayName('${config.color}${piece.displayName}')`);
    lines.push(`        .rarity('rare')`);
    lines.push(`        .glow(true)`);
    lines.push(`        .maxDamage(${piece.maxDamage})`);
    lines.push(`        .tooltip('§7${config.classDisplayName}套装')`);
    lines.push(`        .modifyTier(${config.className}ArmorTier)`);
  });

  return lines.join('\n');
}

/**
 * 生成完整的物品注册脚本文件
 */
export function generateItemRegistryScript(items: ItemConfig[]): string {
  const header = `// ========================================
// KubeJS - Startup Scripts
// 自动生成：Minecraft Mod MCP Server
// ========================================

StartupEvents.registry('item', event => {
`;

  const footer = `
})`;

  const body = items.map(item => {
    switch (item.type) {
      case 'sword':
      case 'pickaxe':
      case 'axe':
      case 'shovel':
      case 'hoe':
        return generateBasicItem(item);
      default:
        return generateBasicItem(item);
    }
  }).join('\n\n');

  return header + body + footer;
}