import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { normalizeGoogleDocsHtml } from "../normalize";
import { DEFAULT_SETTINGS } from "../settings";

function fixture(name: string): string {
  return readFileSync(join(__dirname, "fixtures", name), "utf8");
}

beforeAll(() => {
  // happy-dom provides DOMParser in node tests via vitest config
});

describe("normalizeGoogleDocsHtml — inline", () => {
  const out = () => normalizeGoogleDocsHtml(fixture("inline-formatting.html"), DEFAULT_SETTINGS);

  it("unwraps the outer fake-bold <b>", () => {
    expect(out()).not.toMatch(/<b[^>]*docs-internal-guid/);
  });

  it("wraps bold text in <strong>", () => {
    expect(out()).toMatch(/<strong>[^<]*Bold[^<]*<\/strong>/);
  });

  it("wraps italic text in <em>", () => {
    expect(out()).toMatch(/<em>[^<]*italic[^<]*<\/em>/);
  });

  it("wraps underline in <u>", () => {
    expect(out()).toMatch(/<u>[^<]*underline[^<]*<\/u>/);
  });

  it("wraps strikethrough in <s>", () => {
    expect(out()).toMatch(/<s>[^<]*strike[^<]*<\/s>/);
  });

  it("strips the inline style attribute when no color/highlight kept", () => {
    expect(out()).not.toMatch(/font-weight:\s*\d/);
    expect(out()).not.toMatch(/font-family:/);
  });
});

describe("normalizeGoogleDocsHtml — blocks", () => {
  const out = () => normalizeGoogleDocsHtml(fixture("headings-and-lists.html"), DEFAULT_SETTINGS);

  it("promotes a 26pt paragraph to <h1>", () => {
    expect(out()).toMatch(/<h1>[^<]*Big Heading[^<]*<\/h1>/);
  });

  it("promotes a 20pt paragraph to <h2>", () => {
    expect(out()).toMatch(/<h2>[^<]*Subheading[^<]*<\/h2>/);
  });

  it("flattens <p> inside <li>", () => {
    expect(out()).not.toMatch(/<li[^>]*>\s*<p/);
  });

  it("keeps list structure", () => {
    expect(out()).toMatch(/<ul>[\s\S]*<\/ul>/);
    expect(out().match(/<li>/g)?.length).toBe(3);
  });

  it("preserves bold inside a list item", () => {
    expect(out()).toMatch(/<li>\s*<strong>[^<]*Bold third item/);
  });
});

describe("normalizeGoogleDocsHtml — links", () => {
  const out = () => normalizeGoogleDocsHtml(fixture("links-and-redirects.html"), DEFAULT_SETTINGS);

  it("unwraps the Google redirect URL", () => {
    expect(out()).toMatch(/href="https:\/\/example\.com\/page\?a=1&b=2"/);
    expect(out()).not.toMatch(/google\.com\/url\?q=/);
  });

  it("keeps the link text", () => {
    expect(out()).toMatch(/>this page<\/(span|u)>?<\/a>|>this page<\/a>/);
  });
});

describe("normalizeGoogleDocsHtml — tables", () => {
  const out = () => normalizeGoogleDocsHtml(fixture("table.html"), DEFAULT_SETTINGS);

  it("promotes the first row to <thead><th>", () => {
    expect(out()).toMatch(/<thead>[\s\S]*<th[\s\S]*Name[\s\S]*<\/th>/);
  });

  it("strips inline table styles", () => {
    expect(out()).not.toMatch(/<table[^>]*style/);
    expect(out()).not.toMatch(/<td[^>]*style/);
  });
});

describe("normalizeGoogleDocsHtml — Apple iOS HTML", () => {
  const out = () => normalizeGoogleDocsHtml(fixture("apple-ios.html"), DEFAULT_SETTINGS);

  it("wraps Apple bold spans in <strong>", () => {
    expect(out()).toMatch(/<strong>[^<]*TEXT MESSAGE TEMPLATE[^<]*<\/strong>/);
  });

  it("wraps Apple italic spans in <em>", () => {
    expect(out()).toMatch(/<em>[^<]*Thank you for helping/);
  });

  it("preserves bullet and ordered list structure", () => {
    expect(out()).toMatch(/<ul>[\s\S]*<\/ul>/);
    expect(out()).toMatch(/<ol>[\s\S]*<\/ol>/);
  });

  it("preserves links unchanged", () => {
    expect(out()).toMatch(/href="https:\/\/secure\.actblue\.com\/donate\/miami4choice"/);
  });

  it("strips the Apple-interchange-newline trailing marker", () => {
    expect(out()).not.toMatch(/Apple-interchange-newline/);
  });

  it("strips inline -webkit-text-stroke / font-kerning cruft", () => {
    expect(out()).not.toMatch(/-webkit-text-stroke/);
    expect(out()).not.toMatch(/font-kerning/);
  });
});

describe("normalizeGoogleDocsHtml — color preservation off by default", () => {
  it("drops color spans when preserveColors is false", () => {
    const settings = { ...DEFAULT_SETTINGS, preserveColors: false };
    const html = `<b style="font-weight:normal" id="docs-internal-guid-x"><p><span style="color:#ff0000;font-weight:400">red</span></p></b>`;
    const out = normalizeGoogleDocsHtml(html, settings);
    expect(out).not.toMatch(/color:#ff0000/i);
  });

  it("keeps color spans when preserveColors is true", () => {
    const settings = { ...DEFAULT_SETTINGS, preserveColors: true };
    const html = `<b style="font-weight:normal" id="docs-internal-guid-x"><p><span style="color:#ff0000;font-weight:400">red</span></p></b>`;
    const out = normalizeGoogleDocsHtml(html, settings);
    expect(out).toMatch(/color:#ff0000/i);
  });
});
