export const CATEGORIES = ['Engineering', 'Design', 'Product', 'AI', 'Infrastructure', 'Career', 'General'] as const

const CATEGORY_TONES: Record<string, string> = {
  Engineering: 'text-primary',
  Design: 'text-tertiary-container',
  Product: 'text-secondary',
  AI: 'text-on-primary-fixed-variant',
  Infrastructure: 'text-secondary',
  Career: 'text-tertiary',
}

export function categoryTone(category: string) {
  return CATEGORY_TONES[category] ?? 'text-on-surface-variant'
}
