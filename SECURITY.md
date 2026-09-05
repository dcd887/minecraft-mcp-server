# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅                 |

## Security Considerations

This project runs on Cloudflare Workers. All generation logic is pure TypeScript with zero external dependencies at runtime.

### What this tool does NOT do
- ❌ Execute arbitrary code on the server
- ❌ Access the file system
- ❌ Make authenticated API calls (no API keys required)
- ❌ Store any user data — all generation is stateless

### Deployment security
- Generated SNBT and KubeJS output is returned directly to the caller; not persisted
- Cloudflare Workers runs in a sandboxed edge environment
- No database, file storage, or session management is used

## Reporting a Vulnerability

Please report security issues via the repository's [Security Advisories](../../advisories/new) page.
