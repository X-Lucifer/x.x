import type { LocationQuery, LocationQueryValue } from 'vue-router'

export const allSoftwareCategory = '全部'

export function readSoftwareCategory(
  value: LocationQueryValue | LocationQueryValue[] | undefined,
  categories: readonly string[],
) {
  return typeof value === 'string' && categories.includes(value)
    ? value
    : allSoftwareCategory
}

export function withSoftwareCategory(
  query: LocationQuery,
  category: string,
  categories: readonly string[],
): LocationQuery | null {
  const selected = readSoftwareCategory(category, categories)
  const value = selected === allSoftwareCategory ? undefined : selected
  if (query.category === value) return null

  const nextQuery = { ...query }
  if (value === undefined) delete nextQuery.category
  else nextQuery.category = value
  return nextQuery
}
