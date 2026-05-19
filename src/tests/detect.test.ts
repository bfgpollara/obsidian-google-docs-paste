import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isAppleRichTextHtml, isGoogleDocsHtml, isSupportedPasteHtml } from "../detect";

function fixture(name: string): string {
  return readFileSync(join(__dirname, "fixtures", name), "utf8");
}

describe("isGoogleDocsHtml", () => {
  it.each([
    "inline-formatting.html",
    "headings-and-lists.html",
    "links-and-redirects.html",
    "table.html",
  ])("detects Google Docs HTML in %s", (name) => {
    expect(isGoogleDocsHtml(fixture(name))).toBe(true);
  });

  it("returns false for non-Docs HTML", () => {
    expect(isGoogleDocsHtml(fixture("non-docs.html"))).toBe(false);
  });

  it("returns false for plain text", () => {
    expect(isGoogleDocsHtml("just some text")).toBe(false);
  });

  it("does not match Apple iOS HTML as Google Docs", () => {
    expect(isGoogleDocsHtml(fixture("apple-ios.html"))).toBe(false);
  });
});

describe("isAppleRichTextHtml", () => {
  it("detects iOS NSAttributedString HTML", () => {
    expect(isAppleRichTextHtml(fixture("apple-ios.html"))).toBe(true);
  });

  it("does not match Google Docs HTML", () => {
    expect(isAppleRichTextHtml(fixture("inline-formatting.html"))).toBe(false);
  });

  it("does not match plain HTML", () => {
    expect(isAppleRichTextHtml(fixture("non-docs.html"))).toBe(false);
  });
});

describe("isSupportedPasteHtml", () => {
  it("matches both Google Docs and Apple iOS HTML", () => {
    expect(isSupportedPasteHtml(fixture("inline-formatting.html"))).toBe(true);
    expect(isSupportedPasteHtml(fixture("apple-ios.html"))).toBe(true);
  });

  it("does not match unrelated HTML", () => {
    expect(isSupportedPasteHtml(fixture("non-docs.html"))).toBe(false);
  });
});
