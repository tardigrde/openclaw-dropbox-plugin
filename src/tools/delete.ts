import { Type } from "@sinclair/typebox";
import type { DropboxClient } from "../client.js";
import { jsonResult } from "../result.js";

export function createDeleteTool(getClient: () => DropboxClient) {
  return {
    name: "dropbox_delete",
    label: "Delete Dropbox File or Folder",
    description:
      "Delete a file or folder from Dropbox. " +
      "The item is moved to the Dropbox trash. " +
      "Warning: this operation is destructive — confirm the path before use.",
    parameters: Type.Object({
      path: Type.String({
        description:
          "Dropbox path of the file or folder to delete. Must start with '/'.",
      }),
    }),
    async execute(_id: string, params: { path: string }) {
      const client = getClient();
      const result = await client.deleteFile(params.path);

      return jsonResult({
        deleted: true,
        name: result.metadata.name,
        path: result.metadata.path_display,
        type: result.metadata[".tag"],
      });
    },
  };
}
