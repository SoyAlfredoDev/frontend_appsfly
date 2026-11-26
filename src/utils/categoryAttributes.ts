export function parseCategoryAttributeOptions(optionsJson?: string | null): string[] {
  if (!optionsJson) return []
  try {
    const parsed: unknown = JSON.parse(optionsJson)
    return Array.isArray(parsed)
      ? parsed.filter((option): option is string => typeof option === 'string')
      : []
  } catch {
    return optionsJson
      .split(',')
      .map((option) => option.trim())
      .filter(Boolean)
  }
}

export function categoryAttributeKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}
