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

const MAX_DOWNLOAD_BYTES = 100 * 1024 * 1024; // 100 MB

export function registerDownloadTool(
  api: PluginApi,
  getClient: () => DropboxClient
): void {
  api.registerTool(
    "dropbox_download",
    {
      title: "Download Dropbox File",
      description:
        "Download a file from Dropbox. Returns the file content as a buffer. " +
        `Maximum file size: ${formatBytes(MAX_DOWNLOAD_BYTES)}.`,
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "Dropbox file path to download. Must start with '/'.",
          },
          maxBytes: {
            type: "number",
            description:
              `Maximum allowed file size in bytes (default: ${MAX_DOWNLOAD_BYTES})`,
            default: MAX_DOWNLOAD_BYTES,
          },
        },
        required: ["path"],
      },
    },
    async (params) => {
      const client = getClient();
      const path = params.path as string;
      const maxBytes = (params.maxBytes as number) ?? MAX_DOWNLOAD_BYTES;

      const { data, name } = await client.downloadFile(path);

      if (data.byteLength > maxBytes) {
        throw new Error(
          `File size ${formatBytes(data.byteLength)} exceeds limit ${formatBytes(maxBytes)}`
        );
      }

      return {
        name,
        size: formatBytes(data.byteLength),
        sizeBytes: data.byteLength,
        data: Buffer.from(data).toString("base64"),
        encoding: "base64",
      };
    }
  );
}
