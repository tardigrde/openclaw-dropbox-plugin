import { describe, it, expect } from "vitest";
import { formatBytes } from "../src/utils.js";

describe("formatBytes", () => {
  it("returns 0 B for zero bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes without decimals", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1048575)).toBe("1024.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1048576)).toBe("1.0 MB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });

  it("formats gigabytes", () => {
    expect(formatBytes(1073741824)).toBe("1.0 GB");
    expect(formatBytes(2 * 1024 * 1024 * 1024)).toBe("2.0 GB");
  });

  it("formats terabytes", () => {
    expect(formatBytes(1099511627776)).toBe("1.0 TB");
  });
});
