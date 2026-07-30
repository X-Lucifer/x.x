export const siteConfig = {
  name: 'X',
  brand: 'X.LUCIFER',
  role: '全栈软件工程师 / 开源作者',
  location: 'China · Remote',
  github: 'https://github.com/X-Lucifer',
  email: 'x-lucifer@qq.com',
  description:
    'X 的个人技术与开源作品站，展示使用 C#/.NET、Rust、Go、Vue 与 TypeScript 构建的桌面客户端、服务端、AI 图像处理及开发工具。',
  defaultKeywords: [
    'X',
    'X.LUCIFER',
    '全栈软件工程师',
    '开源软件',
    'C#',
    '.NET',
    'Rust',
    'Go',
    'Vue',
    'TypeScript',
    '桌面应用',
    '服务端开发',
  ],
} as const

export const technologyGroups = [
  {
    code: 'LANGUAGES',
    label: '语言与运行时',
    items: ['C#', '.NET', 'Rust', 'Go', 'C', 'C++', 'JavaScript', 'TypeScript'],
  },
  {
    code: 'APPLICATION',
    label: 'Web 与客户端',
    items: ['Vue.js', 'React', 'Nuxt.js', 'Node.js', 'HTML5', 'CSS3', 'Avalonia', 'Tauri', 'Wails'],
  },
  {
    code: 'DATA',
    label: '数据库与中间件',
    items: [
      'SQL Server',
      'MySQL',
      'MariaDB',
      'PostgreSQL',
      'SQLite',
      'MongoDB',
      'Redis',
      'RabbitMQ',
      'ElasticSearch',
    ],
  },
  {
    code: 'PLATFORM',
    label: '云原生与工程化',
    items: [
      'Linux',
      'Docker',
      'Kubernetes',
      'Nginx',
      'Bash',
      'Git',
      'Jenkins',
      'AWS',
      'Google Cloud',
      'Grafana',
      'Kibana',
      'AI'
    ],
  },
] as const
