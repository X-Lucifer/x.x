import * as THREE from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
import { unicornPath } from '../brand/unicorn'
import { observeTheme } from '../../composables/useTheme'
import { InertialRotation } from './inertialRotation'

// Supported by Three.js; the accompanying declaration omits this sampler method.
declare module 'three/addons/math/MeshSurfaceSampler.js' {
  interface MeshSurfaceSampler {
    setRandomGenerator(generator: () => number): this
  }
}

export interface IdentityScene {
  reset(): void
  dispose(): void
}

/** Loaded only in the browser. One renderer owns and releases all GPU resources. */
export function createIdentityScene(
  host: HTMLElement,
  onUnavailable: () => void,
): IdentityScene {
  const resources = new Set<{ dispose(): void }>()
  const own = <T extends { dispose(): void }>(resource: T): T => {
    resources.add(resource)
    return resource
  }
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15

  let frame = 0
  let disposed = false
  let contextLost = false
  let visible = false
  let time = 0
  let previousTime = 0
  let renderWidth = 0
  let renderHeight = 0
  let hover = 0
  let hoverTarget = 0
  let dragId: number | null = null
  let dragX = 0
  let dragY = 0
  let dragTime = 0
  let dragSensitivity = 0.01
  let pointerSpeed = 0
  let pointerTime = 0
  let impulse = 0
  const rotation = new InertialRotation()
  const pointer = new THREE.Vector2()
  const pointerTarget = new THREE.Vector2()
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const compact = window.matchMedia('(pointer: coarse)')
  let sizeObserver: ResizeObserver | undefined
  let visibilityObserver: IntersectionObserver | undefined
  let stopTheme: (() => void) | undefined
  let pointerBounds: DOMRect | undefined

  // The cleanup path is also used if scene construction fails partway through.
  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    sizeObserver?.disconnect()
    visibilityObserver?.disconnect()
    stopTheme?.()
    motion.removeEventListener('change', syncMotion)
    document.removeEventListener('visibilitychange', syncMotion)
    canvas.removeEventListener('webglcontextlost', handleContextLoss)
    host.removeEventListener('pointermove', pointerMove)
    host.removeEventListener('pointerdown', pointerDown)
    host.removeEventListener('pointerup', pointerUp)
    host.removeEventListener('pointercancel', pointerUp)
    host.removeEventListener('lostpointercapture', pointerUp)
    host.removeEventListener('pointerleave', pointerLeave)
    host.removeEventListener('keydown', keyDown)
    window.removeEventListener('blur', cancelDrag)
    window.removeEventListener('scroll', invalidateBounds, true)
    cancelDrag()
    resources.forEach(resource => resource.dispose())
    resources.clear()
    renderer.dispose()
    if (!contextLost) renderer.forceContextLoss()
    canvas.remove()
  }

  function handleContextLoss(event: Event) {
    event.preventDefault()
    contextLost = true
    dispose()
    onUnavailable()
  }

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40)
  camera.position.set(0, 0.05, 8.2)
  const assembly = new THREE.Group()
  const presentation = new THREE.Group()
  const emblem = new THREE.Group()
  const orbits = new THREE.Group()
  assembly.add(emblem, orbits)
  presentation.add(assembly)
  scene.add(presentation)

  const orbitGroups: THREE.Group[] = []
  let hologram: THREE.ShaderMaterial
  let outline: THREE.LineSegments<THREE.EdgesGeometry, THREE.LineBasicMaterial>
  let edgeGlow: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
  let sculpture: THREE.Mesh
  let particles: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
  let dust: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
  let scan: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>

  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  let seed = 72819

  try {
    const svg = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${unicornPath}" /></svg>`)
    const shapes = svg.paths.flatMap(path => path.toShapes())
    const geometry = own(new THREE.ExtrudeGeometry(shapes, {
      depth: 140, bevelEnabled: false,
      steps: 1, curveSegments: 12,
    }))
    geometry.rotateX(Math.PI)
    geometry.scale(0.0027, 0.0027, 0.0027)
    geometry.center()
    hologram = own(new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uLightMode: { value: 0 }, uPointer: { value: pointer }, uHover: { value: 0 }, uAspect: { value: 1 } },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vView;
        varying vec2 vScreen;
        void main() {
          vPosition = position;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
          vScreen = gl_Position.xy / gl_Position.w;
        }
      `,
      fragmentShader: `
        uniform float uLightMode;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vView;
        uniform float uTime;
        uniform float uOpacity;
        uniform vec2 uPointer;
        uniform float uHover;
        uniform float uAspect;
        varying vec2 vScreen;
        void main() {
          float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.0);
          float lines = pow(0.5 + 0.5 * sin(vPosition.y * 160.0), 18.0);
          float scan = exp(-pow((vPosition.y - (1.5 - mod(uTime * 0.3, 3.0))) * 12.0, 2.0));
          vec2 delta = (vScreen - uPointer) * vec2(uAspect, 1.0);
          float light = exp(-dot(delta, delta) * 12.0) * uHover;
          vec3 color = mix(vec3(0.13, 0.76, 0.43), vec3(0.55, 1.0, 0.76), scan);
          color = mix(color, vec3(0.76, 1.0, 0.92), light * 0.65);
          color = mix(color, mix(vec3(0.06, 0.32, 0.21), vec3(0.08, 0.47, 0.31), scan), uLightMode);
          gl_FragColor = vec4(color, (0.055 + lines * 0.28 + fresnel * 0.48 + scan * 0.42 + light * 0.2) * uOpacity);
        }
      `,
    }))
    sculpture = new THREE.Mesh(geometry, hologram)
    emblem.add(sculpture)
    const edgeGeometry = own(new THREE.EdgesGeometry(geometry, 28))
    outline = new THREE.LineSegments(
      edgeGeometry,
      own(new THREE.LineBasicMaterial({ color: 0x91ffc3, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending, depthWrite: false })),
    )
    emblem.add(outline)

    // Sample only the silhouette edges. Glow follows the cursor in screen space,
    // so it stays attached to the correct edge even while the object is rotated.
    const edgePositions = edgeGeometry.getAttribute('position')
    const glowPositions: number[] = []
    const edgeStart = new THREE.Vector3()
    const edgeEnd = new THREE.Vector3()
    const edgePoint = new THREE.Vector3()
    for (let i = 0; i < edgePositions.count; i += 2) {
      edgeStart.fromBufferAttribute(edgePositions, i)
      edgeEnd.fromBufferAttribute(edgePositions, i + 1)
      const steps = Math.max(1, Math.ceil(edgeStart.distanceTo(edgeEnd) / 0.014))
      for (let j = 0; j <= steps; j++) {
        edgePoint.lerpVectors(edgeStart, edgeEnd, j / steps)
        glowPositions.push(edgePoint.x, edgePoint.y, edgePoint.z)
      }
    }
    const glowGeometry = own(new THREE.BufferGeometry())
    glowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(glowPositions, 3))
    const glowMaterial = own(new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uPointer: { value: new THREE.Vector2() }, uHover: { value: 0 }, uAspect: { value: 1 }, uDpr: { value: 1 }, uLightMode: { value: 0 } },
      vertexShader: `
        uniform vec2 uPointer;
        uniform float uHover;
        uniform float uAspect;
        uniform float uDpr;
        varying float vGlow;
        void main() {
          vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vec2 delta = (clip.xy / clip.w - uPointer) * vec2(uAspect, 1.0);
          vGlow = exp(-dot(delta, delta) * 14.0) * uHover;
          gl_Position = clip;
          gl_PointSize = (2.0 + vGlow * 19.0) * uDpr;
        }
      `,
      fragmentShader: `
        uniform float uLightMode;
        varying float vGlow;
        void main() {
          vec2 p = gl_PointCoord - 0.5;
          float halo = exp(-dot(p, p) * 18.0);
          vec3 color = mix(vec3(0.14, 0.8, 0.42), vec3(0.67, 1.0, 0.82), halo * vGlow);
          color = mix(color, vec3(0.08, 0.51, 0.31), uLightMode);
          gl_FragColor = vec4(color, halo * vGlow * 0.2);
        }
      `,
    }))
    edgeGlow = new THREE.Points(glowGeometry, glowMaterial)
    edgeGlow.frustumCulled = false
    emblem.add(edgeGlow)

    const sample = new THREE.Vector3()
    const sampler = new MeshSurfaceSampler(sculpture).setRandomGenerator(random).build()
    const count = compact.matches ? 14000 : 24000
    const positions = new Float32Array(count * 3)
    const dispersions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      sampler.sample(sample)
      sample.toArray(positions, i * 3)
      const angle = random() * Math.PI * 2
      const radius = 0.3 + random() * 0.6
      dispersions.set([Math.cos(angle) * radius, (random() - 0.5) * 0.7, Math.sin(angle) * radius], i * 3)
      seeds[i] = random()
    }
    const particleGeometry = own(new THREE.BufferGeometry())
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('aScatter', new THREE.BufferAttribute(dispersions, 3))
    particleGeometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    const particleMaterial = own(new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uMorph: { value: 0 }, uDpr: { value: 1 }, uPointer: { value: pointer }, uLightMode: { value: 0 }, uAspect: { value: 1 }, uHover: { value: 0 }, uSpeed: { value: 0 }, uImpulse: { value: 0 } },
      vertexShader: `
        attribute vec3 aScatter;
        attribute float aSeed;
        uniform float uTime;
        uniform float uMorph;
        uniform float uDpr;
        uniform vec2 uPointer;
        uniform float uAspect;
        uniform float uHover;
        uniform float uSpeed;
        uniform float uImpulse;
        varying float vSeed;
        varying float vAlpha;
        varying float vLight;
        void main() {
          vSeed = aSeed;
          float scatter = sin(uMorph * 3.14159265);
          vec3 p = position + aScatter * scatter * 0.58;
          p.z += sin(p.y * 5.0 + uTime * 0.7 + aSeed * 4.0) * 0.024 * uMorph;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vec4 clip = projectionMatrix * mv;
          vec2 away = (clip.xy / clip.w - uPointer) * vec2(uAspect, 1.0);
          float proximity = exp(-dot(away, away) * 15.0) * uHover;
          // View-space interaction remains under the cursor after any 3D rotation.
          mv.xy += normalize(away + 0.0001) * proximity * (0.035 + uSpeed * 0.08 + uImpulse * 0.09) * uMorph;
          mv.z += proximity * 0.08 * uMorph;
          gl_Position = projectionMatrix * mv;
          float sweep = exp(-pow((position.y - (1.6 - mod(uTime * 0.32, 3.2))) * 8.0, 2.0));
          vLight = proximity * 0.85 + sweep * 0.5;
          gl_PointSize = (1.5 + aSeed * 1.1 + vLight * 0.9) * uDpr * (6.5 / -mv.z);
          vAlpha = (0.16 + uMorph * 0.84) * (0.6 + aSeed * 0.4);
        }
      `,
      fragmentShader: `
        uniform float uLightMode;
        varying float vSeed;
        varying float vAlpha;
        varying float vLight;
        void main() {
          float r = length(gl_PointCoord - 0.5);
          float a = exp(-r * r * 12.0) * (1.0 - smoothstep(0.4, 0.5, r));
          vec3 color = mix(vec3(0.2, 0.7, 0.48), vec3(0.72, 1.0, 0.88), vSeed * 0.75 + vLight * 0.25);
          color = mix(color, mix(vec3(0.08, 0.26, 0.16), vec3(0.18, 0.48, 0.33), vSeed), uLightMode);
          gl_FragColor = vec4(color, a * vAlpha * (0.9 + vLight * 0.1));
        }
      `,
    }))
    particles = new THREE.Points(particleGeometry, particleMaterial)
    particles.frustumCulled = false
    emblem.add(particles)

    const ringMaterial = own(new THREE.MeshBasicMaterial({
      color: 0x3d9d69, transparent: true, opacity: 0.38,
    }))
    const ringLight = own(new THREE.MeshBasicMaterial({ color: 0x9bf8c2, transparent: true, opacity: 0.82 }))
    const nodeGeometry = own(new THREE.SphereGeometry(0.026, 6, 4))
    const ringConfigs = [
      { radius: 1.72, x: 1.08, y: -0.24, z: -0.36 },
      { radius: 1.93, x: 0.55, y: 0.88, z: 0.58 },
      { radius: 2.12, x: -0.42, y: -0.58, z: -0.3 },
    ]
    ringConfigs.forEach((config, index) => {
      const group = new THREE.Group()
      group.rotation.set(config.x, config.y, config.z)
      const ring = new THREE.Mesh(own(new THREE.TorusGeometry(config.radius, 0.005, 3, 120)), ringMaterial)
      const arc = new THREE.Mesh(own(new THREE.TorusGeometry(config.radius, 0.012, 4, 32, 0.6 + index * 0.25)), ringLight)
      arc.rotation.z = index * 2.4
      group.add(ring, arc)
      const node = new THREE.Mesh(nodeGeometry, ringLight)
      node.position.set(Math.cos(index * 2.4) * config.radius, Math.sin(index * 2.4) * config.radius, 0)
      group.add(node)
      orbitGroups.push(group)
      orbits.add(group)
    })

    // A fine outer reticle adds scale without another full-screen render pass.
    const ticks: number[] = []
    for (let i = 0; i < 100; i++) {
      const angle = i / 100 * Math.PI * 2
      const length = i % 5 === 0 ? 0.045 : 0.017
      ticks.push(Math.cos(angle) * 2.35, Math.sin(angle) * 2.35, -0.6)
      ticks.push(Math.cos(angle) * (2.35 + length), Math.sin(angle) * (2.35 + length), -0.6)
    }
    const tickGeometry = own(new THREE.BufferGeometry())
    tickGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ticks, 3))
    const tickMaterial = own(new THREE.LineBasicMaterial({ color: 0x78e2a8, transparent: true, opacity: 0.2 }))
    assembly.add(new THREE.LineSegments(tickGeometry, tickMaterial))

    const dustCount = compact.matches ? 100 : 220
    const dustPositions = new Float32Array(dustCount * 3)
    for (let i = 0; i < dustCount; i++) {
      dustPositions.set([(random() - 0.5) * 8, (random() - 0.5) * 7, -1 - random() * 4], i * 3)
    }
    const dustGeometry = own(new THREE.BufferGeometry())
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
    const dustMaterial = own(new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uDpr: { value: 1 }, uLightMode: { value: 0 } },
      vertexShader: `
        uniform float uTime;
        uniform float uDpr;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          p.y += sin(uTime * 0.14 + p.x) * 0.12;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (1.0 + fract(p.x * 13.0)) * uDpr;
          vAlpha = 0.15 + 0.35 * (sin(p.x * 6.0 + uTime * 0.5) * 0.5 + 0.5);
        }
      `,
      fragmentShader: `
        uniform float uLightMode;
        varying float vAlpha;
        void main() {
          float a = 1.0 - smoothstep(0.0, 0.5, length(gl_PointCoord - 0.5));
          gl_FragColor = vec4(mix(vec3(0.57, 0.86, 0.7), vec3(0.23, 0.4, 0.29), uLightMode), a * vAlpha);
        }
      `,
    }))
    dust = new THREE.Points(dustGeometry, dustMaterial)
    scene.add(dust)

    const scanMaterial = own(new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uEnabled: { value: motion.matches ? 0 : 1 }, uLightMode: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: `
        uniform float uLightMode;
        varying vec2 vUv;
        uniform float uTime;
        uniform float uEnabled;
        void main() {
          float position = 1.2 - mod(uTime * 0.12, 1.8);
          float d = vUv.y - position;
          float line = exp(-abs(d) * 650.0) * 0.5;
          float trail = exp(-max(d, 0.0) * 25.0) * step(0.0, d) * 0.055;
          float edge = pow(sin(vUv.x * 3.14159265), 3.0);
          gl_FragColor = vec4(mix(vec3(0.55, 1.0, 0.74), vec3(0.1, 0.4, 0.25), uLightMode), (line + trail) * edge * uEnabled);
        }
      `,
    }))
    scan = new THREE.Mesh(own(new THREE.PlaneGeometry(4.7, 4.8)), scanMaterial)
    scan.position.z = 0.7
    scene.add(scan)
    host.append(canvas)
    canvas.addEventListener('webglcontextlost', handleContextLoss)
    host.addEventListener('pointermove', pointerMove, { passive: true })
    host.addEventListener('pointerdown', pointerDown)
    host.addEventListener('pointerup', pointerUp)
    host.addEventListener('pointercancel', pointerUp)
    host.addEventListener('lostpointercapture', pointerUp)
    host.addEventListener('pointerleave', pointerLeave)
    host.addEventListener('keydown', keyDown)
    window.addEventListener('blur', cancelDrag)
    window.addEventListener('scroll', invalidateBounds, { passive: true, capture: true })
    motion.addEventListener('change', syncMotion)
    document.addEventListener('visibilitychange', syncMotion)

    stopTheme = observeTheme(theme => {
      const light = theme === 'light'
      for (const material of [hologram, glowMaterial, particleMaterial, dustMaterial, scanMaterial]) {
        material.uniforms.uLightMode!.value = light ? 1 : 0
        material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending
      }
      outline.material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending
      outline.material.color.set(light ? 0x2e7252 : 0x91ffc3)
      ringMaterial.color.set(light ? 0x639777 : 0x3d9d69)
      ringLight.color.set(light ? 0x245c3f : 0x9bf8c2)
      tickMaterial.color.set(light ? 0x41624b : 0x78e2a8)
      requestDraw()
    })

    // Prepare the particle and glow shaders before they first become visible.
    renderer.compile(scene, camera)

    sizeObserver = new ResizeObserver(resize)
    sizeObserver.observe(host)
    visibilityObserver = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false
      syncMotion()
    }, { threshold: 0.01 })
    visibilityObserver.observe(host)
    resize()
  } catch (error) {
    dispose()
    throw error
  }

  function resize() {
    if (disposed) return
    pointerBounds = host.getBoundingClientRect()
    const { width, height } = pointerBounds
    if (!width || !height) return
    const dpr = Math.min(window.devicePixelRatio || 1, compact.matches ? 1.5 : 2, Math.sqrt(1_200_000 / (width * height)))
    const nextWidth = Math.max(1, Math.floor(width * dpr))
    const nextHeight = Math.max(1, Math.floor(height * dpr))
    if (renderWidth === nextWidth && renderHeight === nextHeight) return
    renderWidth = nextWidth
    renderHeight = nextHeight
    renderer.setSize(renderWidth, renderHeight, false)
    camera.aspect = width / height
    camera.position.z = camera.aspect < 1 ? 8.2 / camera.aspect : 8.2
    camera.updateProjectionMatrix()
    dragSensitivity = Math.PI * 2 / Math.max(360, Math.min(width, height) * 1.35)
    hologram.uniforms.uAspect!.value = camera.aspect
    particles.material.uniforms.uDpr!.value = dpr
    particles.material.uniforms.uAspect!.value = camera.aspect
    edgeGlow.material.uniforms.uDpr!.value = dpr
    edgeGlow.material.uniforms.uAspect!.value = camera.aspect
    dust.material.uniforms.uDpr!.value = dpr
    draw(0)
  }

  function draw(delta: number) {
    const ease = motion.matches ? 1 : 1 - Math.exp(-delta * 18)
    // 4 s hologram → 5 s linear blend → 4 s points → 5 s linear return.
    const cycle = motion.matches ? 0 : time % 18
    const morph = cycle < 4 ? 0 : cycle < 9 ? (cycle - 4) / 5 : cycle < 13 ? 1 : 1 - (cycle - 13) / 5
    hover = THREE.MathUtils.lerp(hover, hoverTarget, ease)
    pointer.lerp(pointerTarget, ease)
    rotation.update(delta, dragId !== null, motion.matches)
    assembly.quaternion.copy(rotation.orientation)
    // Parallax translates the presentation; it never fights the rotation under a grab.
    presentation.position.set(pointer.x * 0.045, pointer.y * 0.035, 0)
    emblem.rotation.set(0.04, -0.22, -0.045)
    emblem.position.y = Math.sin(time * 0.55) * 0.025 * (1 - hover)
    pointerSpeed *= Math.exp(-delta * 7)
    impulse *= Math.exp(-delta * 5)
    orbitGroups.forEach((group, index) => {
      group.rotation.z = (index === 0 ? -0.36 : index === 1 ? 0.58 : -0.3) + time * (index % 2 ? -0.065 : 0.045)
    })
    sculpture.visible = morph < 0.998
    outline.visible = sculpture.visible
    // Zero-opacity point sprites still generate fragments; skip this pass at rest.
    edgeGlow.visible = hover > 0.001
    hologram.uniforms.uOpacity!.value = 1 - morph
    hologram.uniforms.uTime!.value = time
    hologram.uniforms.uHover!.value = hover
    outline.material.opacity = (1 - morph) * 0.72
    edgeGlow.material.uniforms.uPointer!.value.copy(pointer)
    edgeGlow.material.uniforms.uHover!.value = hover
    particles.visible = true
    particles.material.uniforms.uMorph!.value = morph
    particles.material.uniforms.uTime!.value = time
    particles.material.uniforms.uHover!.value = hover
    particles.material.uniforms.uSpeed!.value = pointerSpeed
    particles.material.uniforms.uImpulse!.value = impulse
    dust.material.uniforms.uTime!.value = time
    scan.material.uniforms.uTime!.value = time
    scan.material.uniforms.uEnabled!.value = motion.matches ? 0 : 1
    renderer.render(scene, camera)
  }

  function animate(now: number) {
    frame = 0
    if (disposed || !visible || document.hidden) return
    const delta = Math.min(Math.max(0, (now - previousTime) / 1000), 0.05)
    previousTime = now
    // Follow native refresh; a delayed browser callback cannot jump the morph.
    if (!motion.matches) time += delta
    draw(delta)
    const settling = Math.abs(hover - hoverTarget) > 0.001
      || pointer.distanceToSquared(pointerTarget) > 0.00001
      || rotation.moving
    if (!motion.matches || settling) frame = requestAnimationFrame(animate)
  }

  function requestDraw() {
    if (disposed || !visible || document.hidden || frame) return
    previousTime = performance.now() - 16
    frame = requestAnimationFrame(animate)
  }

  function syncMotion() {
    cancelAnimationFrame(frame)
    frame = 0
    if (motion.matches) {
      pointerTarget.set(0, 0)
      hoverTarget = 0
      pointerSpeed = impulse = 0
      rotation.velocity.set(0, 0)
    }
    if (document.hidden || !visible) cancelDrag()
    requestDraw()
  }

  function pointerMove(event: PointerEvent) {
    if (dragId !== null && dragId !== event.pointerId) return
    if (dragId === event.pointerId) {
      rotation.drag(event.clientX - dragX, event.clientY - dragY, (event.timeStamp - dragTime) / 1000, dragSensitivity)
      dragX = event.clientX
      dragY = event.clientY
      dragTime = event.timeStamp
    }
    if (!motion.matches && (event.pointerType !== 'touch' || dragId !== null)) {
      const rect = pointerBounds ??= host.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width * 2 - 1
      const y = 1 - (event.clientY - rect.top) / rect.height * 2
      const elapsed = Math.max(0.008, (event.timeStamp - pointerTime) / 1000)
      if (hoverTarget) pointerSpeed = Math.min(1, Math.hypot(x - pointerTarget.x, y - pointerTarget.y) / elapsed * 0.12)
      hoverTarget = 1
      pointerTarget.set(x, y)
      pointerTime = event.timeStamp
    }
    requestDraw()
  }

  function pointerDown(event: PointerEvent) {
    if (event.button !== 0 || !event.isPrimary || dragId !== null) return
    dragId = event.pointerId
    dragX = event.clientX
    dragY = event.clientY
    dragTime = event.timeStamp
    rotation.grab()
    invalidateBounds()
    host.setPointerCapture(event.pointerId)
    host.dataset.dragging = 'true'
    host.focus({ preventScroll: true })
    impulse = motion.matches ? 0 : 1
    pointerMove(event)
  }

  function pointerUp(event: PointerEvent) {
    if (dragId !== event.pointerId) return
    rotation.release((event.timeStamp - dragTime) / 1000, motion.matches || event.type !== 'pointerup')
    dragId = null
    delete host.dataset.dragging
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId)
    const rect = pointerBounds ??= host.getBoundingClientRect()
    if (event.pointerType === 'touch' || event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) pointerLeave()
    requestDraw()
  }

  function cancelDrag() {
    const id = dragId
    dragId = null
    rotation.grab()
    delete host.dataset.dragging
    if (id !== null && host.hasPointerCapture(id)) host.releasePointerCapture(id)
    pointerLeave()
  }

  function pointerLeave() {
    if (dragId !== null) return
    invalidateBounds()
    pointerTarget.set(0, 0)
    hoverTarget = 0
    requestDraw()
  }

  function invalidateBounds() {
    pointerBounds = undefined
  }

  function keyDown(event: KeyboardEvent) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return
    event.preventDefault()
    if (event.key === 'ArrowLeft') rotation.nudge(0, -0.25)
    if (event.key === 'ArrowRight') rotation.nudge(0, 0.25)
    if (event.key === 'ArrowUp') rotation.nudge(-0.25, 0)
    if (event.key === 'ArrowDown') rotation.nudge(0.25, 0)
    if (event.key === 'Home') reset()
    requestDraw()
  }

  function reset() {
    cancelDrag()
    rotation.reset(motion.matches)
    requestDraw()
  }

  return { reset, dispose }
}
