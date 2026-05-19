import type { GDocsPasteSettings } from "../settings";

function unwrapRedirect(href: string): string {
  try {
    const url = new URL(href);
    if (url.hostname !== "www.google.com" || url.pathname !== "/url") return href;
    const q = url.searchParams.get("q");
    return q ?? href;
  } catch {
    return href;
  }
}

export function normalizeLinks(doc: Document, settings: GDocsPasteSettings): void {
  if (!settings.unwrapGoogleRedirects) return;
  doc.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;
    a.setAttribute("href", unwrapRedirect(href));
    a.removeAttribute("style");
    a.removeAttribute("target");
    a.removeAttribute("data-saferedirecturl");
  });
}
