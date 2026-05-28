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
    <div className="overflow-hidden py-3">
      <div className={`flex gap-8 whitespace-nowrap ${reverse ? 'animate-marquee-rev' : 'marquee-track'}`}>
        {doubled.map((item, i) => (
          <span key={i} className="text-[13px] text-keiro-muted font-medium">
            {item} ·
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Marquee() {
  return (
    <section className="bg-keiro-surface border-y border-keiro-border">
      <Row items={ROW1} />
      <Row items={ROW2} reverse />
    </section>
  )
}
