import { onMounted, onUnmounted } from 'vue'

type Spring = { value: number; velocity: number; target: number }
type Surface = {
  element: HTMLElement
  bounds: DOMRect
  light: HTMLElement | null
  detail: HTMLElement | null
  springs: Spring[]
  lightX: number
  lightY: number
  pointerX: number
  pointerY: number
}

/** One scheduler owns the hovered surface and any surfaces still settling. */
export function useSpatialInteraction() {
  const surfaces = new Map<HTMLElement, Surface>()
  let current: Surface | undefined
  let frame = 0
  let previous = 0
  let motion: MediaQueryList | undefined

  // Analytic damped spring, independent of pointer frequency and display refresh.
  function advance(spring: Spring, delta: number) {
    const offset = spring.value - spring.target
    const decay = 19
    const frequency = 15
    const coefficient = (spring.velocity + decay * offset) / frequency
    const envelope = Math.exp(-decay * delta)
    const sine = Math.sin(frequency * delta)
    const cosine = Math.cos(frequency * delta)
    const position = offset * cosine + coefficient * sine
    spring.value = spring.target + envelope * position
    spring.velocity = envelope * (frequency * (coefficient * cosine - offset * sine) - decay * position)
  }

  function clear(surface: Surface) {
    surface.element.style.removeProperty('transform')
    surface.element.removeAttribute('data-spatial-active')
    surface.element.removeAttribute('data-spatial-hover')
    surface.light?.style.removeProperty('transform')
    surface.detail?.style.removeProperty('translate')
    surfaces.delete(surface.element)
  }

  function reset() {
    cancelAnimationFrame(frame)
    frame = previous = 0
    surfaces.forEach(clear)
    current = undefined
  }

  function leave() {
    if (!current) return
    current.springs.forEach(spring => spring.target = 0)
    current.element.removeAttribute('data-spatial-hover')
    current = undefined
    schedule()
  }

  function update(now: number) {
    frame = 0
    const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 1 / 60
    previous = now
    let moving = false
    for (const surface of surfaces.values()) {
      if (!surface.element.isConnected) { clear(surface); continue }
      surface.springs.forEach(spring => advance(spring, delta))
      const [x, y, rx, ry] = surface.springs.map(spring => spring.value) as [number, number, number, number]
      surface.element.style.transform = `perspective(1000px) translate3d(${x.toFixed(3)}px, ${y.toFixed(3)}px, 0) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`
      const follow = 1 - Math.exp(-delta * 32)
      surface.lightX += (surface.pointerX - surface.lightX) * follow
      surface.lightY += (surface.pointerY - surface.lightY) * follow
      if (surface.light) surface.light.style.transform = `translate3d(${surface.lightX.toFixed(2)}px, ${surface.lightY.toFixed(2)}px, 0)`
      if (surface.detail) surface.detail.style.translate = `${(ry * 1.4).toFixed(2)}px ${(rx * -1.4).toFixed(2)}px`
      const settling = surface.springs.some(spring => Math.abs(spring.value - spring.target) > 0.005 || Math.abs(spring.velocity) > 0.02)
        || Math.abs(surface.lightX - surface.pointerX) + Math.abs(surface.lightY - surface.pointerY) > 0.1
      if (settling) moving = true
      else if (surface !== current) clear(surface)
    }
    if (moving) frame = requestAnimationFrame(update)
    else previous = 0
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update)
  }

  function move(event: PointerEvent) {
    if (motion?.matches || event.pointerType === 'touch') { reset(); return }
    const element = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-spatial]') : null
    if (element !== current?.element) {
      leave()
      if (element) {
        current = surfaces.get(element)
        if (!current) {
          const bounds = element.getBoundingClientRect()
          current = {
            element, bounds,
            light: element.querySelector('[data-spatial-light]'),
            detail: element.querySelector('[data-spatial-detail]'),
            springs: Array.from({ length: 4 }, () => ({ value: 0, velocity: 0, target: 0 })),
            lightX: event.clientX - bounds.left, lightY: event.clientY - bounds.top,
            pointerX: 0, pointerY: 0,
          }
          surfaces.set(element, current)
        }
        element.setAttribute('data-spatial-active', '')
        element.setAttribute('data-spatial-hover', '')
      }
    }
    if (!current) return
    const { bounds, springs } = current
    const px = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1))
    const py = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1))
    const magnetic = current.element.dataset.spatial === 'magnetic'
    const subtle = current.element.dataset.spatial === 'subtle'
    const strength = magnetic ? 0 : subtle ? 1.2 : 4.5
    springs[0]!.target = px * (magnetic ? 4 : subtle ? 1.5 : 2)
    springs[1]!.target = py * (magnetic ? 3 : 1.5) - (magnetic ? 0 : subtle ? 1 : 5)
    springs[2]!.target = -py * strength
    springs[3]!.target = px * strength
    current.pointerX = event.clientX - bounds.left
    current.pointerY = event.clientY - bounds.top
    schedule()
  }

  function visibility() {
    if (document.hidden) reset()
  }

  onMounted(() => {
    motion = matchMedia('(prefers-reduced-motion: reduce)')
    motion.addEventListener('change', reset)
    document.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('blur', reset)
    window.addEventListener('scroll', reset, { passive: true, capture: true })
    window.addEventListener('resize', reset, { passive: true })
  })
  onUnmounted(() => {
    reset()
    motion?.removeEventListener('change', reset)
    document.removeEventListener('pointermove', move)
    document.removeEventListener('pointerleave', leave)
    document.removeEventListener('visibilitychange', visibility)
    window.removeEventListener('blur', reset)
    window.removeEventListener('scroll', reset, true)
    window.removeEventListener('resize', reset)
  })
}
