import { describe, it, expect } from "vitest";
import { titleToSlug } from "~/lib/slug";

describe("titleToSlug", () => {
  it("converts title to lowercase", () => {
    expect(titleToSlug("Hello World")).toBe("hello-world");
    expect(titleToSlug("UPPERCASE TITLE")).toBe("uppercase-title");
  });

  it("replaces spaces with hyphens", () => {
    expect(titleToSlug("my blog post")).toBe("my-blog-post");
  });

  it("removes special characters", () => {
    expect(titleToSlug("Hello, World!")).toBe("hello-world");
    expect(titleToSlug("What's New?")).toBe("what-s-new");
    expect(titleToSlug("C++ Programming")).toBe("c-programming");
  });

  it("handles multiple consecutive special chars", () => {
    expect(titleToSlug("hello---world")).toBe("hello-world");
    expect(titleToSlug("test   multiple   spaces")).toBe("test-multiple-spaces");
  });

  it("trims leading and trailing hyphens", () => {
    expect(titleToSlug("---hello---")).toBe("hello");
    expect(titleToSlug("  leading spaces")).toBe("leading-spaces");
    expect(titleToSlug("trailing spaces  ")).toBe("trailing-spaces");
  });

  it("handles numbers", () => {
    expect(titleToSlug("Top 10 Tips")).toBe("top-10-tips");
    expect(titleToSlug("2024 Year in Review")).toBe("2024-year-in-review");
  });

  it("handles empty string", () => {
    expect(titleToSlug("")).toBe("");
  });

  it("handles only special characters", () => {
    expect(titleToSlug("!@#$%")).toBe("");
  });

  it("handles realistic blog titles", () => {
    expect(titleToSlug("My Experience with Claude Code")).toBe(
      "my-experience-with-claude-code"
    );
    expect(titleToSlug("React Router v7: What's New?")).toBe(
      "react-router-v7-what-s-new"
    );
    expect(titleToSlug("TipTap Editor Setup (2024)")).toBe(
      "tiptap-editor-setup-2024"
    );
  });
});
