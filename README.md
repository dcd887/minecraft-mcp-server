# minecraft-mod-mcp-server

Cloudflare Workers MCP server for Minecraft modpack development. Generates FTB Quests chapters and tasks, KubeJS scripts (weapons, armor, recipes), validates SNBT/config files, and provides diagnostic checks.

## Deployment

This MCP runs on Cloudflare Workers. After deployment, it is accessible at:

```
https://<your-worker>.<your-subdomain>.workers.dev/mcp
```

Local development uses `wrangler dev` to preview before deploying.

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
- **Cloudflare Workers deployment** — runs globally with low latency via the Workers edge network

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

After deployment, add to your MCP client config:

```json
{
  "mcpServers": {
    "minecraft-mod": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-stdio"],
      "env": {
        "MCP_SERVER_URL": "https://<your-worker>.<your-subdomain>.workers.dev/mcp"
      }
    }
  }
}
```

Or if using an HTTP-based MCP client:

```json
{
  "mcpServers": {
    "minecraft-mod": {
      "url": "https://<your-worker>.<your-subdomain>.workers.dev/mcp"
    }
  }
}
```

Replace `<your-worker>` and `<your-subdomain>` with your actual Cloudflare Workers deployment URL.

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

The MCP server is built on the `@modelcontextprotocol/sdk` v1.x and deployed as a Cloudflare Worker using the `agents` library's `createLegacyMcpHandler`.

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
| Production deployment | ✅ (Cloudflare) | ✅ (Cloudflare) | ✅ (Cloudflare) |
| MCP client connection | ✅ | ✅ | ✅ |

This MCP runs entirely on Cloudflare Workers infrastructure. The only platform dependency is having a Cloudflare account with Workers enabled. All generation logic is pure JavaScript/TypeScript and fully cross-platform.

## License

MIT
