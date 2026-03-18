# Dropbox Plugin — Agent Skill Guide

Use these tools to interact with a user's Dropbox account.

## Available Tools

| Tool | Purpose |
|---|---|
| `dropbox_list` | List files and folders in a directory |
| `dropbox_download` | Download a file's content |
| `dropbox_upload` | Upload content as a file |
| `dropbox_share` | Create a public share link |
| `dropbox_search` | Search for files by name |
| `dropbox_delete` | Delete a file or folder |

## Path Conventions

- **All paths must start with `/`** (e.g., `/Documents/report.pdf`)
- Use `/` or empty string `""` for the root folder
- Paths are case-insensitive in Dropbox

## When to Use Each Tool

### Listing files
Use `dropbox_list` when you need to:
- Explore what's in a folder before operating on its contents
- Verify a file exists before downloading or sharing
- Check file sizes before downloading (large files may exceed limits)

### Downloading files
Use `dropbox_download` when you need to:
- Read file content for analysis or transformation
- Process text, code, or data files
- Check file contents before uploading elsewhere

**Size limit:** Default 100 MB. Check `size` field in `dropbox_list` output first.

### Uploading files
Use `dropbox_upload` when you need to:
- Save generated or transformed content to Dropbox
- Create new files from scratch
- Replace existing file content

**Mode:**
- `add` (default) — creates new file or auto-renames if conflict
- `overwrite` — replaces existing file

### Sharing files
Use `dropbox_share` when you need to:
- Generate a public link to send to others
- Provide downloadable access to a file

**Etiquette:** Shared links are view-only. Don't share files containing sensitive data without explicit user confirmation.

### Searching files
Use `dropbox_search` when you need to:
- Find a file whose exact path is unknown
- Locate files matching a name pattern
- Discover all files of a certain type

### Deleting files
Use `dropbox_delete` when you need to:
- Remove unwanted files or folders
- Clean up after uploading replacement files

**Caution:** Deleting moves the item to trash (recoverable within 30 days). Always confirm the path with the user before deleting, especially for folders.

## Common Workflows

### Upload a file and share it
1. `dropbox_upload` with `mode: "add"` (or `"overwrite"` if replacing)
2. `dropbox_share` with the returned path

### Find and download a specific file
1. `dropbox_search` with the filename
2. `dropbox_download` with the full path from search results

### Replace an existing file
1. `dropbox_upload` with `mode: "overwrite"` and the target path

### Clean up after work
1. `dropbox_list` to verify contents
2. `dropbox_delete` with confirmation of the correct path
