# @tardigrde/dropbox

OpenClaw plugin that provides Dropbox file management tools — list, download, upload, share, search, and delete files.

## Prerequisites

1. **Dropbox App** — Create an app at [Dropbox App Console](https://www.dropbox.com/developers/apps)
   - Choose "Full Dropbox" or "App folder" access
   - Generate an access token
2. **OpenClaw** installed and configured

## Installation

```bash
openclaw plugins install @tardigrde/dropbox
```

## Configuration

Set your Dropbox access token as an environment variable:

```bash
export DROPBOX_ACCESS_TOKEN="sl.xxxxxxxxxxxxxxxxxxxxx"
```

Or add it to your OpenClaw configuration in `openclaw.json`:

```json
{
  "plugins": {
    "dropbox": {
      "env": {
        "DROPBOX_ACCESS_TOKEN": "sl.xxxxxxxxxxxxxxxxxxxxx"
      },
      "config": {
        "maxDownloadBytes": 104857600
      }
    }
  }
}
```

## Tools

### `dropbox_list`

List the contents of a Dropbox folder.

**Parameters:**
- `path` (string, required) — Folder path (e.g., `/Documents`, `""` for root)
- `recursive` (boolean, optional) — List subdirectories recursively

**Returns:** Array of entries with `name`, `path`, `type` (file/folder), `size`, `modified`.

```
→ dropbox_list path="/Documents"
← [name: "report.pdf", type: "file", size: "2.3 MB", ...]
```

### `dropbox_download`

Download a file from Dropbox. Returns base64-encoded content.

**Parameters:**
- `path` (string, required) — File path (e.g., `/Documents/report.pdf`)
- `maxBytes` (number, optional) — Max allowed file size in bytes

**Returns:** `name`, `size`, `data` (base64), `encoding`.

```
→ dropbox_download path="/Documents/report.pdf"
← [name: "report.pdf", size: "2.3 MB", data: "JVBERi0...", encoding: "base64"]
```

### `dropbox_upload`

Upload a file to Dropbox.

**Parameters:**
- `path` (string, required) — Destination path including filename (e.g., `/Documents/new-report.pdf`)
- `content` (string, required) — File content as base64-encoded string
- `mode` (string, optional) — `"add"` (default) or `"overwrite"`

**Returns:** `name`, `path`, `size`, `modified`.

```
→ dropbox_upload path="/Documents/new-report.pdf" content="SGVsbG8=" mode="add"
← [name: "new-report.pdf", path: "/Documents/new-report.pdf", ...]
```

### `dropbox_share`

Create a public share link for a file or folder.

**Parameters:**
- `path` (string, required) — Path to share (e.g., `/Documents/report.pdf`)

**Returns:** `url` (public link), `name`.

```
→ dropbox_share path="/Documents/report.pdf"
← [url: "https://www.dropbox.com/s/...", name: "report.pdf"]
```

### `dropbox_search`

Search for files and folders by name.

**Parameters:**
- `query` (string, required) — Search query
- `path` (string, optional) — Limit search to a folder
- `maxResults` (number, optional) — Max results to return (default: 20)

**Returns:** Array of `matches` with `name`, `path`, `type`, `size`.

```
→ dropbox_search query="report"
← [matches: [{name: "report.pdf", path: "/Documents/report.pdf", ...}]]
```

### `dropbox_delete`

Delete a file or folder from Dropbox. The item is moved to trash.

**Parameters:**
- `path` (string, required) — Path to delete (e.g., `/Documents/old-report.pdf`)

**Returns:** `deleted` (boolean), `name`, `path`, `type`.

```
→ dropbox_delete path="/Documents/old-report.pdf"
← [deleted: true, name: "old-report.pdf", type: "file"]
```

## Dropbox App Setup

1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Click **Create App**
3. Choose **Scoped access** and select access type:
   - **Full Dropbox** — access to entire Dropbox (recommended for personal use)
   - **App folder** — access limited to a single folder
4. Name your app (e.g., `openclaw-dropbox`)
5. In **Permissions** tab, enable:
   - `files.metadata.read`
   - `files.content.read`
   - `files.content.write`
   - `sharing.write`
6. Click **Submit**
7. In **Settings** tab, click **Generate access token**
8. Copy the token and set it as `DROPBOX_ACCESS_TOKEN`

## Troubleshooting

**"DROPBOX_ACCESS_TOKEN environment variable is required"**
- Set the environment variable before starting OpenClaw

**"Dropbox API error 401"**
- Access token is invalid or expired. Generate a new one from the App Console

**"Dropbox API error 409"**
- Path not found. Verify the path starts with `/` and the file exists

**"File size exceeds limit"**
- The file is larger than `maxDownloadBytes`. Increase the limit in config or download a smaller file

**Upload fails with large files**
- This plugin uses the simple upload endpoint (up to 150 MB). For larger files, chunked upload is needed (not yet implemented)

## Development

```bash
npm ci              # Install dependencies
npm run typecheck   # Type-check without emitting
npx tsc             # Full compile to dist/
npm test            # Run vitest (watch mode)
npm test -- --run   # Run vitest once
```

## License

MIT
