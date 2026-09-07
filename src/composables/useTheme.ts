import { onMounted, onUnmounted, ref } from 'vue'

export type Theme = 'light' | 'dark'
const storageKey = 'x-theme'

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(storageKey)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

/** Update WebGL materials in place without restarting the animation cycle. */
export function observeTheme(update: (theme: Theme) => void) {
  const observer = new MutationObserver(() => update(currentTheme()))
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  update(currentTheme())
  return () => observer.disconnect()
}

export function useTheme() {
  // Keep SSG hydration deterministic; the head script sets the first-paint palette.
  const theme = ref<Theme>('dark')

  function apply(value: Theme) {
    theme.value = value
    document.documentElement.dataset.theme = value
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', value === 'light' ? '#f4f5f0' : '#040906')
  }

  function syncStorage(event: StorageEvent) {
    if (event.key !== storageKey && event.key !== null) return
    apply(storedTheme() ?? 'dark')
  }

  function toggleTheme() {
    const nextTheme = theme.value === 'dark' ? 'light' : 'dark'
    apply(nextTheme)
    try {
      localStorage.setItem(storageKey, nextTheme)
    } catch {
      // Switching remains available when storage is disabled.
    }
  }

  onMounted(() => {
    apply(storedTheme() ?? 'dark')
    window.addEventListener('storage', syncStorage)
  })

  onUnmounted(() => {
    window.removeEventListener('storage', syncStorage)
  })

  return { theme, toggleTheme }
}
