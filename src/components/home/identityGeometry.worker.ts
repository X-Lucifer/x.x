import { buildIdentityGeometry } from './identityGeometryData.ts'
import type { IdentityGeometryRequest, IdentityGeometryResponse } from './identityGeometryData.ts'

const worker = globalThis as unknown as {
  onmessage: (event: MessageEvent<IdentityGeometryRequest>) => void
  postMessage(data: IdentityGeometryResponse, transfer?: Transferable[]): void
}

worker.onmessage = async event => {
  try {
    const data = await buildIdentityGeometry(event.data)
    worker.postMessage(data, [data.linePositions.buffer, data.lineStrengths.buffer, data.glowPositions.buffer, data.particleData.buffer] as ArrayBuffer[])
  } catch (error) {
    worker.postMessage({ error: error instanceof Error ? error.message : String(error) })
  }
}
