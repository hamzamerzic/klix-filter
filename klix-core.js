export const DEFAULT_STATE = Object.freeze({
  keywords: Object.freeze(['rat', 'ubistvo']),
  activeTab: 'popular',
})

export function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'dj')
    .replace(/[^a-z0-9šđčćž\s-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeStoredState(value) {
  const input = value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : DEFAULT_STATE
  const keywords = []
  const seen = new Set()
  const candidates = Array.isArray(input.keywords)
    ? input.keywords
    : DEFAULT_STATE.keywords
  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue
    const display = candidate.trim()
    const key = normalizeText(display)
    if (!display || !key || seen.has(key)) continue
    seen.add(key)
    keywords.push(display)
  }
  return {
    keywords,
    activeTab: input.activeTab === 'latest' ? 'latest' : 'popular',
  }
}

export function decodeJsonString(value) {
  try {
    return JSON.parse(`"${String(value).replace(/"/g, '\\"')}"`)
  } catch {
    return value
  }
}

export function isKlixHostedAsset(value) {
  try {
    const hostname = new URL(value).hostname.toLowerCase()
    return hostname === 'klix.ba' || hostname.endsWith('.klix.ba')
  } catch {
    return false
  }
}

export function findBlockedKeyword(article, keywords) {
  const haystack = normalizeText(
    `${article.title} ${article.category} ${article.lead || ''} ${article.bodyText || ''}`,
  )
  return keywords.find((keyword) => {
    const needle = normalizeText(keyword)
    if (!needle) return false
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(?:^|[\\s-])${escaped}(?=$|[\\s-])`).test(haystack)
  }) || ''
}

export class BoundedCache {
  #entries = new Map()

  constructor(limit) {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new TypeError('BoundedCache limit must be a positive integer')
    }
    this.limit = limit
  }

  get size() {
    return this.#entries.size
  }

  get(key) {
    if (!this.#entries.has(key)) return undefined
    const value = this.#entries.get(key)
    this.#entries.delete(key)
    this.#entries.set(key, value)
    return value
  }

  set(key, value) {
    this.#entries.delete(key)
    this.#entries.set(key, value)
    while (this.#entries.size > this.limit) {
      this.#entries.delete(this.#entries.keys().next().value)
    }
    return this
  }

  delete(key) {
    return this.#entries.delete(key)
  }
}
