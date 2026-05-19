import { App, requestUrl, TFile } from "obsidian";
import type { GDocsPasteSettings } from "../settings";

const GOOGLE_IMAGE_HOSTS = ["googleusercontent.com", "google.com"];

function isGoogleImage(src: string): boolean {
  try {
    const url = new URL(src);
    return GOOGLE_IMAGE_HOSTS.some((h) => url.hostname.endsWith(h));
  } catch {
    return false;
  }
}

function extensionFor(contentType: string | undefined): string {
  if (!contentType) return "png";
  if (contentType.includes("jpeg")) return "jpg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("svg")) return "svg";
  return "png";
}

export async function saveImagesToVaultPass(
  doc: Document,
  app: App,
  settings: GDocsPasteSettings,
  activeFile: TFile | null,
): Promise<void> {
  if (!settings.saveImagesToVault) return;
  const imgs = Array.from(doc.querySelectorAll("img[src]"));
  for (const img of imgs) {
    const src = img.getAttribute("src");
    if (!src || !isGoogleImage(src)) continue;
    try {
      const res = await requestUrl({ url: src });
      const ext = extensionFor(res.headers["content-type"] ?? res.headers["Content-Type"]);
      const proposed = `pasted-image-${Date.now()}.${ext}`;
      const path = await app.fileManager.getAvailablePathForAttachment(proposed, activeFile?.path ?? "");
      await app.vault.createBinary(path, res.arrayBuffer);
      img.setAttribute("src", path);
    } catch {
      // leave the remote src in place on failure
    }
  }
}
