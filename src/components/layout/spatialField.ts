import * as THREE from 'three'
import { observeTheme } from '../../composables/useTheme'
import { createSpatialGrid } from './spatialGeometry'
import { createFloatingObjects } from './floatingObjects'

/** A persistent, low-resolution world shared by every route. */
export function createSpatialField(host: HTMLElement) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' })
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 70)
  camera.position.set(0, 1.3, 8)
  const world = new THREE.Group()
  scene.add(world)
  let disposed = false
  let frame = 0
  let previous = 0
  let time = 0
  let scrollDepth = 0
  let targetX = 0
  let targetY = 0
  let presence = 0
  let speed = 0
  let pointerTime = 0
  let lastTrail = -1
  let trailIndex = 0
  let rippleIndex = 0
  const trails = Array.from({ length: 7 }, () => new THREE.Vector4(0, 0, -10, 0))
  const ripples = Array.from({ length: 3 }, () => new THREE.Vector4(0, 0, -10, 0))
  const interaction = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2() },
    uAspect: { value: 1 },
    uPresence: { value: 0 },
    uSpeed: { value: 0 },
    uTrails: { value: trails },
    uRipples: { value: ripples },
    uLightMode: { value: 0 },
  }
  const fieldShader = `
    uniform float uTime;
    uniform vec2 uPointer;
    uniform float uAspect;
    uniform float uPresence;
    uniform float uSpeed;
    uniform vec4 uTrails[7];
    uniform vec4 uRipples[3];
    vec2 fieldAt(vec2 screen) {
      vec2 delta = (screen - uPointer) * vec2(uAspect, 1.0);
      float light = exp(-dot(delta, delta) * 20.0) * uPresence;
      float wave = 0.0;
      for (int i = 0; i < 7; i++) {
        float age = max(0.0, uTime - uTrails[i].z);
        if (uTrails[i].w > 0.0 && age < 1.7) {
          vec2 offset = (screen - uTrails[i].xy) * vec2(uAspect, 1.0);
          light += exp(-dot(offset, offset) * 65.0 - age * 3.8) * uTrails[i].w * 0.36;
        }
      }
      for (int i = 0; i < 3; i++) {
        float age = max(0.0, uTime - uRipples[i].z);
        if (uRipples[i].w > 0.0 && age < 3.5) {
          float distance = length((screen - uRipples[i].xy) * vec2(uAspect, 1.0));
          float radius = age * 0.8;
          wave += exp(-pow((distance - radius) * 24.0, 2.0) - age * 1.8) * uRipples[i].w;
        }
      }
      return vec2(min(light, 1.65), wave);
    }
  `
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  const resources: { dispose(): void }[] = []
  const own = <T extends { dispose(): void }>(resource: T): T => { resources.push(resource); return resource }
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  renderer.setClearColor(0x000000, 0)
  let resizeObserver: ResizeObserver | undefined
  let stopTheme: (() => void) | undefined
  let renderWidth = 0
  let renderHeight = 0
  let floatingObjects: ReturnType<typeof createFloatingObjects> | undefined
  let matrixGeometry: THREE.BufferGeometry | undefined
  let matrixPositions: THREE.BufferAttribute | undefined
  const matrixScale = { value: 1 }
  const gridMaterial = own(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { ...interaction, uScroll: { value: 0 } },
    vertexShader: `
      ${fieldShader}
      uniform float uScroll;
      varying float vDepth;
      varying float vHeight;
      varying float vLight;
      void main() {
        vec3 p = position;
        p.z += uScroll;
        p.y += sin(p.x * 0.4 + p.z * 0.22 + uTime * 0.22) * 0.28;
        vec4 base = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        vec2 field = fieldAt(base.xy / max(base.w, 0.1));
        p.y += field.x * (0.28 + uSpeed * 0.18) + field.y * 0.3;
        vLight = field.x * 0.6 + field.y;
        vHeight = p.y;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform float uLightMode;
      varying float vDepth;
      varying float vHeight;
      varying float vLight;
      void main() {
        float fade = (1.0 - smoothstep(14.0, 43.0, vDepth)) * smoothstep(1.0, 5.0, vDepth);
        vec3 color = mix(vec3(0.18, 0.71, 0.4), vec3(0.19, 0.35, 0.25), uLightMode);
        color = mix(color, mix(vec3(0.52, 1.0, 0.77), vec3(0.12, 0.42, 0.29), uLightMode), min(vLight, 1.0));
        gl_FragColor = vec4(color, fade * (0.2 + (vHeight + 2.0) * 0.1 + vLight * 0.42) * mix(1.0, 0.65, uLightMode));
      }
    `,
  }))

  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    resizeObserver?.disconnect()
    stopTheme?.()
    document.removeEventListener('pointermove', pointerMove)
    document.removeEventListener('pointerdown', pointerDown)
    document.removeEventListener('pointerleave', pointerLeave)
    document.removeEventListener('pointerup', pointerUp)
    document.removeEventListener('pointercancel', pointerUp)
    window.removeEventListener('blur', pointerLeave)
    document.removeEventListener('visibilitychange', sync)
    motion.removeEventListener('change', sync)
    canvas.removeEventListener('webglcontextlost', contextLost)
    resources.forEach(resource => resource.dispose())
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
  }

  try {
    const grid = createSpatialGrid()
    const gridGeometry = own(new THREE.BufferGeometry())
    gridGeometry.setAttribute('position', new THREE.BufferAttribute(grid.positions, 3))
    gridGeometry.setIndex(new THREE.BufferAttribute(grid.indices, 1))
    world.add(new THREE.LineSegments(gridGeometry, gridMaterial))

    matrixGeometry = own(new THREE.BufferGeometry())
    matrixGeometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3))
    const matrixMaterial = own(new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      uniforms: { ...interaction, uScale: matrixScale },
      vertexShader: `
        ${fieldShader}
        uniform float uScale;
        varying float vLight;
        varying float vAlpha;
        void main() {
          vec2 p = position.xy;
          vec2 field = fieldAt(p);
          vec2 offset = (p - uPointer) * vec2(uAspect, 1.0);
          p += normalize(offset + 0.0001) / vec2(uAspect, 1.0) * field.x * (0.012 + uSpeed * 0.012);
          vLight = min(1.0, field.x * 0.8 + field.y);
          float breathe = 0.5 + 0.5 * sin(position.x * 12.0 + position.y * 7.0 + uTime * 0.3);
          vAlpha = 0.028 + breathe * 0.02 + vLight * 0.7;
          gl_Position = vec4(p, 0.99, 1.0);
          gl_PointSize = (1.3 + vLight * 3.1) * uScale;
        }
      `,
      fragmentShader: `
        uniform float uLightMode;
        varying float vLight;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float point = 1.0 - smoothstep(0.12, 0.5, d);
          vec3 color = mix(vec3(0.2, 0.6, 0.4), vec3(0.64, 1.0, 0.83), vLight);
          color = mix(color, vec3(0.12, 0.38, 0.25), uLightMode);
          gl_FragColor = vec4(color, point * vAlpha * mix(1.0, 0.65, uLightMode));
        }
      `,
    }))
    const matrix = new THREE.Points(matrixGeometry, matrixMaterial)
    matrix.frustumCulled = false
    scene.add(matrix)

    const wireMaterial = own(new THREE.LineBasicMaterial({ color: 0x50c889, transparent: true, opacity: 0.16 }))
    floatingObjects = own(createFloatingObjects(interaction, fieldShader, matchMedia('(pointer: coarse), (max-width: 700px)').matches))
    world.add(floatingObjects.group)

    const points: number[] = []
    const connections: number[] = []
    // Deterministic constellations stay in the margins of the reading plane.
    for (const side of [-1, 1]) {
      for (let i = 0; i < 60; i++) {
        const x = side * (5 + Math.sin(i * 13.17) ** 2 * 11)
        const y = -1 + (Math.sin(i * 7.31) + 1) * 6
        const z = -1 - (i % 12) * 2.3
        points.push(x, y, z)
        if (i % 3 === 0) connections.push(x, y, z, x + side * 0.6, y + 0.4, z - 1)
      }
    }
    const pointGeometry = own(new THREE.BufferGeometry())
    pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    const pointMaterial = own(new THREE.PointsMaterial({ color: 0x9cffc6, size: 0.035, transparent: true, opacity: 0.42, depthWrite: false }))
    world.add(new THREE.Points(pointGeometry, pointMaterial))
    const connectionGeometry = own(new THREE.BufferGeometry())
    connectionGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connections, 3))
    world.add(new THREE.LineSegments(connectionGeometry, wireMaterial))
    // Motion is encoded in shaders; these local transforms never change.
    world.traverse(object => { object.updateMatrix(); object.matrixAutoUpdate = false })
    matrix.updateMatrix()
    matrix.matrixAutoUpdate = false

    stopTheme = observeTheme(theme => {
      const light = theme === 'light'
      gridMaterial.uniforms.uLightMode!.value = light ? 1 : 0
      gridMaterial.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending
      matrixMaterial.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending
      wireMaterial.color.set(light ? 0x42634e : 0x50c889)
      wireMaterial.opacity = light ? 0.2 : 0.16
      pointMaterial.color.set(light ? 0x366247 : 0x9cffc6)
      render(0)
    })

    host.append(canvas)
    document.addEventListener('pointermove', pointerMove, { passive: true })
    document.addEventListener('pointerdown', pointerDown, { passive: true })
    document.addEventListener('pointerleave', pointerLeave)
    document.addEventListener('pointerup', pointerUp, { passive: true })
    document.addEventListener('pointercancel', pointerUp, { passive: true })
    window.addEventListener('blur', pointerLeave)
    document.addEventListener('visibilitychange', sync)
    motion.addEventListener('change', sync)
    canvas.addEventListener('webglcontextlost', contextLost)
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    resize()
    sync()
  } catch (error) {
    dispose()
    throw error
  }

  function render(delta: number) {
    const amount = motion.matches ? 1 : 1 - Math.exp(-delta * 10)
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX * 0.65, amount)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.3 + targetY * 0.28, amount)
    camera.lookAt(targetX * 0.38, targetY * 0.2, -8)
    scrollDepth = THREE.MathUtils.lerp(scrollDepth, window.scrollY * 0.0015, amount)
    gridMaterial.uniforms.uTime!.value = time
    gridMaterial.uniforms.uScroll!.value = scrollDepth % 1
    const gridPointer = gridMaterial.uniforms.uPointer!.value as THREE.Vector2
    gridPointer.x = THREE.MathUtils.lerp(gridPointer.x, targetX, amount)
    gridPointer.y = THREE.MathUtils.lerp(gridPointer.y, targetY, amount)
    interaction.uPresence.value = THREE.MathUtils.lerp(interaction.uPresence.value, presence, amount)
    speed *= Math.exp(-delta * 5)
    interaction.uSpeed.value = THREE.MathUtils.lerp(interaction.uSpeed.value, speed, amount)
    floatingObjects?.update(scrollDepth, motion.matches)
    renderer.render(scene, camera)
  }

  function animate(now: number) {
    frame = 0
    if (disposed || document.hidden || motion.matches) return
    // Use the display cadence, including 90/120/144 Hz, without fractional skips.
    const delta = Math.min(Math.max((now - previous) / 1000, 0), 0.05)
    previous = now
    time += delta
    render(delta)
    frame = requestAnimationFrame(animate)
  }

  function resize() {
    if (disposed) return
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    // Bound fill cost on large/4K windows; CSS still occupies the full viewport.
    const scale = Math.min(devicePixelRatio || 1, 1, Math.sqrt(2_000_000 / (width * height)))
    const nextWidth = Math.max(1, Math.floor(width * scale))
    const nextHeight = Math.max(1, Math.floor(height * scale))
    if (renderWidth === nextWidth && renderHeight === nextHeight) return
    renderWidth = nextWidth
    renderHeight = nextHeight
    renderer.setSize(renderWidth, renderHeight, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    interaction.uAspect.value = camera.aspect
    matrixScale.value = scale
    const spacing = matchMedia('(pointer: coarse)').matches ? 40 : 28
    const count = Math.max(0, Math.ceil((width - spacing / 2) / spacing))
      * Math.max(0, Math.ceil((height - spacing / 2) / spacing))
    if (!matrixPositions || matrixPositions.count < count) {
      // Dispose before replacing the attribute so Three.js can release the old
      // GPU buffer and VAO. Smaller viewports reuse the existing allocation.
      matrixGeometry?.dispose()
      matrixPositions = new THREE.BufferAttribute(new Float32Array(count * 3), 3)
        .setUsage(THREE.DynamicDrawUsage)
      matrixGeometry?.setAttribute('position', matrixPositions)
    }
    const points = matrixPositions.array
    let offset = 0
    for (let y = spacing / 2; y < height; y += spacing) {
      for (let x = spacing / 2; x < width; x += spacing) {
        points[offset++] = x / width * 2 - 1
        points[offset++] = 1 - y / height * 2
        points[offset++] = 0
      }
    }
    matrixGeometry?.setDrawRange(0, count)
    matrixPositions.clearUpdateRanges()
    matrixPositions.addUpdateRange(0, count * 3)
    matrixPositions.needsUpdate = true
    render(1)
  }

  function pointerMove(event: PointerEvent) {
    if (motion.matches || event.pointerType === 'touch') return
    const x = event.clientX / innerWidth * 2 - 1
    const y = 1 - event.clientY / innerHeight * 2
    const elapsed = Math.max(0.008, (event.timeStamp - pointerTime) / 1000)
    if (presence) speed = Math.min(1, Math.hypot(x - targetX, y - targetY) / elapsed * 0.12)
    targetX = x
    targetY = y
    presence = 1
    pointerTime = event.timeStamp
    if (time - lastTrail > 0.035) {
      trails[trailIndex]!.set(x, y, time, 0.4 + speed * 0.6)
      trailIndex = (trailIndex + 1) % trails.length
      lastTrail = time
    }
  }

  function pointerDown(event: PointerEvent) {
    if (motion.matches || event.button !== 0 || !event.isPrimary) return
    // Page actions and sculpture drags retain their own feedback.
    if (event.target instanceof Element && event.target.closest('a, button, input, textarea, select, [role="group"], [role="switch"]')) return
    targetX = event.clientX / innerWidth * 2 - 1
    targetY = 1 - event.clientY / innerHeight * 2
    presence = 1
    ripples[rippleIndex]!.set(targetX, targetY, time, 1)
    rippleIndex = (rippleIndex + 1) % ripples.length
  }

  function pointerLeave() {
    presence = speed = 0
    targetX = targetY = 0
  }

  function pointerUp(event: PointerEvent) {
    if (event.pointerType === 'touch') pointerLeave()
  }

  function sync() {
    cancelAnimationFrame(frame)
    frame = 0
    if (disposed || document.hidden) return
    if (motion.matches) {
      pointerLeave()
      interaction.uPresence.value = interaction.uSpeed.value = 0
      trails.forEach(trail => trail.w = 0)
      ripples.forEach(ripple => ripple.w = 0)
      render(1)
    }
    if (!motion.matches) { previous = performance.now(); frame = requestAnimationFrame(animate) }
  }

  function contextLost(event: Event) {
    event.preventDefault()
    dispose()
  }

  return { dispose }
}
