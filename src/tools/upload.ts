import { Type } from "@sinclair/typebox";
import type { DropboxClient } from "../client.js";
import { formatBytes } from "../utils.js";
import { jsonResult } from "../result.js";

export function createUploadTool(getClient: () => DropboxClient) {
  return {
    name: "dropbox_upload",
    label: "Upload to Dropbox",
    description:
      "Upload a file to Dropbox. Content should be provided as a base64-encoded string.",
    parameters: Type.Object({
      path: Type.String({
        description:
          "Dropbox destination path including filename. Must start with '/'.",
      }),
      content: Type.String({
        description: "File content as a base64-encoded string.",
      }),
      mode: Type.Optional(
        Type.String({
          description:
            "Upload mode: 'add' adds new or renames if exists, 'overwrite' replaces (default: 'add')",
          enum: ["add", "overwrite"],
          default: "add",
        })
      ),
    }),
    async execute(
      _id: string,
      params: { path: string; content: string; mode?: string }
    ) {
      const client = getClient();
      const buffer = Buffer.from(params.content, "base64");
      const mode = (params.mode ?? "add") as "add" | "overwrite";

      const result = await client.uploadFile(params.path, buffer, mode);

      return jsonResult({
        name: result.name,
        path: result.path_display,
        size: result.size ? formatBytes(result.size) : undefined,
        sizeBytes: result.size,
        modified: result.server_modified,
      });
    },
  };
}
