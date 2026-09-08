/** The same half-step line segments, sharing their identical endpoints. */
export function createSpatialGrid() {
  const columns = 45
  const rows = 46
  const verticalRows = rows * 2 - 1
  const verticalCount = columns * verticalRows
  const vertexCount = verticalCount + (columns - 1) * rows
  const positions = new Float32Array(vertexCount * 3)
  const indices = new Uint16Array(columns * (verticalRows - 1) * 2 + rows * (columns - 1) * 4)
  let vertex = 0
  let index = 0

  for (let x = 0; x < columns; x++) {
    for (let z = 0; z < verticalRows; z++) {
      positions[vertex++] = x - 22
      positions[vertex++] = -2.1
      positions[vertex++] = z * 0.5 - 36
      if (z < verticalRows - 1) {
        indices[index++] = x * verticalRows + z
        indices[index++] = x * verticalRows + z + 1
      }
    }
  }
  for (let z = 0; z < rows; z++) {
    for (let x = 0; x < columns - 1; x++) {
      positions[vertex++] = x - 21.5
      positions[vertex++] = -2.1
      positions[vertex++] = z - 36
      const middle = verticalCount + z * (columns - 1) + x
      indices[index++] = x * verticalRows + z * 2
      indices[index++] = middle
      indices[index++] = middle
      indices[index++] = (x + 1) * verticalRows + z * 2
    }
  }
  return { positions, indices }
}
