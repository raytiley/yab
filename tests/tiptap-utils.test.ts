import { describe, it, expect } from "vitest";
import {
  cn,
  formatShortcutKey,
  parseShortcutKeys,
  isValidPosition,
  isAllowedUri,
  sanitizeUrl,
  MAX_FILE_SIZE,
} from "~/lib/tiptap-utils";

describe("cn (classname utility)", () => {
  it("joins multiple class names", () => {
    expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
  });

  it("filters out falsy values", () => {
    expect(cn("foo", false, "bar", null, undefined, "baz")).toBe("foo bar baz");
  });

  it("returns empty string for no truthy classes", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});

describe("formatShortcutKey", () => {
  it("returns Mac symbols for Mac platform", () => {
    expect(formatShortcutKey("mod", true)).toBe("⌘");
    expect(formatShortcutKey("ctrl", true)).toBe("⌃");
    expect(formatShortcutKey("alt", true)).toBe("⌥");
    expect(formatShortcutKey("shift", true)).toBe("⇧");
  });

  it("capitalizes unknown keys on Mac", () => {
    expect(formatShortcutKey("a", true)).toBe("A");
    expect(formatShortcutKey("enter", true)).toBe("⏎");
  });

  it("capitalizes keys on non-Mac", () => {
    expect(formatShortcutKey("ctrl", false)).toBe("Ctrl");
    expect(formatShortcutKey("alt", false)).toBe("Alt");
  });

  it("respects capitalize option", () => {
    expect(formatShortcutKey("ctrl", false, false)).toBe("ctrl");
    expect(formatShortcutKey("a", true, false)).toBe("a");
  });
});

describe("isValidPosition", () => {
  it("returns true for valid positions", () => {
    expect(isValidPosition(0)).toBe(true);
    expect(isValidPosition(1)).toBe(true);
    expect(isValidPosition(100)).toBe(true);
  });

  it("returns false for invalid positions", () => {
    expect(isValidPosition(null)).toBe(false);
    expect(isValidPosition(undefined)).toBe(false);
    expect(isValidPosition(-1)).toBe(false);
  });
});

describe("isAllowedUri", () => {
  it("allows standard protocols", () => {
    expect(isAllowedUri("http://example.com")).toBeTruthy();
    expect(isAllowedUri("https://example.com")).toBeTruthy();
    expect(isAllowedUri("mailto:test@example.com")).toBeTruthy();
    expect(isAllowedUri("tel:+1234567890")).toBeTruthy();
  });

  it("allows relative URLs", () => {
    expect(isAllowedUri("/path/to/page")).toBeTruthy();
    expect(isAllowedUri("page.html")).toBeTruthy();
  });

  it("allows empty/undefined URIs", () => {
    expect(isAllowedUri("")).toBeTruthy();
    expect(isAllowedUri(undefined)).toBeTruthy();
  });

  it("allows custom protocols when provided", () => {
    expect(isAllowedUri("custom://foo", ["custom"])).toBeTruthy();
    expect(isAllowedUri("git://repo", [{ scheme: "git" }])).toBeTruthy();
  });
});

describe("sanitizeUrl", () => {
  it("returns valid URLs unchanged", () => {
    expect(sanitizeUrl("https://example.com", "https://base.com")).toBe(
      "https://example.com/"
    );
  });

  it("resolves relative URLs against base", () => {
    expect(sanitizeUrl("/page", "https://base.com")).toBe(
      "https://base.com/page"
    );
  });

  it("returns # for invalid URLs", () => {
    expect(sanitizeUrl("javascript:alert(1)", "https://base.com")).toBe("#");
  });
});

describe("MAX_FILE_SIZE", () => {
  it("is 10MB", () => {
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
  });
});
