import { ExtrudeGeometry, Mesh, MeshBasicMaterial, Shape, Vector3 } from 'three'
import type { ShapeJSON } from 'three'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js'
import { createHologramLines } from './hologramLines.ts'

declare module 'three/addons/math/MeshSurfaceSampler.js' {
  interface MeshSurfaceSampler {
    setRandomGenerator(generator: () => number): this
  }
}

export interface IdentityGeometryRequest {
  compact: boolean
  shapes: ShapeJSON[]
}

export interface IdentityGeometryData {
  linePositions: Float32Array
  lineStrengths: Float32Array
  glowPositions: Float32Array
  particleData: Float32Array
  halfDepth: number
  seed: number
}

export type IdentityGeometryResponse = IdentityGeometryData | { error: string }

/** CPU-only shell; no renderer, document or window is needed in the worker. */
export function createIdentityExtrusion({ compact, shapes }: IdentityGeometryRequest) {
  return new ExtrudeGeometry(shapes.map(shape => new Shape().fromJSON(shape)), {
    depth: 60, bevelEnabled: true,
    bevelThickness: 32, bevelSize: 7, bevelOffset: -3.5,
    bevelSegments: compact ? 8 : 12,
    steps: 2, curveSegments: compact ? 20 : 32,
  })
}

export function finishIdentitySurface(geometry: ExtrudeGeometry) {
  // Keep every original triangle and sample in the same order, without welding.
  toCreasedNormals(geometry, Math.PI * 0.38)
  geometry.deleteAttribute('uv')
  geometry.rotateX(Math.PI)
  geometry.scale(0.0027, 0.0027, 0.0027)
  geometry.center()
  return geometry
}

export async function buildIdentityGeometry(request: IdentityGeometryRequest, yieldTask: () => Promise<void> = async () => {}) {
  const resources: { dispose(): void }[] = []
  const own = <T extends { dispose(): void }>(resource: T) => { resources.push(resource); return resource }
  try {
    const geometry = own(createIdentityExtrusion(request))
    await yieldTask()
    finishIdentitySurface(geometry)
    await yieldTask()
    const lines = own(createHologramLines(geometry))
    const linePositions = lines.getAttribute('position')
    const lineStrengths = lines.getAttribute('aStrength')
    const sample = new Vector3()
    const normal = new Vector3()
    const start = new Vector3()
    const end = new Vector3()
    const glowPositions: number[] = []
    await yieldTask()
    for (let i = 0; i < linePositions.count; i += 2) {
      if (lineStrengths.getX(i) < 1) continue
      start.fromBufferAttribute(linePositions, i)
      end.fromBufferAttribute(linePositions, i + 1)
      const steps = Math.max(1, Math.ceil(start.distanceTo(end) / 0.025))
      for (let step = 0; step < steps; step++) {
        sample.lerpVectors(start, end, step / steps)
        glowPositions.push(sample.x, sample.y, sample.z)
      }
    }
    await yieldTask()
    let seed = 72819
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0
      return seed / 4294967296
    }
    const material = own(new MeshBasicMaterial())
    const sampler = new MeshSurfaceSampler(new Mesh(geometry, material)).setRandomGenerator(random).build()
    const count = request.compact ? 14000 : 24000
    const particleData = new Float32Array(count * 7)
    await yieldTask()
    for (let i = 0; i < count; i++) {
      if (i && i % 2000 === 0) await yieldTask()
      const offset = i * 7
      sampler.sample(sample, normal)
      sample.addScaledVector(normal, 0.006).toArray(particleData, offset)
      const angle = random() * Math.PI * 2
      const radius = 0.3 + random() * 0.6
      particleData[offset + 3] = Math.cos(angle) * radius
      particleData[offset + 4] = (random() - 0.5) * 0.7
      particleData[offset + 5] = Math.sin(angle) * radius
      particleData[offset + 6] = random()
    }
    return {
      linePositions: linePositions.array as Float32Array,
      lineStrengths: lineStrengths.array as Float32Array,
      glowPositions: new Float32Array(glowPositions),
      particleData,
      halfDepth: geometry.boundingBox!.max.z,
      seed,
    }
  } finally {
    resources.forEach(resource => resource.dispose())
  }
}
