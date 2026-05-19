import type { GDocsPasteSettings } from "../settings";

function parseStyle(style: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const decl of style.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const key = decl.slice(0, idx).trim().toLowerCase();
    const value = decl.slice(idx + 1).trim();
    if (key) out.set(key, value);
  }
  return out;
}

function isBoldWeight(weight: string | undefined): boolean {
  if (!weight) return false;
  const n = Number(weight);
  if (!Number.isNaN(n)) return n >= 600;
  return weight === "bold" || weight === "bolder";
}

function hasUnderline(decoration: string | undefined): boolean {
  return !!decoration && /\bunderline\b/i.test(decoration);
}

function hasLineThrough(decoration: string | undefined): boolean {
  return !!decoration && /\bline-through\b/i.test(decoration);
}

function ancestorIsLink(el: Element): boolean {
  let cur: Element | null = el.parentElement;
  while (cur) {
    if (cur.tagName === "A") return true;
    cur = cur.parentElement;
  }
  return false;
}

function wrap(doc: Document, target: Element, tagName: string): Element {
  const wrapper = doc.createElement(tagName);
  while (target.firstChild) wrapper.appendChild(target.firstChild);
  target.appendChild(wrapper);
  return wrapper;
}

export function normalizeInline(doc: Document, settings: GDocsPasteSettings): void {
  const spans = Array.from(doc.querySelectorAll("span[style]"));
  for (const span of spans) {
    const style = parseStyle(span.getAttribute("style") ?? "");
    const fontWeight = style.get("font-weight");
    const fontStyle = style.get("font-style");
    const decoration = style.get("text-decoration") ?? style.get("text-decoration-line");
    const verticalAlign = style.get("vertical-align");
    const color = style.get("color");
    const background = style.get("background-color");

    const wraps: string[] = [];
    if (isBoldWeight(fontWeight)) wraps.push("strong");
    if (fontStyle === "italic") wraps.push("em");
    if (settings.preserveUnderline && hasUnderline(decoration) && !ancestorIsLink(span)) wraps.push("u");
    if (hasLineThrough(decoration)) wraps.push("s");
    if (verticalAlign === "super") wraps.push("sup");
    else if (verticalAlign === "sub") wraps.push("sub");

    for (const tag of wraps) wrap(doc, span, tag);

    const keepColor =
      settings.preserveColors && color && color !== "#000000" && color !== "rgb(0, 0, 0)" && color !== "inherit";
    const keepBg =
      settings.preserveHighlights &&
      background &&
      background !== "transparent" &&
      background !== "rgba(0, 0, 0, 0)" &&
      background !== "#ffffff" &&
      background !== "rgb(255, 255, 255)";

    if (keepColor || keepBg) {
      const newStyle: string[] = [];
      if (keepColor) newStyle.push(`color:${color}`);
      if (keepBg) newStyle.push(`background-color:${background}`);
      span.setAttribute("style", newStyle.join(";"));
    } else {
      span.removeAttribute("style");
      const parent = span.parentNode;
      if (parent && span.attributes.length === 0) {
        while (span.firstChild) parent.insertBefore(span.firstChild, span);
        parent.removeChild(span);
      }
    }
  }
}
