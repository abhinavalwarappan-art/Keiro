# Patient interface translations

`src/lib/languages.ts` is the canonical list of supported locales. `en.json` is
the source for interface messages; every other locale has one dictionary in
`locales/`. Homepage, navigation, language choice, onboarding, and Kai use the
same keys. The request locale comes from the `lang` URL parameter when present,
then the `keiro-locale` cookie. The proxy passes it to the server layout, so the
first HTML response has the correct language and direction. Choosing a language
sets the cookie and follows a real URL; the onboarding and chat query parameter
continues to carry the same locale through the patient flow.

Run `npm run i18n:generate` after adding keys to `en.json`. The script adds
missing translations and preserves existing corrections. Its output is a
machine translated draft. A fluent reviewer should check patient wording,
clinical meaning, politeness, script, and layout before considering a locale
editorially approved. In particular, keep Kai and Keiro recognizable, keep
"English summary" distinct from the patient's language, and avoid wording that
implies a diagnosis or treatment recommendation. Corrections belong in the
locale JSON file, never in a component conditional.

The fallback for a missing message is English so controls remain usable while a
dictionary is being completed. Placeholder names such as `{language}` must
remain intact. `en-US.json` is a legacy snapshot; `en.json` is authoritative
for English.
