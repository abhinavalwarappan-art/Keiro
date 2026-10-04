import Link from 'next/link'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { HomeButton } from '@/components/home/HomeButton'

/* A wrong link is the site's fault, not the visitor's — so the page says where
   to go next instead of showing an error code. It keeps the full nav and footer
   so nothing feels like a dead end. */
export default function NotFound() {
  return (
    <SiteShell flow="home">
      <section className="px-5 pb-28 pt-24 text-center sm:px-8 md:pb-36 md:pt-32">
        <div className="mx-auto max-w-[44rem]">
          <p className="text-[0.9375rem] font-semibold text-[var(--hm-faint)]">Page not found</p>
          <h1 className="hm-h2 mt-4">
            We couldn&apos;t find that page. <span className="hm-quiet">The link may be old.</span>
          </h1>
          <p className="hm-lede mx-auto mt-6 max-w-[30rem]">
            Everything Keiro does starts from the home page — or you can go straight to Kai.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-8">
            <HomeButton href="/onboarding?fresh=1">Start talking to Kai</HomeButton>
            <Link href="/" className="lx-focus hm-link">
              Go to the home page
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
