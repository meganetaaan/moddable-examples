const MIN_DISTANCE = 50
const MAX_DISTANCE = 500
const KEY_A = 440
const SLOPE = -1 / 450
const OFFSET = 10 / 9

function frequencyFromDistance (millimeters) {
  const distance = Math.floor(
    Math.min(MAX_DISTANCE, Math.max(millimeters, MIN_DISTANCE))
  )
  return KEY_A * Math.pow(2, distance * SLOPE + OFFSET)
}

export default frequencyFromDistance
