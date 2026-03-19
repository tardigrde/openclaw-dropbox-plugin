import { Type } from "@sinclair/typebox";
import type { DropboxClient } from "../client.js";

interface PluginApi {
  registerTool(
    name: string,
    schema: Record<string, unknown>,
    handler: (params: Record<string, unknown>) => Promise<Record<string, unknown>>
  ): void;
}

export function registerShareTool(
  api: PluginApi,
  getClient: () => DropboxClient
): void {
  api.registerTool(
    "dropbox_share",
    {
      title: "Share Dropbox File",
      description:
        "Create a shared link for a Dropbox file or folder. " +
        "Returns a publicly accessible URL. " +
        "Note: shared links are view-only by default.",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "Dropbox path of the file or folder to share. Must start with '/'.",
          },
        },
        required: ["path"],
      },
    },
    async (params) => {
      const client = getClient();
      const path = params.path as string;

      const result = await client.createSharedLink(path);

      return {
        url: result.url,
        name: result.name,
      };
    }
  );
}
