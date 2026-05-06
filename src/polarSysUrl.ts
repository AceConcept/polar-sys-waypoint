/** Hosted polar-sys (default https://polar-sys.vercel.app, e.g. #/anomaly). Override with `VITE_POLAR_SYS_ORIGIN`. */
const POLAR_SYS_DEFAULT_BASE = 'https://polar-sys.vercel.app'

export function getPolarSysEmbedBase(): string {
  const raw = import.meta.env.VITE_POLAR_SYS_ORIGIN
  const fromEnv = typeof raw === 'string' ? raw.trim() : ''
  return (fromEnv.length > 0 ? fromEnv : POLAR_SYS_DEFAULT_BASE).replace(/\/$/, '')
}

/** `polarHash` is `#/anomaly` | `#/monitor` | `#/incident` (matches `POLAR_SYS_HASH`). */
export function polarSysIframeHref(polarHash: string): string {
  const base = getPolarSysEmbedBase()
  const fragment = polarHash.startsWith('#') ? polarHash : `#/${polarHash.replace(/^#\/?/, '')}`
  return new URL(fragment, `${base}/`).href
}
