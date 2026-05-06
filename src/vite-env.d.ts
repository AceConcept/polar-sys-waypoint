/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Polar-sys app origin for the steps iframe (no trailing slash). If unset,
   * defaults to `https://polar-sys.vercel.app`.
   */
  readonly VITE_POLAR_SYS_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
