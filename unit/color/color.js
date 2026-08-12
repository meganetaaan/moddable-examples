function normalizeChannel (value, clear) {
  if (!clear) return 0
  return Math.max(0, Math.min(255, Math.trunc((value / clear) * 255)))
}

export function normalizeColor ({ red, green, blue, clear }) {
  return {
    red: normalizeChannel(red, clear),
    green: normalizeChannel(green, clear),
    blue: normalizeChannel(blue, clear)
  }
}

export function toHexColor ({ red, green, blue }) {
  return `#${[red, green, blue]
    .map(value => value.toString(16).padStart(2, '0'))
    .join('')}`
}
