import { hsl } from 'piu/All'
const TEMP_MAX = 35
const TEMP_MIN = 5
const TEMP_RANGE = TEMP_MAX - TEMP_MIN
const HUE_RANGE = 270

export default function temperatureToColor (temperature) {
  const clampedTemp = Math.max(Math.min(temperature, TEMP_MAX), TEMP_MIN)
  const hue = ((TEMP_MAX - clampedTemp) * HUE_RANGE) / TEMP_RANGE
  return hsl(hue, 1, 0.3)
}
