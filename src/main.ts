import {
  Editor,
  htmlToMarkdown,
  MarkdownFileInfo,
  MarkdownView,
  Notice,
  Plugin,
  TFile,
} from "obsidian";
import { isGoogleDocsHtml } from "./detect";
import { normalizeGoogleDocsDocument, postProcessMarkdown } from "./normalize";
import { saveImagesToVaultPass } from "./normalize/images";
import { DEFAULT_SETTINGS, GDocsPasteSettings } from "./settings";
import { GDocsPasteSettingTab } from "./settings-tab";

export default class GoogleDocsPastePlugin extends Plugin {
  settings: GDocsPasteSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new GDocsPasteSettingTab(this.app, this));
    this.registerEvent(this.app.workspace.on("editor-paste", this.onPaste.bind(this)));
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private onPaste(
    evt: ClipboardEvent,
    editor: Editor,
    info: MarkdownView | MarkdownFileInfo,
  ): void {
    if (evt.defaultPrevented) return;
    const html = evt.clipboardData?.getData("text/html") ?? "";

    if (this.settings.diagnosticPasteLogging) {
      this.showPasteDiagnostics(evt, html);
    }

    if (!html || !isGoogleDocsHtml(html)) return;

    evt.preventDefault();
    void this.handle(html, editor, info);
  }

  private showPasteDiagnostics(evt: ClipboardEvent, html: string): void {
    const types = evt.clipboardData ? Array.from(evt.clipboardData.types) : [];
    const detected = html ? isGoogleDocsHtml(html) : false;
    const preview = html.slice(0, 200).replace(/\s+/g, " ");
    const msg =
      `[gdocs-paste diagnostics]\n` +
      `types: ${types.length ? types.join(", ") : "(none)"}\n` +
      `text/html length: ${html.length}\n` +
      `gdocs-detected: ${detected}\n` +
      `html[0..200]: ${preview || "(empty)"}`;
    new Notice(msg, 30000);
  }

  private async handle(
    html: string,
    editor: Editor,
    info: MarkdownView | MarkdownFileInfo,
  ): Promise<void> {
    const doc = normalizeGoogleDocsDocument(html, this.settings);

    if (this.settings.saveImagesToVault) {
      const activeFile = info instanceof MarkdownView ? info.file : info.file ?? null;
      await saveImagesToVaultPass(doc, this.app, this.settings, activeFile as TFile | null);
    }

    const normalizedHtml = doc.body.innerHTML;
    const md = htmlToMarkdown(normalizedHtml);
    const finalMd = postProcessMarkdown(md, this.settings);
    editor.replaceSelection(finalMd);
  }
}
