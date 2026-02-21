export interface RGBColor {
  r: number
  g: number
  b: number
}

export interface Block {
  id: string
  name: string
  nameEn: string
  category: BlockCategory
  color: RGBColor
}

export type BlockCategory = 'wool' | 'concrete' | 'wood' | 'stone'

export interface PixelBlock {
  x: number
  y: number
  blockId: string
}

export interface ConversionResult {
  pixels: PixelBlock[]
  width: number
  height: number
  blockUsage: BlockUsageEntry[]
}

export interface BlockUsageEntry {
  block: Block
  count: number
}

export interface ResolutionConfig {
  width: number
  height: number
}

export type PresetWidth = 32 | 64 | 128
