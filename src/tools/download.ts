import { Type } from "@sinclair/typebox";
import type { DropboxClient } from "../client.js";
import { formatBytes } from "../utils.js";
import { jsonResult } from "../result.js";

const MAX_DOWNLOAD_BYTES = 100 * 1024 * 1024; // 100 MB

export function createDownloadTool(getClient: () => DropboxClient) {
  return {
    name: "dropbox_download",
    label: "Download Dropbox File",
    description:
      "Download a file from Dropbox. Returns the file content as base64. " +
      `Maximum file size: ${formatBytes(MAX_DOWNLOAD_BYTES)}.`,
    parameters: Type.Object({
      path: Type.String({
        description: "Dropbox file path to download. Must start with '/'.",
      }),
      maxBytes: Type.Optional(
        Type.Number({
          description: `Maximum allowed file size in bytes (default: ${MAX_DOWNLOAD_BYTES})`,
          default: MAX_DOWNLOAD_BYTES,
        })
      ),
    }),
    async execute(
      _id: string,
      params: { path: string; maxBytes?: number }
    ) {
      const client = getClient();
      const maxBytes = params.maxBytes ?? MAX_DOWNLOAD_BYTES;

      const { data, name } = await client.downloadFile(params.path);

      if (data.byteLength > maxBytes) {
        throw new Error(
          `File size ${formatBytes(data.byteLength)} exceeds limit ${formatBytes(maxBytes)}`
        );
      }

      return jsonResult({
        name,
        size: formatBytes(data.byteLength),
        sizeBytes: data.byteLength,
        data: Buffer.from(data).toString("base64"),
        encoding: "base64",
      });
    },
  };
}
