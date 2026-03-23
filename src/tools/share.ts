import { Type } from "@sinclair/typebox";
import type { DropboxClient } from "../client.js";
import { jsonResult } from "../result.js";

export function createShareTool(getClient: () => DropboxClient) {
  return {
    name: "dropbox_share",
    label: "Share Dropbox File",
    description:
      "Create a shared link for a Dropbox file or folder. " +
      "Returns a publicly accessible URL. " +
      "Note: shared links are view-only by default.",
    parameters: Type.Object({
      path: Type.String({
        description:
          "Dropbox path of the file or folder to share. Must start with '/'.",
      }),
    }),
    async execute(_id: string, params: { path: string }) {
      const client = getClient();
      const result = await client.createSharedLink(params.path);

      return jsonResult({
        url: result.url,
        name: result.name,
      });
    },
  };
}
