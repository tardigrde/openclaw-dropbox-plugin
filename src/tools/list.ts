import { Type } from "@sinclair/typebox";
import type { DropboxClient } from "../client.js";
import { formatBytes } from "../utils.js";
import { jsonResult } from "../result.js";

export function createListTool(getClient: () => DropboxClient) {
  return {
    name: "dropbox_list",
    label: "List Dropbox Folder",
    description:
      "List the contents of a Dropbox folder. Returns file names, sizes, and types.",
    parameters: Type.Object({
      path: Type.String({
        description:
          "Dropbox folder path to list (use '' or '/' for root). Must start with '/'.",
      }),
      recursive: Type.Optional(
        Type.Boolean({
          description: "List contents recursively (default: false)",
          default: false,
        })
      ),
    }),
    async execute(_id: string, params: { path: string; recursive?: boolean }) {
      const client = getClient();
      const path = params.path || "";
      const recursive = params.recursive ?? false;

      const result = await client.listFolder(path, recursive);

      const entries = result.entries.map((entry) => ({
        name: entry.name,
        path: entry.path_display,
        type: entry[".tag"],
        size: entry.size ? formatBytes(entry.size) : undefined,
        modified: entry.server_modified || undefined,
      }));

      return jsonResult({
        entries,
        has_more: result.has_more,
        cursor: result.has_more ? result.cursor : undefined,
      });
    },
  };
}
