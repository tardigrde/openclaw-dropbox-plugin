import { DropboxClient } from "./client.js";
import { registerListTool } from "./tools/list.js";
import { registerDownloadTool } from "./tools/download.js";
import { registerUploadTool } from "./tools/upload.js";
import { registerShareTool } from "./tools/share.js";
import { registerSearchTool } from "./tools/search.js";
import { registerDeleteTool } from "./tools/delete.js";

interface PluginApi {
  registerTool(
    name: string,
    schema: Record<string, unknown>,
    handler: (params: Record<string, unknown>) => Promise<Record<string, unknown>>
  ): void;
}

interface PluginContext {
  api: PluginApi;
  config?: Record<string, unknown>;
}

let client: DropboxClient | null = null;

function getClient(): DropboxClient {
  if (!client) {
    const token = process.env.DROPBOX_ACCESS_TOKEN;
    if (!token) {
      throw new Error(
        "DROPBOX_ACCESS_TOKEN environment variable is required. " +
          "Set it to your Dropbox access token."
      );
    }
    client = new DropboxClient({ accessToken: token });
  }
  return client;
}

export default function register(context: PluginContext): void {
  const { api } = context;

  registerListTool(api, getClient);
  registerDownloadTool(api, getClient);
  registerUploadTool(api, getClient);
  registerShareTool(api, getClient);
  registerSearchTool(api, getClient);
  registerDeleteTool(api, getClient);
}
