/** Hosted polar-sys (default https://polar-sys.vercel.app, e.g. #/anomaly). Override with `VITE_POLAR_SYS_ORIGIN`. */
const POLAR_SYS_DEFAULT_BASE = 'https://polar-sys.vercel.app'

export function getPolarSysEmbedBase(): string {
  const raw = import.meta.env.VITE_POLAR_SYS_ORIGIN
  const fromEnv = typeof raw === 'string' ? raw.trim() : ''
  return (fromEnv.length > 0 ? fromEnv : POLAR_SYS_DEFAULT_BASE).replace(/\/$/, '')
}

/**
 * Optional Vercel Deployment Protection bypass token. When set, the iframe URL gets
 * `x-vercel-protection-bypass=<token>&x-vercel-set-bypass-cookie=samesitenone`, which lets
 * an iframe served from a different origin skip Deployment Protection on polar-sys. Note:
 * does **not** bypass System Mitigations / DDoS / JA4 — that's a separate Vercel layer.
 */
function getPolarSysBypassToken(): string | undefined {
  const raw = import.meta.env.VITE_POLAR_SYS_BYPASS_TOKEN
  const trimmed = typeof raw === 'string' ? raw.trim() : ''
  return trimmed.length > 0 ? trimmed : undefined
}

/** `polarHash` is `#/anomaly` | `#/monitor` | `#/incident` (matches `POLAR_SYS_HASH`). */
export function polarSysIframeHref(polarHash: string): string {
  const base = getPolarSysEmbedBase()
  const fragment = polarHash.startsWith('#') ? polarHash : `#/${polarHash.replace(/^#\/?/, '')}`
  const url = new URL(fragment, `${base}/`)

  const bypassToken = getPolarSysBypassToken()
  if (bypassToken !== undefined) {
    url.searchParams.set('x-vercel-protection-bypass', bypassToken)
    url.searchParams.set('x-vercel-set-bypass-cookie', 'samesitenone')
  }

  return url.href
}
