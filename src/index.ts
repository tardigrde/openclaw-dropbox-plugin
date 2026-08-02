import { definePluginEntry, type OpenClawPluginDefinition } from "openclaw/plugin-sdk/plugin-entry";
import { DropboxClient } from "./client.js";
import { createListTool } from "./tools/list.js";
import { createDownloadTool } from "./tools/download.js";
import { createUploadTool } from "./tools/upload.js";
import { createShareTool } from "./tools/share.js";
import { createSearchTool } from "./tools/search.js";
import { createDeleteTool } from "./tools/delete.js";

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

const plugin: OpenClawPluginDefinition = definePluginEntry({
  id: "dropbox",
  name: "Dropbox",
  description:
    "File management tools for Dropbox — list, download, upload, share, search, and delete",
  register(api) {
    api.registerTool(createListTool(getClient));
    api.registerTool(createDownloadTool(getClient));
    api.registerTool(createUploadTool(getClient));
    api.registerTool(createShareTool(getClient));
    api.registerTool(createSearchTool(getClient));
    api.registerTool(createDeleteTool(getClient));
  },
});

export default plugin;
