export function hasIFTTTKey (key) {
  return typeof key === 'string' && key.length > 0 && !key.startsWith('YOUR_')
}

export function makeIFTTTPath ({ event, key, value }) {
  if (!event) throw new TypeError('event is required')
  if (!key) throw new TypeError('key is required')

  const path = `/trigger/${encodeURIComponent(event)}/with/key/${encodeURIComponent(key)}`
  if (value === undefined) return path
  return `${path}?value1=${encodeURIComponent(String(value))}`
}
