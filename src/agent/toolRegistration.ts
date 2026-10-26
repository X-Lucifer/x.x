import type { SiteTool } from './projectTools.ts'

export interface NativeModelContext {
  registerTool(tool: SiteTool, options: { signal: AbortSignal }): Promise<void> | void
}

export interface ToolRegistration {
  supported: boolean
  ready: Promise<void>
  dispose(): void
}

/** One registration per native context; route changes reuse the same tools. */
const registrations = new WeakMap<NativeModelContext, ToolRegistration>()

export function registerTools(context: NativeModelContext | undefined, tools: SiteTool[]): ToolRegistration {
  if (!context || typeof context.registerTool !== 'function') {
    return { supported: false, ready: Promise.resolve(), dispose() {} }
  }
  const existing = registrations.get(context)
  if (existing) return existing
  const controller = new AbortController()
  const registration: ToolRegistration = {
    supported: true,
    ready: Promise.resolve(),
    dispose() {
      controller.abort()
      if (registrations.get(context) === registration) registrations.delete(context)
    },
  }
  registrations.set(context, registration)
  registration.ready = Promise.all(tools.map(async tool => {
    await context.registerTool(tool, { signal: controller.signal })
  })).then(() => {}).catch(error => {
    registration.dispose()
    if (!controller.signal.aborted || !(error instanceof DOMException && error.name === 'AbortError')) throw error
  })
  return registration
}
