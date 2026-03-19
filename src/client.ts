const DROPBOX_API_BASE = "https://api.dropboxapi.com/2";
const DROPBOX_CONTENT_BASE = "https://content.dropboxapi.com/2";

export interface DropboxClientOptions {
  accessToken: string;
}

export interface DropboxListEntry {
  name: string;
  path_lower: string;
  path_display: string;
  ".tag": "file" | "folder";
  size?: number;
  server_modified?: string;
  content_hash?: string;
}

export interface DropboxListResult {
  entries: DropboxListEntry[];
  cursor?: string;
  has_more: boolean;
}

export interface DropboxShareLink {
  url: string;
  name: string;
  link_permissions?: Record<string, unknown>;
}

export interface DropboxSearchMatch {
  metadata: {
    metadata: DropboxListEntry;
  };
}

export interface DropboxSearchResult {
  matches: DropboxSearchMatch[];
  has_more: boolean;
  cursor?: string;
}

export interface DropboxDeleteResult {
  metadata: DropboxListEntry;
}

export class DropboxClient {
  private accessToken: string;

  constructor(options: DropboxClientOptions) {
    this.accessToken = options.accessToken;
  }

  private async request<T>(
    apiBase: string,
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    const url = `${apiBase}${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Dropbox API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  }

  async listFolder(
    path: string,
    recursive: boolean = false
  ): Promise<DropboxListResult> {
    return this.request<DropboxListResult>(
      DROPBOX_API_BASE,
      "/files/list_folder",
      {
        path: path || "",
        recursive,
        limit: 100,
      }
    );
  }

  async listFolderContinue(cursor: string): Promise<DropboxListResult> {
    return this.request<DropboxListResult>(
      DROPBOX_API_BASE,
      "/files/list_folder/continue",
      { cursor }
    );
  }

  async downloadFile(path: string): Promise<{ data: ArrayBuffer; name: string }> {
    const url = `${DROPBOX_CONTENT_BASE}/files/download`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Dropbox-API-Arg": JSON.stringify({ path }),
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Dropbox API error ${res.status}: ${text}`);
    }

    const apiResult = JSON.parse(res.headers.get("Dropbox-API-Result") || "{}");
    const data = await res.arrayBuffer();
    return { data, name: apiResult.name || path.split("/").pop() || "download" };
  }

  async uploadFile(
    path: string,
    content: Buffer | Uint8Array,
    mode: "add" | "overwrite" | "update" = "add"
  ): Promise<DropboxListEntry> {
    const url = `${DROPBOX_CONTENT_BASE}/files/upload`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          path,
          mode,
          autorename: true,
        }),
      },
      body: new Uint8Array(content),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Dropbox API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<DropboxListEntry>;
  }

  async createSharedLink(path: string): Promise<DropboxShareLink> {
    return this.request<DropboxShareLink>(
      DROPBOX_API_BASE,
      "/sharing/create_shared_link_with_settings",
      { path }
    );
  }

  async search(
    query: string,
    path?: string,
    maxResults: number = 20
  ): Promise<DropboxSearchResult> {
    return this.request<DropboxSearchResult>(
      DROPBOX_API_BASE,
      "/files/search_v2",
      {
        query,
        options: {
          path: path || "",
          max_results: maxResults,
        },
      }
    );
  }

  async deleteFile(path: string): Promise<DropboxDeleteResult> {
    return this.request<DropboxDeleteResult>(
      DROPBOX_API_BASE,
      "/files/delete_v2",
      { path }
    );
  }
}
