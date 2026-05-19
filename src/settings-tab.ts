import { App, PluginSettingTab, Setting } from "obsidian";
import type GoogleDocsPastePlugin from "./main";

export class GDocsPasteSettingTab extends PluginSettingTab {
  plugin: GoogleDocsPastePlugin;

  constructor(app: App, plugin: GoogleDocsPastePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Detect headings")
      .setDesc("Convert Google Docs styled paragraphs into Markdown headings using the font-size thresholds.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.detectHeadings).onChange(async (v) => {
          this.plugin.settings.detectHeadings = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Preserve underline")
      .setDesc("Keep underlined text as <u>...</u> (Markdown has no native underline).")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.preserveUnderline).onChange(async (v) => {
          this.plugin.settings.preserveUnderline = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Preserve text colors")
      .setDesc('Keep font color as inline <span style="color:...">.')
      .addToggle((t) =>
        t.setValue(this.plugin.settings.preserveColors).onChange(async (v) => {
          this.plugin.settings.preserveColors = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Preserve highlights")
      .setDesc('Keep highlight color as inline <span style="background-color:...">.')
      .addToggle((t) =>
        t.setValue(this.plugin.settings.preserveHighlights).onChange(async (v) => {
          this.plugin.settings.preserveHighlights = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Unwrap Google redirect links")
      .setDesc("Replace https://www.google.com/url?q=... with the underlying destination URL.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.unwrapGoogleRedirects).onChange(async (v) => {
          this.plugin.settings.unwrapGoogleRedirects = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Save pasted images to vault")
      .setDesc("Download Google-hosted images into the attachments folder instead of linking to remote URLs.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.saveImagesToVault).onChange(async (v) => {
          this.plugin.settings.saveImagesToVault = v;
          await this.plugin.saveSettings();
        }),
      );
  }
}
