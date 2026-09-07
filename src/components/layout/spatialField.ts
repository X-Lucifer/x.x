import * as THREE from 'three'
import { observeTheme } from '../../composables/useTheme'

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
  let floatingMaterial: THREE.ShaderMaterial
  const gridMaterial = own(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uPointer: { value: new THREE.Vector2() }, uLightMode: { value: 0 } },
    vertexShader: `
      uniform float uTime;
      uniform float uScroll;
      uniform vec2 uPointer;
      varying float vDepth;
      varying float vHeight;
      void main() {
        vec3 p = position;
        p.z += uScroll;
        float d = distance(p.xz, vec2(uPointer.x * 10.0, uPointer.y * 5.0));
        p.y += sin(p.x * 0.4 + p.z * 0.22 + uTime * 0.22) * 0.28;
        p.y += exp(-d * 0.32) * 0.6;
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
      void main() {
        float fade = (1.0 - smoothstep(8.0, 35.0, vDepth)) * smoothstep(1.0, 5.0, vDepth);
        vec3 color = mix(vec3(0.18, 0.71, 0.4), vec3(0.19, 0.35, 0.25), uLightMode);
        gl_FragColor = vec4(color, fade * (0.15 + (vHeight + 2.0) * 0.12) * mix(1.0, 0.6, uLightMode));
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
    document.removeEventListener('visibilitychange', sync)
    motion.removeEventListener('change', sync)
    canvas.removeEventListener('webglcontextlost', contextLost)
    resources.forEach(resource => resource.dispose())
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
  }

  try {
    const grid: number[] = []
    for (let x = -22; x <= 22; x++) {
      for (let z = -36; z < 9; z++) grid.push(x, -2.1, z, x, -2.1, z + 1)
    }
    for (let z = -36; z <= 9; z++) {
      for (let x = -22; x < 22; x++) grid.push(x, -2.1, z, x + 1, -2.1, z)
    }
    const gridGeometry = own(new THREE.BufferGeometry())
    gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(grid, 3))
    world.add(new THREE.LineSegments(gridGeometry, gridMaterial))

    const wireMaterial = own(new THREE.LineBasicMaterial({ color: 0x50c889, transparent: true, opacity: 0.16 }))
    const box = own(new THREE.BoxGeometry(1, 1, 1))
    const edges = own(new THREE.EdgesGeometry(box))
    const edgePositions = edges.getAttribute('position')
    const wirePositions: number[] = []
    const wireIndices: number[] = []
    for (let i = 0; i < 8; i++) {
      for (let vertex = 0; vertex < edgePositions.count; vertex++) {
        wirePositions.push(edgePositions.getX(vertex), edgePositions.getY(vertex), edgePositions.getZ(vertex))
        wireIndices.push(i)
      }
    }
    const wireGeometry = own(new THREE.BufferGeometry())
    wireGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wirePositions, 3))
    wireGeometry.setAttribute('aWire', new THREE.Float32BufferAttribute(wireIndices, 1))
    // Eight independent orbits, one draw call, no per-frame matrix or buffer uploads.
    floatingMaterial = own(new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: {
        uTime: gridMaterial.uniforms.uTime!,
        uScroll: { value: 0 },
        uColor: { value: wireMaterial.color },
        uOpacity: { value: wireMaterial.opacity },
      },
      vertexShader: `
        attribute float aWire;
        uniform float uTime;
        uniform float uScroll;
        void main() {
          vec3 p = position * (0.6 + mod(aWire, 3.0) * 0.3);
          float x = aWire * 0.4 + uTime * 0.018;
          float y = aWire * 0.6 + uTime * 0.045;
          p.xy = mat2(cos(0.4), sin(0.4), -sin(0.4), cos(0.4)) * p.xy;
          p.xz = mat2(cos(y), -sin(y), sin(y), cos(y)) * p.xz;
          p.yz = mat2(cos(x), sin(x), -sin(x), cos(x)) * p.yz;
          p += vec3((mod(aWire, 2.0) * 2.0 - 1.0) * (5.8 + aWire * 0.55),
            -0.8 + mod(aWire, 3.0) * 2.6 + sin(uTime * 0.22 + aWire) * 0.15 + sin(uScroll * 0.5) * 0.8,
            -aWire * 2.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        void main() {
          gl_FragColor = vec4(uColor, uOpacity);
          #include <colorspace_fragment>
        }
      `,
    }))
    const wires = new THREE.LineSegments(wireGeometry, floatingMaterial)
    // Positions live in the shader rather than in the geometry's local bounds.
    wires.frustumCulled = false
    world.add(wires)

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

    stopTheme = observeTheme(theme => {
      const light = theme === 'light'
      gridMaterial.uniforms.uLightMode!.value = light ? 1 : 0
      gridMaterial.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending
      wireMaterial.color.set(light ? 0x42634e : 0x50c889)
      wireMaterial.opacity = light ? 0.2 : 0.16
      floatingMaterial.uniforms.uOpacity!.value = wireMaterial.opacity
      pointMaterial.color.set(light ? 0x366247 : 0x9cffc6)
      render(0)
    })

    host.append(canvas)
    document.addEventListener('pointermove', pointerMove, { passive: true })
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
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX * 0.8, amount)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.3 + targetY * 0.35, amount)
    camera.lookAt(0, 0, -8)
    scrollDepth = THREE.MathUtils.lerp(scrollDepth, window.scrollY * 0.0015, amount)
    gridMaterial.uniforms.uTime!.value = time
    gridMaterial.uniforms.uScroll!.value = scrollDepth % 1
    const gridPointer = gridMaterial.uniforms.uPointer!.value as THREE.Vector2
    gridPointer.x = THREE.MathUtils.lerp(gridPointer.x, targetX, amount)
    gridPointer.y = THREE.MathUtils.lerp(gridPointer.y, targetY, amount)
    floatingMaterial.uniforms.uScroll!.value = scrollDepth
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
    render(1)
  }

  function pointerMove(event: PointerEvent) {
    if (motion.matches || event.pointerType === 'touch') return
    targetX = event.clientX / innerWidth * 2 - 1
    targetY = 1 - event.clientY / innerHeight * 2
  }

  function sync() {
    cancelAnimationFrame(frame)
    frame = 0
    if (disposed || document.hidden) return
    if (motion.matches) { targetX = 0; targetY = 0; render(1) }
    if (!motion.matches) { previous = performance.now(); frame = requestAnimationFrame(animate) }
  }

  function contextLost(event: Event) {
    event.preventDefault()
    dispose()
  }

  return { dispose }
}
