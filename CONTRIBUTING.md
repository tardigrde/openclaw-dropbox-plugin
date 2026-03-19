# Contributing to @tardigrde/dropbox

## Development Setup

```bash
git clone https://github.com/tardigrde/openclaw-dropbox-plugin.git
cd openclaw-dropbox-plugin
npm install
```

## Typechecking

```bash
npm run typecheck
# or
npx tsc --noEmit
```

## Running Locally

Set your Dropbox access token and point OpenClaw at the local plugin:

```bash
export DROPBOX_ACCESS_TOKEN="sl.xxxxxxxxxxxxxxxxxxxxx"
openclaw plugins install ./  # from the repo root
```

## Project Structure

- `src/client.ts` — Dropbox API client
- `src/utils.ts` — Shared utilities
- `src/tools/` — One file per tool (list, download, upload, share, search, delete)
- `src/index.ts` — Plugin entry point that registers all tools

## Adding a New Tool

1. Create `src/tools/<name>.ts` exporting a `registerXxxTool(api, getClient)` function
2. Import and call it in `src/index.ts`
3. Add docs to `README.md` and guidance to `skills/dropbox/SKILL.md`

## Pull Requests

1. Fork the repo and create a feature branch
2. Make your changes with clear commits
3. Ensure `npx tsc --noEmit` passes
4. Open a PR against `main`

## Publishing (maintainers only)

See the PR description or `README.md` for npm publish instructions.
