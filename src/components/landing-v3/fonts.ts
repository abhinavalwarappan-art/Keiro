// Two reading faces. Patient scripts use the platform's script-specific fallback.
import { Literata, Source_Sans_3 } from 'next/font/google'
export const literata = Literata({ subsets: ['latin', 'latin-ext', 'vietnamese'], display: 'swap', variable: '--font-literata', style: ['normal', 'italic'], axes: ['opsz'] })
export const sourceSans = Source_Sans_3({ subsets: ['latin', 'latin-ext', 'vietnamese'], display: 'swap', variable: '--font-source-sans' })
