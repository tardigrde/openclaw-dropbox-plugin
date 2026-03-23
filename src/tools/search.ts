import { Type } from "@sinclair/typebox";
import type { DropboxClient } from "../client.js";
import { formatBytes } from "../utils.js";
import { jsonResult } from "../result.js";

export function createSearchTool(getClient: () => DropboxClient) {
  return {
    name: "dropbox_search",
    label: "Search Dropbox",
    description:
      "Search for files and folders in Dropbox by name. " +
      "Supports partial matches.",
    parameters: Type.Object({
      query: Type.String({
        description: "Search query string.",
      }),
      path: Type.Optional(
        Type.String({
          description:
            "Limit search to a specific folder path. Empty string searches everywhere.",
          default: "",
        })
      ),
      maxResults: Type.Optional(
        Type.Number({
          description: "Maximum number of results to return (default: 20)",
          default: 20,
        })
      ),
    }),
    async execute(
      _id: string,
      params: { query: string; path?: string; maxResults?: number }
    ) {
      const client = getClient();
      const path = params.path || "";
      const maxResults = params.maxResults ?? 20;

      const result = await client.search(params.query, path, maxResults);

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

      return jsonResult({
        matches,
        has_more: result.has_more,
        cursor: result.has_more ? result.cursor : undefined,
      });
    },
  };
}
