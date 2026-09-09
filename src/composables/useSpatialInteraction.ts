import { onMounted, onUnmounted } from 'vue'

type Spring = { value: number; velocity: number; target: number }
type DepthLayer = { element: HTMLElement; depth: number }
const layerSelector = '[data-depth], [data-spatial], [data-depth-content] > *'
const spring = (): Spring => ({ value: 0, velocity: 0, target: 0 })
const unsettled = (value: Spring) => Math.abs(value.value - value.target) > 0.0005 || Math.abs(value.velocity) > 0.002
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

/** One scheduler composes viewport depth with local hover, then sleeps at rest. */
export function useSpatialInteraction() {
  const surfaces = new Map<HTMLElement, Surface>()
  const layers = new Map<HTMLElement, DepthLayer>()
  const visibleLayers = new Set<DepthLayer>()
  const camera = [spring(), spring()]
  let current: Surface | undefined
  let frame = 0
  let previous = 0
  let motion: MediaQueryList | undefined
  let pointer: MediaQueryList | undefined
  let observer: IntersectionObserver | undefined
  let mutations: MutationObserver | undefined
  let layersDirty = false
  let dragging = false
  let viewportWidth = 1
  let viewportHeight = 1

  function enabled() { return !motion?.matches && pointer?.matches && !document.hidden }

  function clearLayer(layer: DepthLayer) {
    for (const property of ['--float-x', '--float-y', '--float-rotation', '--float-shadow-x', '--float-shadow-y']) {
      layer.element.style.removeProperty(property)
    }
    layer.element.removeAttribute('data-floating-moving')
  }

  function collect(root: ParentNode) {
    const elements = [...root.querySelectorAll<HTMLElement>(layerSelector)]
    if (root instanceof HTMLElement && root.matches(layerSelector)) elements.push(root)
    for (const element of elements) {
      if (layers.has(element)) continue
      const fallback = element.matches('h1, h2, h3') ? 12
        : element.dataset.spatial === 'magnetic' ? 5
        : element.dataset.spatial === 'subtle' ? 8
        : element.hasAttribute('data-spatial') ? 14 : 6
      const requested = Number(element.dataset.depth ?? fallback)
      const depth = Number.isFinite(requested) ? Math.max(0, Math.min(24, requested)) : fallback
      const layer = { element, depth }
      layers.set(element, layer)
      element.setAttribute('data-floating', '')
      observer?.observe(element)
    }
  }

  // Analytic damped spring, independent of pointer frequency and display refresh.
  function advance(spring: Spring, envelope: number, sine: number, cosine: number, decay = 19) {
    const offset = spring.value - spring.target
    const frequency = 15
    const coefficient = (spring.velocity + decay * offset) / frequency
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
    for (const value of camera) value.value = value.velocity = value.target = 0
    layers.forEach(clearLayer)
    layersDirty = false
    dragging = false
  }

  function leaveSurface() {
    if (!current) return
    current.springs.forEach(spring => spring.target = 0)
    current.element.removeAttribute('data-spatial-hover')
    current = undefined
    schedule()
  }

  function leave() {
    if (dragging) return
    leaveSurface()
    for (const value of camera) value.target = 0
    dragging = false
    schedule()
  }

  function update(now: number) {
    frame = 0
    const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 1 / 60
    previous = now
    const envelope = Math.exp(-19 * delta)
    const sine = Math.sin(15 * delta)
    const cosine = Math.cos(15 * delta)
    const follow = 1 - Math.exp(-delta * 32)
    let moving = false
    // Foreground follows more slowly than the light and hovered card.
    const cameraMoving = camera.some(unsettled)
    if (cameraMoving || layersDirty) {
      const cameraEnvelope = Math.exp(-11 * delta)
      for (const value of camera) advance(value, cameraEnvelope, sine, cosine, 11)
      moving = camera.some(unsettled)
      if (!moving) for (const value of camera) { value.value = value.target; value.velocity = 0 }
      const x = camera[0]!.value
      const y = camera[1]!.value
      const magnitude = Math.hypot(x, y)
      for (const layer of visibleLayers) {
        const { element, depth } = layer
        element.style.setProperty('--float-x', `${(x * depth).toFixed(3)}px`)
        element.style.setProperty('--float-y', `${(y * depth * 0.65).toFixed(3)}px`)
        element.style.setProperty('--float-rotation', magnitude > 0.001
          ? `${(-y / magnitude).toFixed(4)} ${(x / magnitude).toFixed(4)} 0 ${(magnitude * depth * 0.045).toFixed(3)}deg` : 'none')
        element.style.setProperty('--float-shadow-x', `${(-x * 12).toFixed(2)}px`)
        element.style.setProperty('--float-shadow-y', `${(22 - y * 8).toFixed(2)}px`)
        element.toggleAttribute('data-floating-moving', moving)
      }
      layersDirty = false
    }
    for (const surface of surfaces.values()) {
      if (!surface.element.isConnected) { clear(surface); continue }
      for (const spring of surface.springs) advance(spring, envelope, sine, cosine)
      const x = surface.springs[0]!.value
      const y = surface.springs[1]!.value
      const rx = surface.springs[2]!.value
      const ry = surface.springs[3]!.value
      surface.element.style.transform = `perspective(1000px) translate3d(${x.toFixed(3)}px, ${y.toFixed(3)}px, 0) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`
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
    if (!frame && enabled()) frame = requestAnimationFrame(update)
  }

  function targetCamera(event: PointerEvent) {
    camera[0]!.target = Math.max(-1, Math.min(1, event.clientX / viewportWidth * 2 - 1))
    camera[1]!.target = Math.max(-1, Math.min(1, event.clientY / viewportHeight * 2 - 1))
  }

  function move(event: PointerEvent) {
    if (!enabled() || event.pointerType === 'touch') { reset(); return }
    if (event.buttons) return
    dragging = false
    targetCamera(event)
    schedule()
    const element = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-spatial]') : null
    if (element !== current?.element) {
      leaveSurface()
      if (element) {
        current = surfaces.get(element)
        if (!current) {
          const bounds = element.getBoundingClientRect()
          current = {
            element, bounds,
            light: element.querySelector('[data-spatial-light]'),
            detail: element.querySelector('[data-spatial-detail]'),
            springs: Array.from({ length: 4 }, spring),
            lightX: event.clientX - bounds.left, lightY: event.clientY - bounds.top,
            pointerX: 0, pointerY: 0,
          }
          surfaces.set(element, current)
        }
        current.bounds = element.getBoundingClientRect()
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

  function pointerDown(event: PointerEvent) {
    if (event.pointerType === 'touch') { reset(); return }
    // Keep the pressed target and text selection still, including the sculpture frame.
    dragging = true
    for (const value of [...camera, ...[...surfaces.values()].flatMap(surface => surface.springs)]) {
      value.target = value.value
      value.velocity = 0
    }
    layersDirty = true
    schedule()
  }

  function pointerUp(event: PointerEvent) {
    dragging = false
    if (!enabled() || event.pointerType === 'touch') return
    targetCamera(event)
    schedule()
  }

  function focus(event: FocusEvent) {
    if (event.target instanceof Element && event.target.matches(':focus-visible')) reset()
  }

  function resize() {
    viewportWidth = window.innerWidth
    viewportHeight = window.innerHeight
    reset()
  }

  onMounted(() => {
    motion = matchMedia('(prefers-reduced-motion: reduce)')
    pointer = matchMedia('(hover: hover) and (pointer: fine)')
    motion.addEventListener('change', reset)
    pointer.addEventListener('change', reset)
    resize()
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const layer = layers.get(entry.target as HTMLElement)
        if (!layer) continue
        if (entry.isIntersecting) visibleLayers.add(layer)
        else { visibleLayers.delete(layer); clearLayer(layer) }
      }
      layersDirty = true
      schedule()
    }, { rootMargin: '48px' })
    collect(document)
    mutations = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) if (node instanceof HTMLElement) collect(node)
      }
      for (const [element, layer] of layers) {
        if (element.isConnected) continue
        observer?.unobserve(element)
        visibleLayers.delete(layer)
        clearLayer(layer)
        element.removeAttribute('data-floating')
        layers.delete(element)
        const surface = surfaces.get(element)
        if (surface) { if (current === surface) current = undefined; clear(surface) }
      }
    })
    mutations.observe(document.querySelector('.site-shell') ?? document.body, { childList: true, subtree: true })
    document.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerdown', pointerDown, { passive: true })
    document.addEventListener('pointerup', pointerUp, { passive: true })
    document.addEventListener('pointercancel', reset)
    document.addEventListener('pointerleave', leave)
    document.addEventListener('focusin', focus)
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('blur', reset)
    window.addEventListener('scroll', leaveSurface, { passive: true, capture: true })
    window.addEventListener('resize', resize, { passive: true })
  })
  onUnmounted(() => {
    reset()
    observer?.disconnect()
    mutations?.disconnect()
    layers.forEach(layer => layer.element.removeAttribute('data-floating'))
    layers.clear()
    visibleLayers.clear()
    motion?.removeEventListener('change', reset)
    pointer?.removeEventListener('change', reset)
    document.removeEventListener('pointermove', move)
    document.removeEventListener('pointerdown', pointerDown)
    document.removeEventListener('pointerup', pointerUp)
    document.removeEventListener('pointercancel', reset)
    document.removeEventListener('pointerleave', leave)
    document.removeEventListener('focusin', focus)
    document.removeEventListener('visibilitychange', visibility)
    window.removeEventListener('blur', reset)
    window.removeEventListener('scroll', leaveSurface, true)
    window.removeEventListener('resize', resize)
  })
}
