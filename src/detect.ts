const GUID_RE = /id=["']docs-internal-guid-[0-9a-f-]+["']/i;

export function isGoogleDocsHtml(html: string): boolean {
  return GUID_RE.test(html);
}

export function isAppleRichTextHtml(html: string): boolean {
  if (html.includes("Apple-interchange-newline")) return true;
  return html.includes("-webkit-text-stroke") && html.includes("font-kerning: none");
}

export function isSupportedPasteHtml(html: string): boolean {
  return isGoogleDocsHtml(html) || isAppleRichTextHtml(html);
}
