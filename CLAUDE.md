# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run typecheck   # Type-check without emitting (runs tsc --noEmit)
npm ci              # Install dependencies
npx tsc             # Full compile to dist/
```

```bash
npm test             # Run vitest (watch mode)
npm test -- --run   # Run vitest once
```

Tests live in `tests/` — `client.test.ts` mocks `globalThis.fetch` to unit-test `DropboxClient`, and `utils.test.ts` covers `formatBytes`. CI only runs typecheck on PRs to `main` (tests are not yet in CI).

## Architecture

This is an **OpenClaw plugin** that wraps the Dropbox API v2 and exposes 6 tools to an AI agent runtime.

### Plugin entry points

- `index.ts` (root) — re-exports `src/index.ts`
- `src/index.ts` — validates `DROPBOX_ACCESS_TOKEN` env var, lazy-initializes a `DropboxClient` singleton via `getClient()`, then registers all 6 tools with the OpenClaw plugin API via `registerXxxTool(ctx)` calls

### Core components

- **`src/client.ts`** — `DropboxClient` class: wraps Dropbox API v2 (`api.dropboxapi.com` and `content.dropboxapi.com`). All HTTP is done via a private `request<T>()` method that injects Bearer auth and handles errors. Methods: `listFolder`, `listFolderContinue`, `downloadFile`, `uploadFile`, `createSharedLink`, `search`, `deleteFile`.
- **`src/tools/`** — One file per tool (`list`, `download`, `upload`, `share`, `search`, `delete`). Each exports a `registerXxxTool(ctx)` function that calls `ctx.api.registerTool(...)` with a title, description, `inputSchema` (TypeBox), and async handler.
- **`src/utils.ts`** — `formatBytes()` helper only.
- **`openclaw.plugin.json`** — Plugin metadata and config schema. The only optional config key is `maxDownloadBytes` (default 100MB).

### Tool pattern

Each tool in `src/tools/` follows the same structure:
1. Define input schema with TypeBox (`Type.Object({...})`)
2. Export `registerXxxTool(ctx: PluginContext)` that calls `ctx.api.registerTool({ name, title, description, inputSchema, handler })`
3. In the handler: call `getClient()` to get the singleton, call a `DropboxClient` method, format and return a result object

### Module system

The project uses **ESNext modules** (`"module": "ESNext"`, `"moduleResolution": "bundler"`). Internal imports use `.js` extensions (even though source files are `.ts`), which is standard for ESM TypeScript.

### Release process

Releases are automated via `release-please` (push to `main` → release PR created → merge → GitHub Release created → npm publish triggered via `publish.yml`). The `NPM_TOKEN` secret is required for publishing.
