import { describe, it, expect, vi, beforeEach } from "vitest";
import { DropboxClient } from "../src/client.js";

const client = new DropboxClient({ accessToken: "fake-token" });

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("DropboxClient", () => {
  describe("listFolder", () => {
    it("calls the list_folder endpoint and returns entries", async () => {
      const mockResult = {
        entries: [
          {
            name: "file.txt",
            path_lower: "/file.txt",
            path_display: "/file.txt",
            ".tag": "file",
            size: 1024,
          },
        ],
        has_more: false,
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResult), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const result = await client.listFolder("/test");

      expect(fetch).toHaveBeenCalledWith(
        "https://api.dropboxapi.com/2/files/list_folder",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer fake-token",
          }),
        })
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("listFolderContinue", () => {
    it("calls the list_folder/continue endpoint with cursor", async () => {
      const mockResult = {
        entries: [],
        has_more: false,
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResult), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const result = await client.listFolderContinue("abc123");

      expect(fetch).toHaveBeenCalledWith(
        "https://api.dropboxapi.com/2/files/list_folder/continue",
        expect.objectContaining({ method: "POST" })
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("downloadFile", () => {
    it("downloads a file and returns data with name", async () => {
      const fileContent = new ArrayBuffer(512);
      const headers = new Headers();
      headers.set("Dropbox-API-Result", JSON.stringify({ name: "doc.pdf" }));

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(fileContent, {
          status: 200,
          headers,
        })
      );

      const result = await client.downloadFile("/doc.pdf");

      expect(fetch).toHaveBeenCalledWith(
        "https://content.dropboxapi.com/2/files/download",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer fake-token",
            "Dropbox-API-Arg": JSON.stringify({ path: "/doc.pdf" }),
          }),
        })
      );
      expect(result.name).toBe("doc.pdf");
      expect(result.data.byteLength).toBe(512);
    });
  });

  describe("uploadFile", () => {
    it("uploads a file and returns the entry", async () => {
      const mockEntry = {
        name: "upload.txt",
        path_lower: "/upload.txt",
        path_display: "/upload.txt",
        ".tag": "file",
        size: 100,
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockEntry), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const result = await client.uploadFile(
        "/upload.txt",
        Buffer.from("hello")
      );

      expect(fetch).toHaveBeenCalledWith(
        "https://content.dropboxapi.com/2/files/upload",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer fake-token",
            "Content-Type": "application/octet-stream",
          }),
        })
      );
      expect(result).toEqual(mockEntry);
    });
  });

  describe("createSharedLink", () => {
    it("calls the sharing endpoint and returns a link", async () => {
      const mockLink = {
        url: "https://dropbox.com/s/abc123/file.txt",
        name: "file.txt",
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockLink), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const result = await client.createSharedLink("/file.txt");

      expect(fetch).toHaveBeenCalledWith(
        "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings",
        expect.objectContaining({ method: "POST" })
      );
      expect(result).toEqual(mockLink);
    });
  });

  describe("search", () => {
    it("calls the search_v2 endpoint and returns matches", async () => {
      const mockResult = {
        matches: [
          {
            metadata: {
              metadata: {
                name: "report.pdf",
                path_lower: "/report.pdf",
                path_display: "/report.pdf",
                ".tag": "file",
                size: 2048,
              },
            },
          },
        ],
        has_more: false,
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResult), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const result = await client.search("report", "/docs", 10);

      expect(fetch).toHaveBeenCalledWith(
        "https://api.dropboxapi.com/2/files/search_v2",
        expect.objectContaining({ method: "POST" })
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("deleteFile", () => {
    it("calls the delete_v2 endpoint and returns metadata", async () => {
      const mockResult = {
        metadata: {
          name: "old.txt",
          path_lower: "/old.txt",
          path_display: "/old.txt",
          ".tag": "file",
        },
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResult), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const result = await client.deleteFile("/old.txt");

      expect(fetch).toHaveBeenCalledWith(
        "https://api.dropboxapi.com/2/files/delete_v2",
        expect.objectContaining({ method: "POST" })
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("error handling", () => {
    it("throws on non-ok response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Bad request", { status: 400 })
      );

      await expect(client.listFolder("/bad")).rejects.toThrow(
        "Dropbox API error 400: Bad request"
      );
    });
  });
});
