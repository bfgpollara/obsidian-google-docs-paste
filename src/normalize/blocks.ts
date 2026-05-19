import type { GDocsPasteSettings } from "../settings";

function unwrapFakeBold(doc: Document): void {
  const wrappers = doc.querySelectorAll('b[id^="docs-internal-guid-"]');
  wrappers.forEach((b) => {
    const style = (b.getAttribute("style") ?? "").toLowerCase();
    if (!style.includes("font-weight:normal") && !style.includes("font-weight: normal")) return;
    const parent = b.parentNode;
    if (!parent) return;
    while (b.firstChild) parent.insertBefore(b.firstChild, b);
    parent.removeChild(b);
  });
}

function dominantFontSizePt(p: Element): number | null {
  const spans = p.querySelectorAll("span[style]");
  if (spans.length === 0) return null;
  let totalLen = 0;
  let weightedPt = 0;
  spans.forEach((s) => {
    const style = s.getAttribute("style") ?? "";
    const match = /font-size\s*:\s*([\d.]+)pt/i.exec(style);
    if (!match) return;
    const pt = parseFloat(match[1]);
    const len = (s.textContent ?? "").length;
    weightedPt += pt * len;
    totalLen += len;
  });
  if (totalLen === 0) return null;
  return weightedPt / totalLen;
}

function paragraphIsBold(p: Element): boolean {
  const spans = Array.from(p.querySelectorAll("span[style]"));
  if (spans.length === 0) return false;
  return spans.every((s) => /font-weight\s*:\s*(?:bold|[6-9]\d{2})/i.test(s.getAttribute("style") ?? ""));
}

function promoteHeadings(doc: Document, settings: GDocsPasteSettings): void {
  if (!settings.detectHeadings) return;
  const thresholds = [...settings.headingFontSizes].sort((a, b) => b.ptAtLeast - a.ptAtLeast);
  doc.querySelectorAll("p").forEach((p) => {
    const pt = dominantFontSizePt(p);
    if (pt === null) return;
    let level: number | null = null;
    for (const t of thresholds) {
      if (pt >= t.ptAtLeast) {
        level = t.level;
        break;
      }
    }
    if (level === null) return;
    if (level === 6 && !paragraphIsBold(p)) return;
    if (level >= 5 && pt < 13 && !paragraphIsBold(p)) return;
    const h = doc.createElement(`h${level}`);
    while (p.firstChild) h.appendChild(p.firstChild);
    p.parentNode?.replaceChild(h, p);
  });
}

function flattenParagraphInListItem(doc: Document): void {
  doc.querySelectorAll("li").forEach((li) => {
    const childParagraphs = Array.from(li.children).filter((c) => c.tagName === "P");
    if (childParagraphs.length === 0) return;
    childParagraphs.forEach((p) => {
      while (p.firstChild) li.insertBefore(p.firstChild, p);
      li.removeChild(p);
    });
  });
}

function stripPresentationalStyle(doc: Document): void {
  doc.querySelectorAll("p, li, ul, ol").forEach((el) => {
    el.removeAttribute("dir");
    el.removeAttribute("role");
    el.removeAttribute("style");
    el.removeAttribute("class");
    el.removeAttribute("aria-level");
  });
}

export function normalizeBlocks(doc: Document, settings: GDocsPasteSettings): void {
  unwrapFakeBold(doc);
  promoteHeadings(doc, settings);
  flattenParagraphInListItem(doc);
  stripPresentationalStyle(doc);
}
