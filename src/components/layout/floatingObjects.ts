import * as THREE from 'three'

type Uniforms = Record<string, THREE.IUniform>

/** One surface pass and one wire pass, regardless of the number of objects. */
export function createFloatingObjects(interaction: Uniforms, fieldShader: string, compact: boolean) {
  const resources: { dispose(): void }[] = []
  const own = <T extends { dispose(): void }>(resource: T): T => { resources.push(resource); return resource }
  const group = new THREE.Group()
  const scroll = { value: 0 }
  const motion = { value: 1 }
  let seed = Math.floor(Math.random() * 0xffffffff)
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
  const wireData = { positions: [] as number[], anchors: [] as number[], motions: [] as number[] }
  const faceData = { positions: [] as number[], normals: [] as number[], anchors: [] as number[], motions: [] as number[] }

  // Stratified positions avoid empty quadrants while keeping each visit distinct.
  const frameCount = compact ? 26 : 48
  const solidCount = compact ? 10 : 20
  for (let i = 0; i < frameCount + solidCount; i++) {
    const frame = i < frameCount
    const index = frame ? i : i - frameCount
    const lane = index % 6
    const x = -1.1 + (lane + 0.2 + random() * 0.65) * 2.2 / 6
    const distance = 10 + random() * 29
    const y = -0.26 + Math.floor(index / 6) % 4 * 0.35 + random() * 0.23
    const phase = random()
    const lifetime = 30 + random() * 36
    const spin = (random() < 0.5 ? -1 : 1) * (0.025 + random() * 0.045)
    const size = distance * 0.445 * (frame ? 0.06 + random() * 0.09 : 0.1 + random() * 0.11)
    const anchor = [x, y, distance, phase]
    const movement = [spin, lifetime, random() * Math.PI * 2, frame ? 0 : 1]
    let geometry: THREE.BufferGeometry
    if (frame) {
      const width = size * (1.1 + random() * 0.9)
      const height = size * (0.5 + random() * 0.6)
      // Open rectangular portals intermixed with slender three-dimensional cages.
      geometry = new THREE.BoxGeometry(width, height, index % 3 === 0 ? size * 0.55 : size * 0.06)
    } else {
      switch (index % 4) {
        case 0: geometry = new THREE.BoxGeometry(size, size * 0.85, size); break
        case 1: geometry = new THREE.OctahedronGeometry(size * 0.72); break
        case 2: geometry = new THREE.IcosahedronGeometry(size * 0.67); break
        default: geometry = new THREE.TorusGeometry(size * 0.53, size * 0.14, 6, 20)
      }
    }
    const edges = new THREE.EdgesGeometry(geometry, frame ? 25 : 18)
    const vertices = edges.getAttribute('position')
    for (let j = 0; j < vertices.count; j++) {
      wireData.positions.push(vertices.getX(j), vertices.getY(j), vertices.getZ(j))
      wireData.anchors.push(...anchor)
      wireData.motions.push(...movement)
    }
    edges.dispose()
    if (!frame) {
      const faces = geometry.index ? geometry.toNonIndexed() : geometry
      const positions = faces.getAttribute('position')
      const normals = faces.getAttribute('normal')
      for (let j = 0; j < positions.count; j++) {
        faceData.positions.push(positions.getX(j), positions.getY(j), positions.getZ(j))
        faceData.normals.push(normals.getX(j), normals.getY(j), normals.getZ(j))
        faceData.anchors.push(...anchor)
        faceData.motions.push(...movement)
      }
      if (faces !== geometry) faces.dispose()
    }
    geometry.dispose()
  }

  function buffer(data: typeof wireData) {
    const geometry = own(new THREE.BufferGeometry())
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3))
    geometry.setAttribute('aAnchor', new THREE.Float32BufferAttribute(data.anchors, 4))
    geometry.setAttribute('aMotion', new THREE.Float32BufferAttribute(data.motions, 4))
    return geometry
  }

  const transformShader = `
    ${fieldShader}
    uniform float uScroll;
    uniform float uMotion;
    attribute vec4 aAnchor;
    attribute vec4 aMotion;
    varying float vAlpha;
    varying float vLight;
    varying float vSolid;
    varying vec3 vView;
    mat3 rotationMatrix(vec3 angle) {
      vec3 c = cos(angle), s = sin(angle);
      return mat3(c.y*c.z, c.y*s.z, -s.y,
        s.x*s.y*c.z-c.x*s.z, s.x*s.y*s.z+c.x*c.z, s.x*c.y,
        c.x*s.y*c.z+s.x*s.z, c.x*s.y*s.z-s.x*c.z, c.x*c.y);
    }
    vec4 floatingPosition(out mat3 rotation) {
      float elapsed = uTime * uMotion / aMotion.y + aAnchor.w;
      float cycle = floor(elapsed);
      float age = fract(elapsed);
      float envelope = mix(1.0, smoothstep(0.0, 0.12, age) * (1.0-smoothstep(0.8, 1.0, age)), uMotion);
      float phase = aMotion.z + cycle * 2.39996;
      float distance = aAnchor.z;
      vec3 center = vec3(aAnchor.x * uAspect * distance * 0.445,
        max(-0.65, 1.3 + (aAnchor.y * 0.445 - 0.08125) * distance), 8.0-distance);
      center.x += sin(phase + uTime * 0.075) * 0.45;
      center.y += sin(phase * 1.7 + uTime * 0.18) * 0.23 + (age - 0.5) * 0.8 * uMotion;
      center.z += sin(uScroll * 0.24 + phase) * 1.5;
      vec4 centerView = modelViewMatrix * vec4(center, 1.0);
      vec4 clip = projectionMatrix * centerView;
      vec2 screen = clip.xy / max(clip.w, 0.1);
      vec2 field = fieldAt(screen);
      vec2 away = (screen-uPointer) * vec2(uAspect, 1.0);
      // Move the whole object in view space; its vertices stay rigid and coherent.
      vec2 push = normalize(away + vec2(0.0001)) * field.x * (0.2 + uSpeed * 0.35);
      centerView.xy += push * distance * 0.065;
      centerView.z += field.y * 0.6;
      rotation = rotationMatrix(vec3(phase * 0.4 + uTime*aMotion.x + field.y*0.22,
        phase + uTime*aMotion.x*0.7 + field.x*0.3, sin(phase)*0.38 + uTime*aMotion.x*0.24));
      float objectScale = mix(0.48, 1.0, smoothstep(0.45, 1.3, uAspect));
      vec4 mv = centerView + modelViewMatrix * vec4(rotation * position * objectScale, 0.0);
      vView = normalize(-mv.xyz);
      vLight = min(1.0, field.x * 0.8 + field.y);
      vSolid = aMotion.w;
      float fog = 1.0 - smoothstep(16.0, 55.0, -mv.z);
      // Keep the center readable; objects gain contrast in the peripheral sky.
      float margin = mix(0.34, 1.0, smoothstep(0.2, 0.9, abs(screen.x)));
      // A desktop window can become narrow without rebuilding its GPU buffers.
      float density = 1.0 - (1.0-smoothstep(0.65, 1.15, uAspect)) * ${compact ? '0.0' : '1.0'} * step(0.54, aAnchor.w);
      vAlpha = envelope * fog * margin * density;
      return projectionMatrix * mv;
    }
  `
  const uniforms = { ...interaction, uScroll: scroll, uMotion: motion }
  const wireMaterial = own(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.NormalBlending,
    uniforms,
    vertexShader: `
      ${transformShader}
      void main() { mat3 rotation; gl_Position = floatingPosition(rotation); }
    `,
    fragmentShader: `
      uniform float uLightMode;
      varying float vAlpha;
      varying float vLight;
      varying float vSolid;
      void main() {
        vec3 color = mix(vec3(0.22, 0.69, 0.47), vec3(0.62, 1.0, 0.82), vLight);
        color = mix(color, mix(vec3(0.2, 0.42, 0.3), vec3(0.07, 0.35, 0.22), vLight), uLightMode);
        gl_FragColor = vec4(color, vAlpha * (0.3 + vSolid*0.13 + vLight*0.52) * mix(1.0, 0.82, uLightMode));
      }
    `,
  }))
  const faceMaterial = own(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.FrontSide,
    uniforms,
    vertexShader: `
      ${transformShader}
      varying vec3 vNormal;
      void main() {
        mat3 rotation;
        gl_Position = floatingPosition(rotation);
        vNormal = normalize(normalMatrix * rotation * normal);
      }
    `,
    fragmentShader: `
      uniform float uLightMode;
      varying float vAlpha;
      varying float vLight;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec3 n = normalize(vNormal);
        float diffuse = max(dot(n, normalize(vec3(-0.5, 0.9, 0.6))), 0.0);
        float fresnel = pow(1.0 - max(dot(n, normalize(vView)), 0.0), 2.0);
        vec3 color = mix(vec3(0.025, 0.09, 0.06), vec3(0.15, 0.48, 0.3), diffuse);
        color += vec3(0.28, 0.72, 0.52) * (fresnel*0.35 + vLight*0.5);
        color = mix(color, mix(vec3(0.41, 0.58, 0.46), vec3(0.78, 0.88, 0.8), diffuse), uLightMode);
        gl_FragColor = vec4(color, vAlpha * (0.2 + diffuse*0.28 + fresnel*0.16 + vLight*0.25));
      }
    `,
  }))
  const faceGeometry = buffer(faceData)
  faceGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(faceData.normals, 3))
  const surfaces = new THREE.Mesh(faceGeometry, faceMaterial)
  const wires = new THREE.LineSegments(buffer(wireData), wireMaterial)
  // Geometry positions are local; the shader places objects across the sky.
  surfaces.frustumCulled = wires.frustumCulled = false
  surfaces.renderOrder = 1
  wires.renderOrder = 2
  group.add(surfaces, wires)
  return {
    group,
    update(scrollDepth: number, reducedMotion: boolean) {
      scroll.value = scrollDepth
      motion.value = reducedMotion ? 0 : 1
    },
    dispose() {
      group.removeFromParent()
      resources.forEach(resource => resource.dispose())
    },
  }
}
