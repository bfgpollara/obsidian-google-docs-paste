const GUID_RE = /id=["']docs-internal-guid-[0-9a-f-]+["']/i;

export function isGoogleDocsHtml(html: string): boolean {
  return GUID_RE.test(html);
}
