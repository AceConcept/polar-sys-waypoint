/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Polar-sys app origin for the steps iframe (no trailing slash). If unset,
   * defaults to `https://polar-sys.vercel.app`.
   */
  readonly VITE_POLAR_SYS_ORIGIN?: string

  /**
   * Optional Vercel Deployment Protection bypass token (Settings → Deployment Protection →
   * Protection Bypass for Automation on the polar-sys project). Appended to the iframe URL
   * as `x-vercel-protection-bypass=<token>&x-vercel-set-bypass-cookie=samesitenone`. Treat as
   * effectively public — the value is shipped in the JS bundle.
   */
  readonly VITE_POLAR_SYS_BYPASS_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
