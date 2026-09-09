import * as THREE from 'three'

type ContourNode = { point: THREE.Vector3, neighbors: Set<string> }

/** Two silhouette contours joined at corners and spaced points along the curves. */
export function createHologramLines(surface: THREE.BufferGeometry) {
  const positions = surface.getAttribute('position')
  const index = surface.getIndex()
  const vertex = (i: number) => index ? index.getX(i) : i
  const lines: number[] = []
  const strengths: number[] = []
  const unique = new Set<string>()
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const levels = [...new Set(Array.from({ length: positions.count }, (_, i) => positions.getZ(i)))].sort((x, y) => x - y)
  const backDepth = levels[0]!
  const frontDepth = levels.at(-1)!
  const contours = new Set([backDepth, frontDepth])
  const front = new Map<string, ContourNode>()
  const back = new Map<string, THREE.Vector3>()
  const key = (p: THREE.Vector3) => `${Math.round(p.x * 100000)},${Math.round(p.y * 100000)},${Math.round(p.z * 100000)}`
  const outlineKey = (p: THREE.Vector3) => `${Math.round(p.x * 100000)},${Math.round(p.y * 100000)}`

  function segment(from: THREE.Vector3, to: THREE.Vector3, strength: number) {
    if (from.distanceToSquared(to) < 1e-12) return
    const start = key(from)
    const end = key(to)
    const id = start < end ? `${start}:${end}` : `${end}:${start}`
    if (unique.has(id)) return
    unique.add(id)
    lines.push(from.x, from.y, from.z, to.x, to.y, to.z)
    strengths.push(strength, strength)
  }

  function contour(from: THREE.Vector3, to: THREE.Vector3) {
    if (from.z !== to.z || !contours.has(from.z)) return
    segment(from, to, 1)
    const fromKey = outlineKey(from)
    const toKey = outlineKey(to)
    if (fromKey === toKey) return
    if (from.z === backDepth) {
      back.set(fromKey, from.clone())
      back.set(toKey, to.clone())
    } else {
      if (!front.has(fromKey)) front.set(fromKey, { point: from.clone(), neighbors: new Set() })
      if (!front.has(toKey)) front.set(toKey, { point: to.clone(), neighbors: new Set() })
      front.get(fromKey)!.neighbors.add(toKey)
      front.get(toKey)!.neighbors.add(fromKey)
    }
  }

  // ExtrudeGeometry explicitly groups the cap and side faces. Keep only selected
  // depth contours, so a finely rounded bevel does not become a dense bright band.
  for (const group of surface.groups) {
    if (group.materialIndex !== 1) continue
    for (let i = group.start; i < group.start + group.count; i += 3) {
      a.fromBufferAttribute(positions, vertex(i))
      b.fromBufferAttribute(positions, vertex(i + 1))
      c.fromBufferAttribute(positions, vertex(i + 2))
      contour(a, b)
      contour(b, c)
      contour(c, a)
    }
  }

  // Walk each separate silhouette (including holes) so connectors follow the
  // shape, never span its face or accidentally join separate horn/mane details.
  // Arc-length spacing avoids dense ribs where SVG curves have many samples.
  surface.computeBoundingBox()
  const spacing = (surface.boundingBox!.max.y - surface.boundingBox!.min.y) * 0.07
  const visited = new Set<string>()
  const incoming = new THREE.Vector3()
  const outgoing = new THREE.Vector3()
  for (const start of front.keys()) {
    let current: string | undefined = start
    let previous: THREE.Vector3 | undefined
    let distance = 0
    while (current && !visited.has(current)) {
      visited.add(current)
      const node: ContourNode = front.get(current)!
      const neighbors: string[] = [...node.neighbors]
      if (previous) distance += previous.distanceTo(node.point)
      let corner = neighbors.length !== 2
      if (!corner) {
        incoming.subVectors(front.get(neighbors[0]!)!.point, node.point).normalize()
        outgoing.subVectors(front.get(neighbors[1]!)!.point, node.point).normalize()
        corner = incoming.dot(outgoing) > -Math.cos(Math.PI / 6)
      }
      const partner = back.get(current)
      if (partner && (!previous || corner || distance >= spacing)) {
        segment(node.point, partner, 0.66)
        distance = 0
      }
      previous = node.point
      current = neighbors.find(neighbor => !visited.has(neighbor))
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3))
  geometry.setAttribute('aStrength', new THREE.Float32BufferAttribute(strengths, 1))
  return geometry
}
