const ROW1 = [
  '🇪🇸 Español', '🇮🇳 हिन्दी', '🇨🇳 中文', '🇸🇦 العربية', '🇻🇳 Tiếng Việt',
  '🇰🇷 한국어', '🇯🇵 日本語', '🇵🇭 Tagalog', '🇮🇳 தமிழ்', '🇮🇳 తెలుగు',
]
const ROW2 = [
  '🇫🇷 Français', '🇩🇪 Deutsch', '🇵🇰 اردو', '🇮🇳 ગુજરાતી', '🇷🇺 Русский',
  '🇹🇷 Türkçe', '🇧🇷 Português', '🇮🇷 فارسی', '🇮🇩 Bahasa', '🇺🇦 Українська',
]

function Row({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden py-3.5">
      <div className={`flex gap-10 whitespace-nowrap ${reverse ? 'animate-marquee-rev' : 'animate-marquee'}`}>
        {doubled.map((item, i) => (
          <span key={i} className="text-sm font-medium text-text-secondary">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Marquee() {
  return (
    <section className="border-y border-border-subtle bg-sunken">
      <Row items={ROW1} />
      <Row items={ROW2} reverse />
    </section>
  )
}