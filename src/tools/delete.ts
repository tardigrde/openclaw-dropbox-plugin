import type { DropboxClient } from "../client.js";

interface PluginApi {
  registerTool(
    name: string,
    schema: Record<string, unknown>,
    handler: (params: Record<string, unknown>) => Promise<Record<string, unknown>>
  ): void;
}

export function registerDeleteTool(
  api: PluginApi,
  getClient: () => DropboxClient
): void {
  api.registerTool(
    "dropbox_delete",
    {
      title: "Delete Dropbox File or Folder",
      description:
        "Delete a file or folder from Dropbox. " +
        "The item is moved to the Dropbox trash. " +
        "Warning: this operation is destructive — confirm the path before use.",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "Dropbox path of the file or folder to delete. Must start with '/'.",
          },
        },
        required: ["path"],
      },
    },
    async (params) => {
      const client = getClient();
      const path = params.path as string;

      const result = await client.deleteFile(path);

      return {
        deleted: true,
        name: result.metadata.name,
        path: result.metadata.path_display,
        type: result.metadata[".tag"],
      };
    }
  );
}
