# Keiro frontend redesign verification

Local preview: http://localhost:3000. No production deployment was performed.

The homepage uses a mobile-first introduction, language selection, static conversation, English doctor's note, CTA, and reassurance. The selected language is passed into onboarding. The only homepage animation is a 160ms language-change fade; it is absent with reduced motion. The cookie notice is in normal flow on the homepage so it does not cover the language picker.

## Measured contrast

Calculated with WCAG sRGB relative luminance, (Llighter + 0.05) / (Ldarker + 0.05). The script also collects rendered text foreground/background pairs, rather than checking tokens alone.

| Foreground | Background | Ratio |
| --- | --- | --- |
| Deep ink #243C3A | Warm paper #FAF7F0 | 11.01:1 |
| Warm paper #FAF7F0 | Pine #315E55 | 6.86:1 |
| Slate #52635E | Warm paper #FAF7F0 | 5.94:1 |
| Doctor's blue #245A81 | Warm paper #FAF7F0 | 6.88:1 |
| Deep ink #243C3A | Pale sage #E8EFE8 | 10.07:1 |
| Slate #52635E | Pale sage #E8EFE8 | 5.43:1 |
| Warm paper #FAF7F0 | Deep ink #243C3A | 11.01:1 |
| Pine #315E55 | Warm paper #FAF7F0 | 6.86:1 |
| Doctor's blue #245A81 | Pale sage #E8EFE8 | 6.29:1 |

All clear AA normal-text 4.5:1. Slate control borders and blue focus outlines also clear 3:1 against their adjacent light surfaces. Focus on dark surfaces uses a warm-paper separation ring.

## Verification performed

- Chromium screenshots at 375, 768, 1024, and 1440 CSS pixels; no horizontal overflow.
- 375px with root text size at 200%; enlarged navigation wraps, and no inspected text/control extends offscreen. Additional 320px reflow check passes.
- Language buttons measure 83px high and primary CTA 60px high at 375px. Shared controls have a 48px minimum.
- Tab navigation, Space activation, selected-language state, blue 3px focus outline with 4px offset, and menu Escape returning focus to the toggle.
- Native-name/English/romanized language search, accent-insensitive matching, no-result feedback, and lang attributes on all 45 language options.
- Arabic, Urdu, Persian: explicit language tags and RTL conversation; English note remains LTR.
- Polite, atomic language-change status text and browser accessibility-tree snapshot; no automatic reading of a timed conversation.
- Reduced-motion change has animation-name none; no running idle homepage animations in either motion preference.
- axe WCAG 2 A/AA and 2.1 AA: zero violations on the tested homepage.
- Production build and TypeScript check passed. Targeted lint: no errors; Nav retains its pre-existing set-state-in-effect warning. git diff --check passed.

These are Chromium browser checks, not physical iPhone/iPad/Android testing. Actual VoiceOver and TalkBack speech, navigation, and pronunciation were not tested. Demo translations, including new Urdu/Persian symptom samples, still require native-speaker review. Eight languages have a symptom example; the remaining languages show their greeting with an explicitly labeled English sample note.

Run `node artifacts/redesign/verify.cjs` with the local server on port 3000 to reproduce the recorded browser checks. Raw results are in verification.json. Screenshots are named by viewport width; 375-rtl.png and 375-200percent.png show the corresponding states.
