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

export function registerSearchTool(
  api: PluginApi,
  getClient: () => DropboxClient
): void {
  api.registerTool(
    "dropbox_search",
    {
      title: "Search Dropbox",
      description:
        "Search for files and folders in Dropbox by name. " +
        "Supports partial matches.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query string.",
          },
          path: {
            type: "string",
            description:
              "Limit search to a specific folder path. Empty string searches everywhere.",
            default: "",
          },
          maxResults: {
            type: "number",
            description: "Maximum number of results to return (default: 20)",
            default: 20,
          },
        },
        required: ["query"],
      },
    },
    async (params) => {
      const client = getClient();
      const query = params.query as string;
      const path = (params.path as string) || "";
      const maxResults = (params.maxResults as number) ?? 20;

      const result = await client.search(query, path, maxResults);

      const matches = result.matches.map((match) => {
        const meta = match.metadata.metadata;
        return {
          name: meta.name,
          path: meta.path_display,
          type: meta[".tag"],
          size: meta.size ? formatBytes(meta.size) : undefined,
          modified: meta.server_modified || undefined,
        };
      });

      return {
        matches,
        has_more: result.has_more,
        cursor: result.has_more ? result.cursor : undefined,
      };
    }
  );
}
