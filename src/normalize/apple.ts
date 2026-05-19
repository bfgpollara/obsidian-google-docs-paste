// iOS / macOS NSAttributedString → HTML output normalization.
//
// Apple's runtime serializes rich-text clipboard content through an HTML
// emitter that produces inline-styled <p>/<span> trees plus a trailing
// <br class="Apple-interchange-newline"> marker. The rest of the pipeline
// (normalizeInline, normalizeLinks, stripPresentationalStyle) already
// understands the inline `font-weight: bold` / `font-style: italic` shape,
// so this pass only handles the Apple-specific cruft.

export function normalizeAppleRichText(doc: Document): void {
  doc.querySelectorAll("br.Apple-interchange-newline").forEach((br) => br.remove());
  doc.querySelectorAll('[class^="Apple-"], [class*=" Apple-"]').forEach((el) => el.removeAttribute("class"));
}
