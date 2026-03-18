import { Type } from "@sinclair/typebox";
import type { DropboxClient } from "../client.js";
import { formatBytes } from "../utils.js";

interface PluginApi {
  registerTool(
    name: string,
    schema: Record<string, unknown>,
    handler: (params: Record<string, unknown>) => Promise<Record<string, unknown>>
  ): void;
}

export function registerListTool(
  api: PluginApi,
  getClient: () => DropboxClient
): void {
  api.registerTool(
    "dropbox_list",
    {
      title: "List Dropbox Folder",
      description:
        "List the contents of a Dropbox folder. Returns file names, sizes, and types.",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "Dropbox folder path to list (use '' or '/' for root). Must start with '/'.",
          },
          recursive: {
            type: "boolean",
            description: "List contents recursively (default: false)",
            default: false,
          },
        },
        required: ["path"],
      },
    },
    async (params) => {
      const client = getClient();
      const path = (params.path as string) || "";
      const recursive = (params.recursive as boolean) ?? false;

      const result = await client.listFolder(path, recursive);

      const entries = result.entries.map((entry) => ({
        name: entry.name,
        path: entry.path_display,
        type: entry[".tag"],
        size: entry.size ? formatBytes(entry.size) : undefined,
        modified: entry.server_modified || undefined,
      }));

      return {
        entries,
        has_more: result.has_more,
        cursor: result.has_more ? result.cursor : undefined,
      };
    }
  );
}
