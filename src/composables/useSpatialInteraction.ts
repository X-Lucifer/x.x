import { onMounted, onUnmounted } from 'vue'

/** Shared pointer scheduling; no component re-renders during pointer movement. */
export function useSpatialInteraction() {
  let current: HTMLElement | null = null
  let light: HTMLElement | null = null
  let bounds: DOMRect | undefined
  let frame = 0
  let x = 0
  let y = 0
  let tiltX = 0
  let tiltY = 0
  let depth = 0
  let previous = 0
  let motion: MediaQueryList | undefined

  function reset() {
    cancelAnimationFrame(frame)
    frame = 0
    current?.style.removeProperty('transform')
    current?.removeAttribute('data-spatial-active')
    current = null
    light = null
    bounds = undefined
    tiltX = tiltY = depth = previous = 0
  }

  function update(now: number) {
    frame = 0
    if (!current || !bounds || !current.isConnected) { reset(); return }
    const px = Math.max(-1, Math.min(1, (x - bounds.left) / bounds.width * 2 - 1))
    const py = Math.max(-1, Math.min(1, (y - bounds.top) / bounds.height * 2 - 1))
    const strength = current.dataset.spatial === 'subtle' ? 2 : 5
    const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 1 / 60
    previous = now
    const ease = 1 - Math.exp(-delta * 26)
    tiltX += (-py * strength - tiltX) * ease
    tiltY += (px * strength - tiltY) * ease
    depth += (8 - depth) * ease
    // Transform only the active layer; inherited variables would restyle its subtree.
    current.style.transform = `perspective(1000px) translateZ(${depth.toFixed(3)}px) rotateX(${tiltX.toFixed(3)}deg) rotateY(${tiltY.toFixed(3)}deg)`
    if (light) light.style.transform = `translate3d(${x - bounds.left}px, ${y - bounds.top}px, 0)`
    if (Math.abs(-py * strength - tiltX) + Math.abs(px * strength - tiltY) + Math.abs(8 - depth) > 0.005) {
      frame = requestAnimationFrame(update)
    } else {
      previous = 0
    }
  }

  function move(event: PointerEvent) {
    if (motion?.matches || event.pointerType === 'touch') { reset(); return }
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-spatial]') : null
    if (target !== current) {
      reset()
      current = target
      bounds = current?.getBoundingClientRect()
      light = current?.querySelector<HTMLElement>('[data-spatial-light]') ?? null
      current?.setAttribute('data-spatial-active', '')
    }
    if (!current) return
    x = event.clientX
    y = event.clientY
    if (!frame) frame = requestAnimationFrame(update)
  }

  function focusOut(event: FocusEvent) {
    if (!event.relatedTarget) reset()
  }

  onMounted(() => {
    motion = matchMedia('(prefers-reduced-motion: reduce)')
    motion.addEventListener('change', reset)
    document.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', reset)
    window.addEventListener('blur', reset)
    window.addEventListener('wheel', reset, { passive: true })
    window.addEventListener('scroll', reset, { passive: true, capture: true })
    window.addEventListener('resize', reset, { passive: true })
    window.addEventListener('focusout', focusOut)
  })
  onUnmounted(() => {
    reset()
    motion?.removeEventListener('change', reset)
    document.removeEventListener('pointermove', move)
    document.removeEventListener('pointerleave', reset)
    window.removeEventListener('blur', reset)
    window.removeEventListener('wheel', reset)
    window.removeEventListener('scroll', reset, true)
    window.removeEventListener('resize', reset)
    window.removeEventListener('focusout', focusOut)
  })
}
