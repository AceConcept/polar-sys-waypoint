import { useEffect, useRef, useState } from 'react'
import { getPolarSysEmbedBase, polarSysIframeHref } from '../polarSysUrl'
import { polarFlowIdFromHash, useFlowStore } from '../store/flowStore'

const ARTBOARD_WIDTH = 2560
const ARTBOARD_HEIGHT = 1440

type WaypointStepsScreenProps = {
  polarHash: string
}

export default function WaypointStepsScreen({ polarHash }: WaypointStepsScreenProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  useEffect(() => {
    setIframeLoaded(false)
  }, [polarHash])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash !== polarHash) {
      window.location.hash = polarHash
    }
  }, [polarHash])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let rafId = 0
    const scheduleScale = () => {
      if (rafId !== 0) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const frame = host.querySelector<HTMLElement>('#scale-frame')
        const board = host.querySelector<HTMLElement>('#artboard')
        if (!frame || !board) return

        const width = host.clientWidth
        const height = host.clientHeight
        if (width <= 0 || height <= 0) return

        const scale = Math.min(width / ARTBOARD_WIDTH, height / ARTBOARD_HEIGHT)
        board.style.transform = `scale(${scale})`
        frame.style.width = `${Math.ceil(ARTBOARD_WIDTH * scale)}px`
        frame.style.height = `${Math.ceil(ARTBOARD_HEIGHT * scale)}px`
      })
    }

    scheduleScale()

    const ro = new ResizeObserver(scheduleScale)
    ro.observe(host)
    window.addEventListener('resize', scheduleScale)
    window.addEventListener('hashchange', scheduleScale)

    const f = host.querySelector<HTMLElement>('#scale-frame')
    const b = host.querySelector<HTMLElement>('#artboard')
    const mo = f && b ? new MutationObserver(scheduleScale) : null
    if (f && mo) mo.observe(f, { attributes: true, attributeFilter: ['style'] })
    if (b && mo) mo.observe(b, { attributes: true, attributeFilter: ['style'] })

    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId)
      ro.disconnect()
      mo?.disconnect()
      window.removeEventListener('resize', scheduleScale)
      window.removeEventListener('hashchange', scheduleScale)
    }
  }, [])

  useEffect(() => {
    const onHashChange = () => {
      useFlowStore.getState().goToStepById(polarFlowIdFromHash(window.location.hash))
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  /** polar-sys may post `{ type: 'polar-hash', hash: '#/monitor' }` so the shell sidebar stays in sync. */
  useEffect(() => {
    let expectedOrigin: string
    try {
      expectedOrigin = new URL(`${getPolarSysEmbedBase()}/`).origin
    } catch {
      return
    }
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== expectedOrigin) return
      const d = e.data as { type?: string; hash?: string }
      if (d?.type !== 'polar-hash' || typeof d.hash !== 'string') return
      if (window.location.hash !== d.hash) window.location.hash = d.hash
      useFlowStore.getState().goToStepById(polarFlowIdFromHash(d.hash))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const embedBase = getPolarSysEmbedBase()
  const iframeSrc = polarSysIframeHref(polarHash)

  return (
    <div ref={hostRef} className="viewport">
      <div id="scale-frame" className="scale-frame">
        <div id="artboard" className="artboard polar-slot-artboard">
          <iframe
            key={polarHash}
            title="polar-sys"
            src={iframeSrc}
            className="polar-sys-remote-frame"
            width={ARTBOARD_WIDTH}
            height={ARTBOARD_HEIGHT}
            onLoad={() => setIframeLoaded(true)}
          />
          {!iframeLoaded ? (
            <div
              className="polar-sys-connect-placeholder"
              role="status"
              aria-live="polite"
              aria-label="Waiting for polar-sys app"
            >
              <span className="polar-sys-connect-placeholder__title">Fix connection to main project</span>
              <span className="polar-sys-connect-placeholder__hint">
                Loading from {embedBase}. Set <code>VITE_POLAR_SYS_ORIGIN</code> to override. If this never
                clears, confirm the polar app allows embedding from this domain.
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
