/** Relative SSG URLs keep one build deployable at both / and /x.x/. */
export function agentDiscoveryLinks(path: string, routerBase?: string) {
  const page = path.split(/[?#]/, 1)[0]!.replace(/^\/+|\/+$/g, '')
  const depth = page ? page.split('/').length : 0
  const root = routerBase === undefined
    ? '../'.repeat(depth) || './'
    : `${routerBase.replace(/\/+$/, '')}/`
  const markdown = routerBase === undefined
    ? './index.md'
    : `${root}${page ? `${page}/` : ''}index.md`

  return [
    { key: 'agent-index', rel: 'describedby', type: 'text/plain', href: `${root}llms.txt` },
    { key: 'page-markdown', rel: 'alternate', type: 'text/markdown', href: markdown },
    { key: 'ard-manifest', rel: 'ard', type: 'application/json', href: `${root}.well-known/ard.json` },
    { key: 'ai-catalog-manifest', rel: 'ai-catalog', type: 'application/json', href: `${root}.well-known/ai-catalog.json` },
  ]
}
