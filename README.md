# minecraft-mod-mcp-server

Cloudflare Workers MCP server for Minecraft modpack development. Generates FTB Quests chapters and tasks, KubeJS scripts (weapons, armor, recipes), validates SNBT/config files, and provides diagnostic checks.

## Deployment Status

**Deployed at:** https://minecraft-mcp.mcjj.workers.dev

This project runs as a Cloudflare Worker and is live at the URL above. For local development and testing, see [Local Development](#local-development) below.

### Local Development

Run locally to preview and test before deploying:

```
http://localhost:8788/mcp
```

## Tools

### FTB Quests Generation

| Tool | Description |
|------|-------------|
| `generate_quest_chapter` | Generate a complete FTB Quests chapter file (SNBT format) with multiple tasks, dependencies, and rewards |
| `generate_quest_task` | Generate a single FTB Quests task definition (item/kill/advancement/checklist types) |
| `generate_hex_id` | Generate a 16-bit random hex ID for FTB Quests chapter/task IDs |
| `generate_chapter_group_snbt` | Generate `chapter_groups.snbt` to define quest book grouping (main/branch quests) |
| `generate_quest_data_snbt` | Generate `data.snbt` quest book main config (title, icon, progress mode) |

### KubeJS Script Generation

| Tool | Description |
|------|-------------|
| `generate_kubejs_weapon` | Generate KubeJS weapon registration code (attack damage, speed, durability, skills) |
| `generate_kubejs_armor_set` | Generate KubeJS armor set registration code (helm/chest/leggings/boots with tier definitions) |
| `generate_kubejs_shaped_recipe` | Generate KubeJS shaped recipe code (3x3 crafting pattern with ingredient mapping) |
| `generate_kubejs_shapeless_recipe` | Generate KubeJS shapeless recipe code (just ingredients and output) |
| `generate_kubejs_smelting` | Generate KubeJS smelting/furnace/smoker recipe code |
| `generate_kubejs_remove_recipe` | Generate KubeJS recipe removal code (override or disable vanilla/mod recipes) |

### Validation & Diagnostics

| Tool | Description |
|------|-------------|
| `validate_snbt` | Validate SNBT file syntax (check unmatched braces, Count format issues, etc.) |
| `check_kubejs_errors` | Check KubeJS scripts for common errors (deprecated APIs, Rhino engine compatibility issues) |
| `generate_item_texture_path` | Generate KubeJS item/armor texture path guide for correct file placement |

## Features

- **FTB Quests generation** — full SNBT output for quest books with dependencies, rewards, and grouping
- **KubeJS script generation** — weapons, armor, shaped/shapeless/smelting recipes, and recipe removals
- **SNBT validation** — catches syntax errors before they cause runtime issues in-game
- **KubeJS diagnostics** — detects deprecated APIs and Rhino engine compatibility problems
- **Zero network dependency** — all generation is purely algorithmic; no external APIs called
- **Cloudflare Workers ready** — designed for edge deployment; no network or external API dependency for generation logic

## Installation (Local Development)

### Prerequisites

- Node.js 18+
- npm
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Setup

```bash
cd minecraft-mcp-server
npm install
```

### Run locally

```bash
npm start
# or
npx wrangler dev
```

Then connect via MCP client to `http://localhost:8788/mcp`.

### Deploy to Cloudflare

```bash
npm run deploy
```

### Configuration for MCP clients

**Local development** — connect to the local server:

```json
{
  "mcpServers": {
    "minecraft-mod": {
      "url": "http://localhost:8788/mcp"
    }
  }
}
```

**Production deployment** — connect to the live endpoint:

```json
{
  "mcpServers": {
    "minecraft-mod": {
      "url": "https://minecraft-mcp.mcjj.workers.dev/mcp"
    }
  }
}
```

## Architecture

```
minecraft-mcp-server/
├── src/
│   ├── index.ts           # Cloudflare Worker entry point + MCP server setup
│   ├── types.ts           # Cloudflare Workers environment types
│   ├── tools/
│   │   ├── quest.ts       # FTB Quests generation logic
│   │   ├── kubejs.ts      # KubeJS script generation logic
│   │   └── validate.ts    # SNBT validation + KubeJS diagnostics
│   └── templates/
│       ├── quest_chapter.ts
│       ├── kubejs_item.ts
│       └── kubejs_recipe.ts
├── __tests__/
│   └── unit.test.ts       # Unit tests (fully offline, 49 tests)
├── vitest.config.ts       # Vitest config (ESM, globals: false)
├── package.json           # Dependencies (@modelcontextprotocol/sdk, agents, zod, wrangler)
└── wrangler.jsonc         # Cloudflare Workers deployment config
```

The MCP server is built on the `@modelcontextprotocol/sdk` v1.x and is designed to run as a Cloudflare Worker via the `agents` library's `createLegacyMcpHandler`.

## Testing

```bash
npm test
# or
npx vitest run
```

All 49 unit tests run fully offline — no network or Cloudflare account required for testing.

## Platform Compatibility

| Aspect | Windows | macOS | Linux |
|--------|---------|-------|-------|
| Local dev (`wrangler dev`) | ✅ | ✅ | ✅ |
| Unit tests (`vitest`) | ✅ | ✅ | ✅ |
| Production deployment | Requires Cloudflare account | Requires Cloudflare account | Requires Cloudflare account |

This project is designed to run on Cloudflare Workers. For local development and testing, use `wrangler dev` — no Cloudflare account or internet connection is required. The generation logic is pure TypeScript and fully offline. To deploy to production, you need a Cloudflare account with Workers enabled.

## License

MIT
