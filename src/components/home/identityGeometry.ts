import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { unicornPath } from '../brand/unicorn.ts'
import { yieldSceneTask } from '../scenePreparation.ts'
import type { IdentityGeometryData, IdentityGeometryRequest, IdentityGeometryResponse } from './identityGeometryData.ts'

/** SVG parsing needs the DOM; the considerably larger geometry work does not. */
export function parseIdentityShapes() {
  const svg = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${unicornPath}" /></svg>`)
  return svg.paths.flatMap(path => path.toShapes()).map(shape => shape.toJSON())
}

function runWorker(request: IdentityGeometryRequest, signal?: AbortSignal) {
  return new Promise<IdentityGeometryData>((resolve, reject) => {
    const worker = new Worker(new URL('./identityGeometry.worker.ts', import.meta.url), { type: 'module', name: 'identity-geometry' })
    const cleanup = () => {
      signal?.removeEventListener('abort', abort)
      worker.terminate()
    }
    const abort = () => {
      cleanup()
      reject(new DOMException('Scene preparation aborted', 'AbortError'))
    }
    worker.onmessage = (event: MessageEvent<IdentityGeometryResponse>) => {
      cleanup()
      if ('error' in event.data) reject(new Error(event.data.error))
      else resolve(event.data)
    }
    worker.onerror = event => {
      event.preventDefault()
      cleanup()
      reject(new Error(event.message || 'Geometry worker unavailable'))
    }
    worker.onmessageerror = () => {
      cleanup()
      reject(new Error('Unable to read geometry worker output'))
    }
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) { abort(); return }
    try { worker.postMessage(request) } catch (error) { cleanup(); reject(error) }
  })
}

/** Keep preparation cancellable, including browsers or policies without workers. */
export async function prepareIdentityGeometry(compact: boolean, signal?: AbortSignal) {
  await yieldSceneTask(signal)
  const request = { compact, shapes: parseIdentityShapes() }
  if (typeof Worker !== 'undefined') {
    try {
      const data = await runWorker(request, signal)
      if (signal?.aborted) throw new DOMException('Scene preparation aborted', 'AbortError')
      return data
    } catch (error) {
      if (signal?.aborted || error instanceof DOMException && error.name === 'AbortError') throw error
      // A blocked worker script or unsupported module worker retains the scene.
    }
  }
  await yieldSceneTask(signal)
  const { buildIdentityGeometry } = await import('./identityGeometryData.ts')
  await yieldSceneTask(signal)
  const data = await buildIdentityGeometry(request, () => yieldSceneTask(signal))
  if (signal?.aborted) throw new DOMException('Scene preparation aborted', 'AbortError')
  return data
}
