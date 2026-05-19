import type { GDocsPasteSettings, RegexRule } from "../settings";
import { isAppleRichTextHtml } from "../detect";
import { normalizeAppleRichText } from "./apple";
import { normalizeBlocks } from "./blocks";
import { normalizeInline } from "./inline";
import { normalizeLinks } from "./links";
import { normalizeTables } from "./tables";

function applyRegexRules(input: string, rules: RegexRule[]): string {
  let out = input;
  for (const rule of rules) {
    if (!rule.pattern) continue;
    try {
      const re = new RegExp(rule.pattern, rule.flags || "g");
      out = out.replace(re, rule.replacement);
    } catch {
      // skip malformed user-supplied regex
    }
  }
  return out;
}

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

function serialize(doc: Document): string {
  return doc.body.innerHTML;
}

function runPipeline(doc: Document, html: string, settings: GDocsPasteSettings): void {
  if (isAppleRichTextHtml(html)) normalizeAppleRichText(doc);
  normalizeBlocks(doc, settings);
  normalizeInline(doc, settings);
  normalizeLinks(doc, settings);
  normalizeTables(doc);
}

export function normalizeGoogleDocsHtml(html: string, settings: GDocsPasteSettings): string {
  const preProcessed = applyRegexRules(html, settings.userHtmlRegex);
  const doc = parse(preProcessed);
  runPipeline(doc, preProcessed, settings);
  return serialize(doc);
}

export function normalizeGoogleDocsDocument(html: string, settings: GDocsPasteSettings): Document {
  const preProcessed = applyRegexRules(html, settings.userHtmlRegex);
  const doc = parse(preProcessed);
  runPipeline(doc, preProcessed, settings);
  return doc;
}

export function postProcessMarkdown(md: string, settings: GDocsPasteSettings): string {
  let out = applyRegexRules(md, settings.userMarkdownRegex);
  out = out.replace(/\n{3,}/g, "\n\n");
  return out.trim() + "\n";
}
