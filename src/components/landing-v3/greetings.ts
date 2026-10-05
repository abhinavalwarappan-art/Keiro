/* ============================================================================
   ⚠️  UNREVIEWED TRANSLATIONS — NEEDS NATIVE SPEAKER CHECK BEFORE LAUNCH  ⚠️
   ----------------------------------------------------------------------------
   STATUS: draft. Cleared for the demo (2026-07-11, founder call). NOT cleared
   for public launch until a speaker signs off on each line.

   Kai's opening line, in all 45 languages the app supports. Keyed by the
   canonical `code` from src/lib/languages.ts so this map and the language list
   can never drift apart — if a language exists in the app, its greeting is
   looked up here, and a missing one is visible immediately rather than silently
   falling back.

   Every line except en-US was machine-authored. This repo has shipped a
   mistranslation before (the intake sex labels, fixed across 16 locales in
   c5515ef). A wrong sentence in someone's mother tongue destroys exactly the
   trust this feature is built to earn, so: get these checked.

   RTL is NOT stored here — it comes from LANGUAGES[].rtl, the single source.
   ========================================================================== */

export const KAI_GREETINGS: Record<string, string> = {
  'en-US':
    "Hello, I'm Kai. Tell me what hurts, in your own words. I'll explain it to your doctor.",
  'es-ES':
    'Hola, soy Kai. Cuéntame qué te duele, con tus propias palabras. Yo se lo explicaré a tu médico.',
  'zh-CN': '你好，我是 Kai。用你自己的话告诉我哪里不舒服，我会替你转达给医生。',
  'hi-IN':
    'नमस्ते, मैं Kai हूँ। अपने शब्दों में बताइए कि कहाँ दर्द है। मैं आपके डॉक्टर को समझा दूँगा।',
  'ar-SA': 'مرحباً، أنا Kai. أخبرني بما يؤلمك بكلماتك الخاصة، وسأشرح ذلك لطبيبك.',
  'vi-VN':
    'Xin chào, tôi là Kai. Hãy nói cho tôi biết bạn đau ở đâu, bằng lời của bạn. Tôi sẽ giải thích cho bác sĩ của bạn.',
  'ko-KR':
    '안녕하세요, 저는 Kai입니다. 어디가 아픈지 편하게 말씀해 주세요. 제가 의사 선생님께 전해 드릴게요.',
  'tl-PH':
    'Kumusta, ako si Kai. Sabihin mo sa akin kung saan masakit, sa sarili mong salita. Ipapaliwanag ko ito sa doktor mo.',
  'ur-PK':
    'السلام علیکم، میں Kai ہوں۔ اپنے الفاظ میں بتائیے کہ کہاں تکلیف ہے۔ میں آپ کے ڈاکٹر کو سمجھا دوں گا۔',
  'ta-IN':
    'வணக்கம், நான் Kai. உங்கள் சொந்த வார்த்தைகளில் எங்கே வலிக்கிறது என்று சொல்லுங்கள். நான் அதை உங்கள் மருத்துவரிடம் விளக்குகிறேன்.',
  'te-IN':
    'నమస్కారం, నేను Kai. మీ సొంత మాటల్లో ఎక్కడ నొప్పిగా ఉందో చెప్పండి. నేను దాన్ని మీ డాక్టర్‌కు వివరిస్తాను.',
  'gu-IN':
    'નમસ્તે, હું Kai છું. તમારા પોતાના શબ્દોમાં કહો કે ક્યાં દુખે છે. હું તે તમારા ડૉક્ટરને સમજાવીશ.',
  'pa-IN':
    'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ Kai ਹਾਂ। ਆਪਣੇ ਸ਼ਬਦਾਂ ਵਿੱਚ ਦੱਸੋ ਕਿ ਕਿੱਥੇ ਦਰਦ ਹੈ। ਮੈਂ ਤੁਹਾਡੇ ਡਾਕਟਰ ਨੂੰ ਸਮਝਾ ਦਿਆਂਗਾ।',
  'fr-FR':
    "Bonjour, je suis Kai. Dites-moi ce qui vous fait mal, avec vos mots. Je l'expliquerai à votre médecin.",
  'de-DE':
    'Hallo, ich bin Kai. Sagen Sie mir mit Ihren eigenen Worten, was wehtut. Ich erkläre es Ihrer Ärztin oder Ihrem Arzt.',
  'pt-BR':
    'Olá, eu sou o Kai. Me conte o que está doendo, com as suas palavras. Eu explico ao seu médico.',
  'ja-JP':
    'こんにちは、Kai です。どこがつらいか、あなたの言葉で教えてください。お医者さんには私から伝えます。',
  'ru-RU':
    'Здравствуйте, я Kai. Расскажите своими словами, что у вас болит. Я объясню это вашему врачу.',
  'tr-TR':
    'Merhaba, ben Kai. Nerenizin ağrıdığını kendi kelimelerinizle anlatın. Ben bunu doktorunuza açıklayacağım.',
  'fa-IR':
    'سلام، من Kai هستم. با کلمات خودتان بگویید کجا درد می‌کند. من آن را برای پزشکتان توضیح می‌دهم.',
  'am-ET': 'ሰላም፣ እኔ Kai ነኝ። በራስዎ ቃላት የት እንደሚያመዎት ይንገሩኝ። ለሐኪምዎ አስረዳለሁ።',
  'sw-KE':
    'Habari, mimi ni Kai. Niambie kwa maneno yako mwenyewe kinachokuuma. Nitamweleza daktari wako.',
  'so-SO':
    'Salaan, waxaan ahay Kai. Erayadaada gaarka ah iigu sheeg meesha ku xanuunaysa. Waxaan u sharxi doonaa dhakhtarkaaga.',
  'id-ID':
    'Halo, saya Kai. Ceritakan dengan kata-kata Anda sendiri bagian mana yang sakit. Saya akan menjelaskannya kepada dokter Anda.',
  'pl-PL':
    'Dzień dobry, jestem Kai. Powiedz własnymi słowami, co cię boli. Wyjaśnię to twojemu lekarzowi.',
  'uk-UA':
    'Вітаю, я Kai. Розкажіть своїми словами, що у вас болить. Я поясню це вашому лікарю.',
  'bn-BD':
    'নমস্কার, আমি Kai। নিজের ভাষায় বলুন কোথায় ব্যথা করছে। আমি আপনার ডাক্তারকে বুঝিয়ে বলব।',
  'ml-IN':
    'നമസ്കാരം, ഞാൻ Kai ആണ്. നിങ്ങളുടെ സ്വന്തം വാക്കുകളിൽ എവിടെയാണ് വേദന എന്ന് പറയൂ. ഞാൻ അത് നിങ്ങളുടെ ഡോക്ടറോട് വിശദീകരിക്കാം.',
  'it-IT':
    'Ciao, sono Kai. Raccontami con parole tue che cosa ti fa male. Lo spiegherò io al tuo medico.',
  'nl-NL':
    'Hallo, ik ben Kai. Vertel me in je eigen woorden wat er pijn doet. Ik leg het uit aan je arts.',
  'el-GR':
    'Γεια σας, είμαι ο Kai. Πείτε μου με δικά σας λόγια τι σας πονάει. Θα το εξηγήσω εγώ στον γιατρό σας.',
  'cs-CZ':
    'Dobrý den, jsem Kai. Řekněte mi vlastními slovy, co vás bolí. Vysvětlím to vašemu lékaři.',
  'ro-RO':
    'Bună ziua, sunt Kai. Spuneți-mi cu cuvintele dumneavoastră ce vă doare. Îi voi explica medicului dumneavoastră.',
  'sv-SE':
    'Hej, jag heter Kai. Berätta med dina egna ord vad som gör ont. Jag förklarar det för din läkare.',
  'da-DK':
    'Hej, jeg er Kai. Fortæl mig med dine egne ord, hvad der gør ondt. Jeg forklarer det for din læge.',
  'fi-FI': 'Hei, olen Kai. Kerro omin sanoin, mihin sattuu. Minä selitän sen lääkärillesi.',
  'nb-NO':
    'Hei, jeg er Kai. Fortell meg med dine egne ord hva som gjør vondt. Jeg forklarer det til legen din.',
  'hu-HU':
    'Jó napot, Kai vagyok. Mondja el a saját szavaival, hol fáj. Én majd elmagyarázom az orvosának.',
  'bg-BG':
    'Здравейте, аз съм Kai. Кажете ми със свои думи какво ви боли. Аз ще го обясня на вашия лекар.',
  'zh-TW': '你好，我是 Kai。用你自己的話告訴我哪裡不舒服，我會替你轉達給醫生。',
  'sk-SK':
    'Dobrý deň, som Kai. Povedzte mi vlastnými slovami, čo vás bolí. Vysvetlím to vášmu lekárovi.',
  'sl-SI':
    'Pozdravljeni, sem Kai. Povejte mi s svojimi besedami, kaj vas boli. Razložil bom vašemu zdravniku.',
  'et-EE':
    'Tere, mina olen Kai. Rääkige oma sõnadega, mis teil valutab. Ma selgitan selle teie arstile.',
  'lv-LV':
    'Sveiki, es esmu Kai. Pastāstiet saviem vārdiem, kas jums sāp. Es to izskaidrošu jūsu ārstam.',
  'lt-LT':
    'Sveiki, aš esu Kai. Savais žodžiais papasakokite, kas skauda. Aš tai paaiškinsiu jūsų gydytojui.',
}

/** Sentence enders across Keiro's scripts: Latin, CJK, Devanagari, Urdu, Ethiopic, Arabic. */
const FIRST_SENTENCE = /^(.*?)[.。।۔።!！؟](?:\s|$)/u

/**
 * Kai's one-line hello in a language ("Hallo, ich bin Kai") — the first sentence
 * of its greeting, without the full stop. English when the language is unknown.
 */
export function kaiShortGreeting(code: string): string {
  const text = KAI_GREETINGS[code] ?? KAI_GREETINGS['en-US']
  return (FIRST_SENTENCE.exec(text)?.[1] ?? text).trim()
}
