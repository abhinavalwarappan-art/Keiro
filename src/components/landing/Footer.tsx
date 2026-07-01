export default function Footer() {
  return (
    <footer className="relative overflow-hidden px-6 pb-12 pt-24 md:px-12" style={{ background: '#0C0A09' }}>

      {/* Watermark — ghost type */}
      <div
        className="absolute bottom-0 left-0 right-0 leading-[0.8] select-none pointer-events-none overflow-hidden whitespace-nowrap font-display"
        style={{
          fontSize: 'clamp(80px,16vw,240px)',
          color: 'transparent',
          WebkitTextStroke: '1px rgba(45,212,191,0.08)',
        }}
        aria-hidden
      >
        KEIRO &middot; KEIRO &middot; KEIRO
      </div>

      <div className="relative mx-auto max-w-[1200px]">

        {/* Top statement */}
        <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-start mb-20 pb-20"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="font-display leading-[0.95] tracking-tight text-white"
            style={{ fontSize: 'clamp(32px,5vw,60px)' }}>
            <span className="font-bold">Healthcare in</span><br />
            <span className="font-light" style={{ color: '#2DD4BF' }}>every language.</span>
          </h3>
          <div className="pt-2">
            <a
              href="/onboarding?fresh=1"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-6 text-sm font-medium text-[#0C0A09] transition-colors duration-150 hover:bg-[#5EEAD4]"
            >
              Open Keiro →
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex size-8 items-center justify-center rounded-md bg-brand-ink">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 2h4v4L2 12V2z" fill="white" opacity="0.9"/>
                  <path d="M7 2h5L7 12H4.5L7 2z" fill="white"/>
                </svg>
              </div>
              <span className="text-base font-semibold tracking-tight text-white">Keiro</span>
            </div>
            <p className="text-[14px] leading-relaxed max-w-[240px]"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              Empowering patients through gentle, AI-guided medical communication.
            </p>
          </div>

          {[
            {
              label: 'Product',
              links: [
                { text: 'Open app',      href: '/onboarding?fresh=1' },
                { text: 'How it works',  href: '#how' },
                { text: 'Languages',     href: '#languages' },
                { text: 'For hospitals', href: '#hospitals' },
              ],
            },
            {
              label: 'Legal',
              links: [
                { text: 'Privacy Policy', href: '/privacy' },
                { text: 'Terms of Use',   href: '/terms' },
                { text: 'Emergency',      href: '/emergency' },
              ],
            },
            {
              label: 'Contact',
              links: [{ text: 'hello@keiro.app', href: 'mailto:hello@keiro.app' }],
            },
          ].map(col => (
            <div key={col.label}>
              <div className="text-[11px] uppercase tracking-widest font-semibold mb-5"
                style={{ color: 'rgba(255,255,255,0.28)' }}>
                {col.label}
              </div>
              <div className="space-y-3">
                {col.links.map(link => (
                  <a
                    key={link.text}
                    href={link.href}
                    className="block text-[14px] transition-colors duration-200"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)' }}
                    {...(link.href.startsWith('mailto:') ? {} : { rel: 'noopener noreferrer' })}
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom line */}
        <div
          className="flex flex-col md:flex-row justify-between gap-4 pt-8 text-[12px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.28)' }}
        >
          <div>© {new Date().getFullYear()} Keiro · Free forever</div>
          <div>Built with care for communities that deserve better healthcare access.</div>
        </div>
        <p className="mt-5 text-[11px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
          Keiro is a bridge, not a substitute for professional clinical judgment. Always consult with a licensed provider.
        </p>
      </div>
    </footer>
  )
}