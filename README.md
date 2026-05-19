# Google Docs Paste — Obsidian Plugin

Paste content from Google Docs into Obsidian with formatting preserved instead of collapsed to plain text wrapped in `**`.

## Why

When you copy from Google Docs, the clipboard HTML is wrapped in
`<b style="font-weight:normal" id="docs-internal-guid-...">` and uses inline
`<span style="font-weight:700">` instead of semantic `<strong>`. Obsidian's
built-in Turndown-based paste keeps the outer `<b>` (so everything ends up
bolded) and drops the inner styled spans (so the *real* bold is lost). Lists
get extra blank lines because Google nests `<p>` inside each `<li>`, links
point at `google.com/url?q=...` redirects, and tables come through as
inline-styled markup.

This plugin sniffs Google Docs HTML on paste and rewrites it into semantic
HTML before handing it to Obsidian's `htmlToMarkdown()`.

## What's converted

- **Inline:** bold, italic, underline (kept as `<u>`), strikethrough,
  sub/superscript.
- **Blocks:** font-size-based heading detection (H1–H6), `<p>`-in-`<li>`
  flattening, dropped presentational styles.
- **Links:** `google.com/url?q=...` redirects unwrapped to the destination.
- **Tables:** inline styles stripped, first row promoted to `<thead>` /
  `<th>` so the output is a real Markdown table.
- **Images:** kept as remote URLs by default; can be downloaded into the
  vault attachments folder.
- **Color / highlights:** off by default; when enabled, kept as inline
  `<span style="color:...;background-color:...">`.

Non-Google-Docs pastes are untouched.

## Install locally

This plugin is not (yet) in the Obsidian community catalog, so install it
manually as an unpacked plugin.

1. **Build the plugin**

   ```
   git clone https://github.com/bfgpollara/obsidian-google-docs-paste
   cd obsidian-google-docs-paste
   npm install
   npm run build
   ```

   This produces `main.js` next to `manifest.json`.

2. **Copy the files into your vault**

   Create a folder for the plugin inside your vault's hidden `.obsidian`
   directory and copy in the three files Obsidian needs:

   ```
   <YourVault>/.obsidian/plugins/google-docs-paste/
   ├── main.js          ← from step 1
   ├── manifest.json    ← from the repo
   └── styles.css       ← optional; omit if not present
   ```

   On macOS / Linux you can symlink instead of copying so rebuilds pick up
   automatically:

   ```
   ln -s "$(pwd)" "<YourVault>/.obsidian/plugins/google-docs-paste"
   ```

   On Windows (PowerShell, admin):

   ```
   New-Item -ItemType SymbolicLink `
     -Path "<YourVault>\.obsidian\plugins\google-docs-paste" `
     -Target "<absolute-path-to-this-folder>"
   ```

3. **Enable the plugin in Obsidian**

   - Open Obsidian → **Settings → Community plugins**.
   - If you've never installed a community plugin: click **Turn on
     community plugins**.
   - Click the **Refresh** ↻ button next to *Installed plugins* (Obsidian
     re-scans `.obsidian/plugins/`).
   - Toggle **Google Docs Paste** on.
   - A new **Google Docs Paste** section appears under *Community plugins*
     in Settings — adjust toggles there.

4. **Try it**

   Copy any text out of Google Docs, paste into a note. Bold / italic /
   underline / strike / headings / lists / links / tables should all
   survive. Pastes from any non-Docs source go through Obsidian's
   built-in paste handler untouched.

## Develop

```
npm install
npm run dev       # esbuild watch → main.js
npm test          # vitest, headless
npm run build     # production build
```

With the symlink from the install section above in place, `npm run dev`
plus Obsidian's *Reload app without saving* (Ctrl/Cmd+R in dev or via
the BRAT/Hot-Reload plugins) gives you a fast iteration loop.

## Out of scope (for now)

- Google Sheets clipboard (different format)
- Google Docs comments / suggestions
- Equations (Google ships them as images)
- Round-trip from Obsidian back to Docs
