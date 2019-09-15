export function hslToRgb (h, s, l) {
  let min, max
  if (l < 0.5) {
    max = 255 * (l + l * s)
    min = 255 * (l - l * s)
  } else {
    max = 255 * (l + (1 - l) * s)
    min = 255 * (l - (1 - l) * s)
  }

  let r, g, b
  if (h < 60) {
    r = max
    g = (h / 60) * (max - min) + min
    b = min
  } else if (h < 120) {
    r = ((120 - h) / 60) * (max - min) + min
    g = max
    b = min
  } else {
    r = min
    g = max
    b = ((h - 120) / 60) * (max - min) + min
  }

  return { r, g, b }
}

export function rgbToHsl (r, g, b) {
  // calculate h
  let h = 0
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (r === max) {
    h = 60 * ((g - b) / (max - min))
  } else if (g === max) {
    h = 60 * ((b - r) / (max - min)) + 120
  } else if (b === max) {
    h = 60 * ((r - g) / (max - min)) + 240
  }
  if (h < 0) {
    h += 360
  }

  // calculate s
  let s
  const cnt = (max + min) / 2
  if (cnt <= 127) {
    s = (max - min) / (max + min)
  } else {
    s = (max - min) / (510 - max - min)
  }

  // calculate l
  let l = (max + min) / 510

  return { h, s, l }
}

export default {
  hslToRgb,
  rgbToHsl
}
