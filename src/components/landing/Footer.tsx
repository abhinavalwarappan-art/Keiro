export default function Footer() {
  return (
    <footer className="bg-[#0a1f12] text-white pt-24 pb-12 px-4 md:px-8 relative overflow-hidden">
      <div className="absolute -bottom-12 left-0 right-0 font-display text-[clamp(80px,18vw,280px)] leading-[0.85] text-[#1a3d2b] opacity-40 select-none pointer-events-none whitespace-nowrap overflow-hidden">
        KEIRO · KEIRO · KEIRO
      </div>
      <div className="max-w-[1400px] mx-auto relative">
        <div className="grid lg:grid-cols-12 gap-8 mb-20 pb-20 border-b border-[#1a3d2b]">
          <div className="lg:col-span-8">
            <h3 className="font-display text-[clamp(32px,5vw,72px)] leading-[1] tracking-tight">
              Healthcare in<br />
              <span className="italic text-keiro-light">every language.</span>
            </h3>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 flex items-start">
            <a
              href="/onboarding"
              className="bg-white text-[#0a1f12] rounded-full px-6 h-12 inline-flex items-center gap-2 font-medium hover:bg-keiro-light transition"
            >
              Open Keiro <span>→</span>
            </a>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-keiro-mid flex items-center justify-center">
                <span className="text-white font-medium text-sm">K</span>
              </div>
              <span className="font-medium">Keiro</span>
            </div>
            <p className="text-[14px] text-white/60 leading-relaxed max-w-[280px]">
              Empowering patients through gentle, AI-guided medical communication.
            </p>
          </div>
          <div className="lg:col-span-2">
            <div className="text-[12px] uppercase tracking-widest text-white/40 mb-4">Product</div>
            <div className="space-y-2 text-[14px]">
              <a className="block hover:text-keiro-light transition" href="/onboarding">Open app</a>
              <a className="block hover:text-keiro-light transition" href="#how">How it works</a>
              <a className="block hover:text-keiro-light transition" href="#languages">Languages</a>
              <a className="block hover:text-keiro-light transition" href="#hospitals">For hospitals</a>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="text-[12px] uppercase tracking-widest text-white/40 mb-4">Legal</div>
            <div className="space-y-2 text-[14px]">
              <a className="block hover:text-keiro-light transition" href="/privacy">Privacy Policy</a>
              <a className="block hover:text-keiro-light transition" href="/terms">Terms of Use</a>
              <a className="block hover:text-keiro-light transition" href="/emergency">Emergency</a>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="text-[12px] uppercase tracking-widest text-white/40 mb-4">Contact</div>
            <div className="space-y-2 text-[14px]">
              <a className="block hover:text-keiro-light transition" href="mailto:hello@keiro.app">hello@keiro.app</a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1a3d2b] flex flex-col md:flex-row flex-wrap justify-between gap-4 text-[12px] text-white/40">
          <div>© {new Date().getFullYear()} Keiro · Free forever</div>
          <div className="max-w-md text-right">
            Built with care for communities that deserve better healthcare access.
          </div>
        </div>
        <p className="mt-6 text-[11px] text-white/30 max-w-xl">
          Keiro is a bridge, not a substitute for professional clinical judgment. Always consult with a licensed provider.
        </p>
      </div>
    </footer>
  )
}
