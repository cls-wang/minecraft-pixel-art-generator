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
 * Converts an image to pixel blocks using the given palette and resolution.
 * Transparent pixels (alpha < 128) are skipped.
 */
export async function convertImage(
  dataUrl: string,
  targetWidth: number,
  targetHeight: number,
  palette: Block[]
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

  const pixels: PixelBlock[] = []
  const usageMap = new Map<string, number>()

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
      pixels.push({ x, y, blockId: block.id })
      usageMap.set(block.id, (usageMap.get(block.id) ?? 0) + 1)
    }
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
