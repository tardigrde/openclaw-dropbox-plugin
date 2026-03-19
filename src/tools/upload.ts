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

export function registerUploadTool(
  api: PluginApi,
  getClient: () => DropboxClient
): void {
  api.registerTool(
    "dropbox_upload",
    {
      title: "Upload to Dropbox",
      description:
        "Upload a file to Dropbox. Content should be provided as a base64-encoded string.",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "Dropbox destination path including filename. Must start with '/'.",
          },
          content: {
            type: "string",
            description: "File content as a base64-encoded string.",
          },
          mode: {
            type: "string",
            enum: ["add", "overwrite"],
            description:
              "Upload mode: 'add' adds new or renames if exists, 'overwrite' replaces (default: 'add')",
            default: "add",
          },
        },
        required: ["path", "content"],
      },
    },
    async (params) => {
      const client = getClient();
      const path = params.path as string;
      const contentBase64 = params.content as string;
      const mode = (params.mode as string) ?? "add";

      const buffer = Buffer.from(contentBase64, "base64");

      const result = await client.uploadFile(
        path,
        buffer,
        mode as "add" | "overwrite"
      );

      return {
        name: result.name,
        path: result.path_display,
        size: result.size ? formatBytes(result.size) : undefined,
        sizeBytes: result.size,
        modified: result.server_modified,
      };
    }
  );
}
