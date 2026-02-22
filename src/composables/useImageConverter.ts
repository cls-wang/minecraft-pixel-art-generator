import type { Block, PixelBlock, ConversionResult, BlockUsageEntry, RGBColor } from '../types'
import { BLOCK_MAP } from '../data/blocks'

/**
 * Calculates squared Euclidean distance in RGB space.
 * Using squared distance avoids sqrt and is sufficient for comparison.
 */
export function rgbDistanceSq(a: RGBColor, b: RGBColor): number {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return dr * dr + dg * dg + db * db
}

/**
 * Finds the closest block from the palette for a given RGB color.
 */
export function findClosestBlock(color: RGBColor, palette: Block[]): Block {
  let closest = palette[0]!
  let minDist = Infinity

  for (const block of palette) {
    const dist = rgbDistanceSq(color, block.color)
    if (dist < minDist) {
      minDist = dist
      closest = block
    }
  }

  return closest
}

/**
 * Loads an image from a data URL and returns an HTMLImageElement.
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('圖片載入失敗'))
    img.src = dataUrl
  })
}

/**
 * Removes isolated stray pixels by replacing each pixel that has no same-color
 * 4-directional neighbor with the most common neighbor's block ID.
 * A single pass eliminates lone pixels surrounded by a different color.
 */
export function denoisePixels(
  pixels: PixelBlock[],
  width: number,
  height: number
): PixelBlock[] {
  const grid = new Map<number, string>()
  for (const p of pixels) {
    grid.set(p.y * width + p.x, p.blockId)
  }

  const offsets = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ]

  return pixels.map(p => {
    const neighborIds: string[] = []
    for (const { dx, dy } of offsets) {
      const nx = p.x + dx
      const ny = p.y + dy
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
      const nId = grid.get(ny * width + nx)
      if (nId !== undefined) neighborIds.push(nId)
    }

    // Keep pixel if it has at least one same-color neighbor, or no neighbors at all
    if (neighborIds.length === 0 || neighborIds.some(id => id === p.blockId)) return p

    // Pixel is isolated — replace with the most frequent neighbor color
    const freq = new Map<string, number>()
    for (const id of neighborIds) {
      freq.set(id, (freq.get(id) ?? 0) + 1)
    }
    let bestId = neighborIds[0]!
    let bestCount = 0
    for (const [id, count] of freq) {
      if (count > bestCount) {
        bestCount = count
        bestId = id
      }
    }
    return { ...p, blockId: bestId }
  })
}

/**
 * Converts an image to pixel blocks using the given palette and resolution.
 * Transparent pixels (alpha < 128) are skipped.
 * Set denoise to true (default) to remove isolated stray pixels.
 */
export async function convertImage(
  dataUrl: string,
  targetWidth: number,
  targetHeight: number,
  palette: Block[],
  denoise = true
): Promise<ConversionResult> {
  if (palette.length === 0) {
    throw new Error('請至少選擇一個方塊')
  }

  const img = await loadImage(dataUrl)

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('無法建立 Canvas context')

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight)
  const data = imageData.data

  const rawPixels: PixelBlock[] = []

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const idx = (y * targetWidth + x) * 4
      const r = data[idx]!
      const g = data[idx + 1]!
      const b = data[idx + 2]!
      const a = data[idx + 3]!

      // Skip transparent pixels
      if (a < 128) continue

      const block = findClosestBlock({ r, g, b }, palette)
      rawPixels.push({ x, y, blockId: block.id })
    }
  }

  const pixels = denoise ? denoisePixels(rawPixels, targetWidth, targetHeight) : rawPixels

  const usageMap = new Map<string, number>()
  for (const p of pixels) {
    usageMap.set(p.blockId, (usageMap.get(p.blockId) ?? 0) + 1)
  }

  const blockUsage: BlockUsageEntry[] = Array.from(usageMap.entries())
    .map(([blockId, count]) => ({
      block: BLOCK_MAP.get(blockId)!,
      count,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    pixels,
    width: targetWidth,
    height: targetHeight,
    blockUsage,
  }
}
