import { KaiDemo } from './KaiDemo'

export function Hero() {
  return (
    <section id="hero" className="keiro-hero" aria-labelledby="hero-title">
      <div className="keiro-intro">
        <p className="keiro-welcome">A little help before your doctor’s visit</p>
        <h1 id="hero-title" data-testid="hero-headline">Tell Kai how you feel.<span>In your own language.</span></h1>
        <p>Kai helps you put your symptoms into clear English for your doctor. Kai is an AI assistant and does not diagnose.</p>
      </div>
      <KaiDemo />
    </section>
  )
}
