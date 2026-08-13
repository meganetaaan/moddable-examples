export function matrixPixelIndex (x, y, width, height, layout = 'serpentine') {
  if (!Number.isInteger(x) || !Number.isInteger(y) ||
      x < 0 || x >= width || y < 0 || y >= height) {
    throw new RangeError('pixel outside matrix')
  }

  let reverse
  if (layout === 'serpentine') reverse = Boolean(x & 1)
  else if (layout === 'columns-reversed') reverse = true
  else throw new RangeError(`unsupported matrix layout: ${layout}`)

  return (x * height) + (reverse ? height - y - 1 : y)
}

export function rgb565ToRGB (pixel) {
  const red = (pixel >> 11) & 0x1f
  const green = (pixel >> 5) & 0x3f
  const blue = pixel & 0x1f

  return (((red << 3) | (red >> 2)) << 16) |
    (((green << 2) | (green >> 4)) << 8) |
    ((blue << 3) | (blue >> 2))
}
