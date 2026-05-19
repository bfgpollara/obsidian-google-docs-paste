export interface RegexRule {
  pattern: string;
  replacement: string;
  flags: string;
}

export interface GDocsPasteSettings {
  preserveColors: boolean;
  preserveHighlights: boolean;
  preserveUnderline: boolean;
  detectHeadings: boolean;
  headingFontSizes: { ptAtLeast: number; level: number }[];
  saveImagesToVault: boolean;
  unwrapGoogleRedirects: boolean;
  userHtmlRegex: RegexRule[];
  userMarkdownRegex: RegexRule[];
}

export const DEFAULT_SETTINGS: GDocsPasteSettings = {
  preserveColors: false,
  preserveHighlights: false,
  preserveUnderline: true,
  detectHeadings: true,
  headingFontSizes: [
    { ptAtLeast: 26, level: 1 },
    { ptAtLeast: 20, level: 2 },
    { ptAtLeast: 16, level: 3 },
    { ptAtLeast: 14, level: 4 },
    { ptAtLeast: 13, level: 5 },
    { ptAtLeast: 12, level: 6 },
  ],
  saveImagesToVault: false,
  unwrapGoogleRedirects: true,
  userHtmlRegex: [],
  userMarkdownRegex: [],
};
