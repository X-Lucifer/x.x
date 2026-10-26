import { lstat, mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import MarkdownIt from 'markdown-it'
import { parseSoftwareDocument } from './softwareDocument.ts'

const markdown = new MarkdownIt({ html: false })
const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function normalizeSiteUrl(value) {
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('VITE_SITE_URL must be an HTTP(S) site root without credentials, query or fragment')
  }
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/`
  return url.href
}

export function sitePageUrl(siteUrl, path = '/') {
  const page = path.replace(/^\/+|\/+$/g, '')
  return new URL(page ? `${page}/` : '', siteUrl).href
}

export async function readSoftwareDocuments(directory) {
  const filenames = (await readdir(directory)).filter(filename => filename.endsWith('.md')).sort()
  const slugs = new Set()
  return Promise.all(filenames.map(async filename => {
    const document = parseSoftwareDocument(filename, await readFile(join(directory, filename), 'utf8'))
    const { slug } = document.project
    if (!validSlug.test(slug)) throw new Error(`Invalid software slug: ${slug}`)
    if (slugs.has(slug)) throw new Error(`Duplicate software slug: ${slug}`)
    slugs.add(slug)
    return document
  }))
}

function absoluteDestination(destination, pageUrl, siteUrl) {
  if (/^[a-z][a-z\d+.-]*:|^\/\//i.test(destination)) return destination
  return destination.startsWith('/')
    ? new URL(destination.replace(/^\/+/, ''), siteUrl).href
    : new URL(destination, pageUrl).href
}

function markdownDestination(value) {
  return /[\s()<>]/.test(value) ? `<${value.replaceAll('>', '%3E')}>` : value
}

function rewriteDestinations(source, pageUrl, siteUrl) {
  let result = ''
  for (let position = 0; position < source.length;) {
    // Inline code is documentation content, not a link to rewrite.
    if (source[position] === '`') {
      const delimiter = source.slice(position).match(/^`+/)[0]
      let end = source.indexOf(delimiter, position + delimiter.length)
      while (end >= 0 && (source[end - 1] === '`' || source[end + delimiter.length] === '`')) {
        end = source.indexOf(delimiter, end + delimiter.length)
      }
      if (end >= 0) {
        result += source.slice(position, end + delimiter.length)
        position = end + delimiter.length
        continue
      }
    }
    let start
    let reference = false
    if (source.startsWith('](', position) && source[position - 1] !== '\\') {
      start = position + 2
    } else if (position === 0 || source[position - 1] === '\n') {
      const definition = source.slice(position).match(/^ {0,3}\[[^\]\n]+\]:[ \t]*/)
      if (definition) { start = position + definition[0].length; reference = true }
    }
    if (start !== undefined) {
      while (/\s/.test(source[start] ?? '') && start < source.length) start++
      const destination = markdown.helpers.parseLinkDestination(source, start, source.length)
      if (destination.ok) {
        let end = destination.pos
        while (end < source.length && /\s/.test(source[end])) end++
        if (!reference && source[end] !== ')') {
          const title = markdown.helpers.parseLinkTitle(source, end, source.length)
          end = title.ok ? title.pos : end
          while (end < source.length && /\s/.test(source[end])) end++
        }
        if (reference || source[end] === ')') {
          const absolute = absoluteDestination(destination.str, pageUrl, siteUrl)
          result += source.slice(position, start)
          result += absolute === destination.str ? source.slice(start, destination.pos) : markdownDestination(absolute)
          position = destination.pos
          continue
        }
      }
    }
    result += source[position++]
  }
  return result
}

/** Keep the author's Markdown intact while making its local links portable. */
export function canonicalMarkdown(body, pageUrl, siteUrl) {
  const source = body.replace(/\r\n?/g, '\n')
  const lines = source.split('\n')
  const codeBlocks = markdown.parse(source, {}).filter(token => token.type === 'fence' || token.type === 'code_block')
  const parts = []
  let cursor = 0
  for (const token of codeBlocks) {
    const [start, end] = token.map
    if (start > cursor) parts.push(rewriteDestinations(lines.slice(cursor, start).join('\n'), pageUrl, siteUrl))
    parts.push(lines.slice(start, end).join('\n'))
    cursor = end
  }
  if (cursor < lines.length) parts.push(rewriteDestinations(lines.slice(cursor).join('\n'), pageUrl, siteUrl))
  return parts.join('\n')
}

function escapeMarkdown(value) { return String(value).replace(/[\\`*_{}[\]<>]/g, '\\$&') }
function link(title, url) { return `[${escapeMarkdown(title)}](${markdownDestination(url)})` }
function documentHeader(title, canonical, summary) {
  return `# ${escapeMarkdown(title)}\n\n原页面：${link(title, canonical)}\n\n${summary ? `> ${escapeMarkdown(summary)}\n\n` : ''}`
}

function createDiscoveryDocuments(siteConfig, siteUrl, projectLinks) {
  const base = new URL(siteUrl)
  if (!/^[a-z0-9.-]+$/i.test(base.hostname)) throw new Error('Agent discovery requires a domain hostname in VITE_SITE_URL')
  // Keep identifiers distinct for sites published under the same domain.
  const deployment = `${base.port ? `:port-${base.port}` : ''}${base.pathname === '/' ? '' : `:site-${Buffer.from(base.pathname).toString('hex')}`}`
  const name = 'explore-projects'
  const skillPath = `skills/${name}/SKILL.md`
  const displayName = `探索 ${siteConfig.brand} 开源项目`
  const description = `发现、查询和比较 ${siteConfig.brand} 的公开软件项目。当用户希望按用途或技术栈查找项目、阅读项目说明或比较已公开功能时使用；依据本站 Markdown 文档和源码链接回答。`
  const entry = {
    identifier: `urn:air:${base.hostname}${deployment}:skill:${name}`,
    displayName,
    type: 'text/markdown; profile="urn:air:agent-skills"',
    url: new URL(skillPath, base).href,
    description,
  }
  const representativeQueries = [
    `${siteConfig.brand} 有哪些开源软件项目？`,
    `查找 ${siteConfig.brand} 中符合指定用途或技术栈的项目，并提供说明和源码链接。`,
    `比较 ${siteConfig.brand} 的两个项目在用途、技术栈和已公开功能上的区别。`,
  ]
  const skill = `---
name: ${name}
description: ${JSON.stringify(description)}
---

# ${escapeMarkdown(displayName)}

帮助用户发现、查询和比较本站已公开的软件项目。所有步骤只读取公开资料。

## 使用步骤

1. 阅读 ${link('站点文档索引', new URL('llms.txt', base).href)} 和 ${link('软件作品目录', new URL('software/index.md', base).href)}，根据用户用途、项目分类或技术栈筛选候选项目。使用目录中的真实项目名称和 slug。
2. 如果用户的浏览器或 agent 集成已在 ${link('本站页面', sitePageUrl(siteUrl, '/software'))} 提供原生 WebMCP 工具，可调用 \`list_projects({})\` 获取列表；仅在需要时以工具返回的精确分类传入 \`category\`，再用 \`get_project({"slug":"<列表返回的 slug>"})\` 读取选定项目。工具不可用或读取失败时，直接通过 HTTP 读取上述目录及下面对应的 Markdown 文档。本技能不提供远程 MCP 服务，也不要求安装浏览器兼容层。
3. 只读取与问题相关的项目详情。核对正文中的用途、功能、使用边界、编程语言、运行平台与源码仓库；需要比较时，对各项目使用相同维度。文档未说明的项目明确标为“未说明”，不推断实测性能、兼容性或未公开功能。
4. 回答中给出选中项目、与用户需求的对应关系，并链接文档中的原页面和源码仓库。涉及发布版本或安装方法时，以项目仓库的当前公开说明为依据；若未核实，明确说明。仅查询资料，不自动下载、运行软件或修改用户环境。

## 项目文档

按需打开相关项目，不必预先读取全部正文。

${projectLinks.join('\n')}
`
  return new Map([
    [skillPath, skill],
    ['.well-known/ard.json', `${JSON.stringify({ entries: [{ ...entry, representativeQueries }] }, null, 2)}\n`],
    ['.well-known/ai-catalog.json', `${JSON.stringify({ specVersion: '1.0', entries: [entry] }, null, 2)}\n`],
  ])
}

export function createAgentDocuments({ documents, siteConfig, technologyGroups, siteUrl: configuredUrl }) {
  const siteUrl = normalizeSiteUrl(configuredUrl)
  const files = new Map()
  const projects = [...documents].sort((a, b) => Number(b.project.year) - Number(a.project.year) || a.project.order - b.project.order || a.project.slug.localeCompare(b.project.slug))
  const canonical = path => sitePageUrl(siteUrl, path)
  const markdownUrl = path => new URL('index.md', canonical(path)).href
  const projectLinks = projects.map(({ project }) => `- ${link(project.title, markdownUrl(`/software/${project.slug}`))}: ${escapeMarkdown(project.summary)}`)
  const navigation = [
    `- ${link('首页（页面摘要）', markdownUrl('/'))}: ${escapeMarkdown(siteConfig.description)}`,
    `- ${link('软件作品', markdownUrl('/software'))}: 全部 ${projects.length} 个开源软件项目、用途、技术栈与源码入口。`,
    `- ${link(`关于 ${siteConfig.name}（页面摘要）`, markdownUrl('/about'))}: 作者身份、技术栈与公开联系方式。`,
  ]
  files.set('llms.txt', `# ${escapeMarkdown(siteConfig.brand)}\n\n> ${escapeMarkdown(siteConfig.description)}\n\n本站项目说明以各项目正文中的功能和使用边界为准，源码仓库提供实现与发布信息。\n\n## 站点\n\n${navigation.join('\n')}\n\n## 软件项目\n\n${projectLinks.join('\n')}\n`)

  const technologies = technologyGroups.map(group => `- **${escapeMarkdown(group.label)}**：${group.items.map(escapeMarkdown).join('、')}`).join('\n')
  files.set('index.md', `${documentHeader(siteConfig.brand, canonical('/'), siteConfig.description)}页面摘要。\n\n## 作者\n\n${escapeMarkdown(siteConfig.name)} — ${escapeMarkdown(siteConfig.role)}\n\n${link('GitHub', siteConfig.github)}\n\n## 软件作品\n\n${projectLinks.join('\n')}\n\n## 技术栈\n\n${technologies}\n`)
  files.set('about/index.md', `${documentHeader(`关于 ${siteConfig.name}`, canonical('/about'), siteConfig.description)}页面摘要。\n\n## 作者信息\n\n- 姓名：${escapeMarkdown(siteConfig.name)}\n- 身份：${escapeMarkdown(siteConfig.role)}\n- 所在地：${escapeMarkdown(siteConfig.location)}\n- GitHub：${link(siteConfig.github, siteConfig.github)}\n- 邮箱：${link(siteConfig.email, `mailto:${siteConfig.email}`)}\n\n## 技术栈\n\n${technologies}\n`)
  files.set('software/index.md', `${documentHeader('软件作品', canonical('/software'), '')}${projects.length} 个开源软件项目。\n\n${projects.map(({ project }) => `## ${escapeMarkdown(project.title)}\n\n${escapeMarkdown(project.summary)}\n\n- 类型：${escapeMarkdown(project.category)}\n- 技术栈：${project.stack.map(escapeMarkdown).join('、')}\n- 项目说明：${link(project.title, markdownUrl(`/software/${project.slug}`))}${project.repo ? `\n- 源码：${link(project.repo, project.repo)}` : ''}`).join('\n\n')}\n`)

  for (const { project, detail, body } of projects) {
    if (!validSlug.test(project.slug)) throw new Error(`Invalid software slug: ${project.slug}`)
    const original = canonical(`/software/${project.slug}`)
    const metadata = [
      ['类型', project.category], ['状态', project.status], ['年份', project.year],
      ['编程语言', detail.programmingLanguages.join('、')], ['技术栈', project.stack.join('、')],
      ['运行平台', detail.operatingSystems.join('、')], ['应用分类', detail.applicationCategory],
    ].filter(([, value]) => value).map(([name, value]) => `- ${name}：${escapeMarkdown(value)}`)
    if (project.repo) metadata.push(`- 源码仓库：${link(project.repo, project.repo)}`)
    if (project.demo) metadata.push(`- ${escapeMarkdown(project.demoLabel || '在线体验')}：${link(project.demo, project.demo)}`)
    if (detail.features.length) metadata.push(`- 主要功能：${detail.features.map(escapeMarkdown).join('；')}`)
    files.set(`software/${project.slug}/index.md`, `${documentHeader(project.title, original, project.summary)}## 项目信息\n\n${metadata.join('\n')}\n\n${canonicalMarkdown(body, original, siteUrl)}\n`)
  }
  for (const [path, content] of createDiscoveryDocuments(siteConfig, siteUrl, projectLinks)) files.set(path, content)
  return files
}

async function optionalStat(path) {
  return lstat(path).catch(error => { if (error.code !== 'ENOENT') throw error; return undefined })
}

async function safeGeneratedPath(publicDirectory, name) {
  if (!/^(?:llms\.txt|index\.md|about\/index\.md|software\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)?index\.md|skills\/explore-projects\/SKILL\.md|\.well-known\/(?:ard|ai-catalog)\.json)$/.test(name)) {
    throw new Error(`Unsafe generated document path: ${name}`)
  }
  const root = resolve(publicDirectory)
  const path = resolve(root, name)
  const fromRoot = relative(root, path)
  if (fromRoot.startsWith(`..${sep}`) || fromRoot === '..' || isAbsolute(fromRoot)) throw new Error(`Path escapes public directory: ${name}`)
  // Do not follow a symlink/junction in a generated output path.
  let component = root
  for (const part of ['', ...fromRoot.split(sep)]) {
    if (part) component = join(component, part)
    if ((await optionalStat(component))?.isSymbolicLink()) throw new Error(`Generated path is a symbolic link: ${component}`)
  }
  return path
}

function digest(content) {
  // Git may check text files out with CRLF. Only line endings are normalized.
  return createHash('sha256').update(content.toString().replace(/\r\n/g, '\n')).digest('hex')
}

export async function writeAgentDocuments(publicDirectory, files, manifestPath = resolve('build/agent-documents-manifest.json')) {
  const manifestLocation = resolve(manifestPath)
  const fromPublic = relative(resolve(publicDirectory), manifestLocation)
  if (fromPublic === '' || (!fromPublic.startsWith(`..${sep}`) && fromPublic !== '..' && !isAbsolute(fromPublic))) {
    throw new Error('The generated document manifest must remain outside public')
  }
  const manifestState = await optionalStat(manifestLocation)
  if (manifestState && (!manifestState.isFile() || manifestState.isSymbolicLink())) throw new Error('Invalid generated document manifest file')
  const previous = manifestState ? JSON.parse(await readFile(manifestLocation, 'utf8')) : { version: 1, files: {} }
  if (previous.version !== 1 || !previous.files || typeof previous.files !== 'object' || Array.isArray(previous.files)) {
    throw new Error('Invalid generated document manifest')
  }
  for (const [name, hash] of Object.entries(previous.files)) {
    await safeGeneratedPath(publicDirectory, name)
    if (typeof hash !== 'string' || !/^[a-f0-9]{64}$/.test(hash)) throw new Error(`Invalid document digest: ${name}`)
  }
  const planned = []
  const next = { version: 1, files: {} }
  for (const [name, content] of files) {
    const path = await safeGeneratedPath(publicDirectory, name)
    const existing = await optionalStat(path)
    const hash = digest(content)
    if (existing) {
      const currentHash = existing.isFile() ? digest(await readFile(path)) : undefined
      // Matching content can be adopted on the first run. Otherwise only the
      // last generated text is owned; preserve all manual edits.
      if (!currentHash || (currentHash !== hash && currentHash !== previous.files[name])) {
        throw new Error(`Refusing to overwrite an authored public file: ${name}`)
      }
    }
    planned.push({ path, content })
    next.files[name] = hash
  }
  // Remove only manifest-owned files whose bytes still match. Unlisted or
  // modified files and every parent directory are left intact.
  const stale = []
  for (const [name, hash] of Object.entries(previous.files)) {
    if (files.has(name)) continue
    const path = await safeGeneratedPath(publicDirectory, name)
    if ((await optionalStat(path))?.isFile() && digest(await readFile(path)) === hash) stale.push(path)
  }
  for (const { path, content } of planned) {
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, content)
  }
  for (const path of stale) await unlink(path)
  await mkdir(dirname(manifestLocation), { recursive: true })
  await writeFile(manifestLocation, `${JSON.stringify(next, null, 2)}\n`)
}
