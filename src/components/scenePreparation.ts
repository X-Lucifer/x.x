import type { Camera, Object3D, Scene, WebGLRenderer } from 'three'

function checkAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Scene preparation aborted', 'AbortError')
}

function waitForTask(delay: number, signal?: AbortSignal) {
  checkAborted(signal)
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
      reject(new DOMException('Scene preparation aborted', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }, delay)
    signal?.addEventListener('abort', abort, { once: true })
  })
}

/** Let pending input and rendering run between bounded scene preparation steps. */
export async function yieldSceneTask(signal?: AbortSignal) {
  checkAborted(signal)
  if (typeof globalThis.scheduler?.yield === 'function') await globalThis.scheduler.yield()
  else await waitForTask(0, signal)
  checkAborted(signal)
}

/**
 * Cancellable shader warmup using the same WebGL extension as compileAsync.
 * Three's internal polling cannot be cancelled when a route disposes its scene.
 */
export async function prepareScene(renderer: WebGLRenderer, scene: Scene, camera: Camera, signal?: AbortSignal) {
  checkAborted(signal)
  scene.updateMatrixWorld(true)
  camera.updateMatrixWorld(true)
  const objects: Object3D[] = []
  // traverse (not traverseVisible) also prepares the initially hidden particles.
  scene.traverse(object => {
    if ('isMesh' in object || 'isLine' in object || 'isPoints' in object || 'isSprite' in object) objects.push(object)
  })
  for (const object of objects) {
    checkAborted(signal)
    renderer.compile(object, camera, scene)
    await yieldSceneTask(signal)
  }

  const gl = renderer.getContext()
  const extension = gl.getExtension('KHR_parallel_shader_compile')
  const programs = [...renderer.info.programs ?? []]
  if (extension) {
    const pending = new Set(programs)
    while (pending.size) {
      checkAborted(signal)
      if (gl.isContextLost()) throw new Error('WebGL context lost during scene preparation')
      for (const program of pending) {
        if (gl.getProgramParameter(program.program as WebGLProgram, extension.COMPLETION_STATUS_KHR)) pending.delete(program)
      }
      if (pending.size) await waitForTask(10, signal)
    }
  }
  // Uniform/attribute reflection can also stall the first frame. Warm each
  // program separately, retaining shader error checks and the no-extension path.
  for (const program of programs) {
    checkAborted(signal)
    program.getUniforms()
    program.getAttributes()
    await yieldSceneTask(signal)
  }
}
