/** Text helpers for Kai's patient-facing replies. */

// Emoji + pictographs, variation selectors (FE0F), ZWJ joiners (200D), skin-tone
// modifiers, and regional-indicator flag pairs. Letters in every script (Latin,
// Devanagari, Arabic, CJK, Tamil, etc.) are left intact.
const EMOJI_RE =
  /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D]/gu

/**
 * Strip markdown formatting and emoji from Kai's text before it is shown to the
 * patient or read aloud. Kai should already avoid these (see the system prompt),
 * but the model occasionally slips in **bold**, bullet points, or emojis — none
 * of which belong in a calm, spoken medical reply. This is the defensive layer.
 */
export function stripMarkdownAndEmoji(text: string): string {
  if (!text) return text

  const out = text
    // Links / images: keep the visible label, drop the URL
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Paired emphasis (bold/italic/strikethrough): keep the inner words
    .replace(/(\*\*\*|\*\*|\*|___|__|~~)(.+?)\1/g, '$2')
    // Inline code / fenced code: keep the inner text
    .replace(/`{1,3}([^`]*)`{1,3}/g, '$1')
    // Leading heading, blockquote, and list markers at the start of a line
    .replace(/^[ \t]*#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]*>[ \t]?/gm, '')
    .replace(/^[ \t]*[-*+][ \t]+/gm, '')
    // Any stray asterisks/backticks the passes above left behind
    .replace(/[*`]/g, '')
    // Emoji and their modifiers
    .replace(EMOJI_RE, '')

  // Collapse whitespace the removals may have doubled up
  return out.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}
