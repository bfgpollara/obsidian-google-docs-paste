import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isGoogleDocsHtml } from "../detect";

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
});
