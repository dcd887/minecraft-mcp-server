/**
 * KubeJS 配方代码生成器
 * 生成符合 KubeJS 2001.6.5 规范的配方脚本
 */

export interface ShapedRecipe {
  type: 'shaped';
  result: string;
  count: number;
  pattern: string[];
  keys: Record<string, string>;
}

export interface ShapelessRecipe {
  type: 'shapeless';
  result: string;
  count: number;
  ingredients: string[];
}

export interface SmeltingRecipe {
  type: 'smelting';
  input: string;
  result: string;
  xp: number;
  cookTime: number;
}

export interface SmithingRecipe {
  type: 'smithing';
  base: string;
  addition: string;
  result: string;
}

export type Recipe = ShapedRecipe | ShapelessRecipe | SmeltingRecipe | SmithingRecipe;

/**
 * 生成有序合成配方代码
 */
export function generateShapedRecipe(recipe: ShapedRecipe): string {
  const patternStr = recipe.pattern.map(p => `'${p}'`).join(', ');
  const keysStr = Object.entries(recipe.keys)
    .map(([key, value]) => `        ${key}: '${value}'`)
    .join('\n');

  return `event.shaped(
    Item.of('${recipe.result}', ${recipe.count}),
    [${patternStr}],
    {
${keysStr}
    }
)`;
}

/**
 * 生成无序合成配方代码
 */
export function generateShapelessRecipe(recipe: ShapelessRecipe): string {
  const ingredients = recipe.ingredients.map(i => `'${i}'`).join(', ');

  return `event.shapeless(
    Item.of('${recipe.result}', ${recipe.count}),
    [${ingredients}]
)`;
}

/**
 * 生成熔炉配方代码
 */
export function generateSmeltingRecipe(recipe: SmeltingRecipe): string {
  return `event.smelting(
    '${recipe.result}',
    '${recipe.input}',
    ${recipe.xp}
)
.cookingTime(${recipe.cookTime})`;
}

/**
 * 生成锻造台配方代码
 */
export function generateSmithingRecipe(recipe: SmithingRecipe): string {
  return `event.smithing(
    '${recipe.result}',
    '${recipe.base}',
    '${recipe.addition}'
)`;
}

/**
 * 生成完整的配方脚本
 */
export function generateRecipeScript(recipes: Recipe[], modName: string = 'kubejs'): string {
  const header = `// ========================================
// KubeJS - Recipe Scripts
// 自动生成：Minecraft Mod MCP Server
// 适用Mod：${modName}
// ========================================

ServerEvents.recipes(event => {
`;

  const footer = `
})`;

  const body = recipes.map(recipe => {
    switch (recipe.type) {
      case 'shaped':
        return generateShapedRecipe(recipe);
      case 'shapeless':
        return generateShapelessRecipe(recipe);
      case 'smelting':
        return generateSmeltingRecipe(recipe as SmeltingRecipe);
      case 'smithing':
        return generateSmithingRecipe(recipe as SmithingRecipe);
      default:
        return '';
    }
  }).join('\n\n');

  return header + body + footer;
}

/**
 * 生成删除配方的代码
 */
export function generateRemoveRecipeScript(ids: string[]): string {
  const header = `ServerEvents.recipes(event => {
    // 移除配方
`;

  const body = ids.map(id => `    event.remove({ id: '${id}' })`).join('\n');

  const footer = `
})`;

  return header + body + footer;
}