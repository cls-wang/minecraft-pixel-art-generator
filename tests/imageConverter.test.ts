import { describe, it, expect } from 'vitest'
import { rgbDistanceSq, findClosestBlock } from '../src/composables/useImageConverter'
import { BLOCKS, BLOCKS_BY_CATEGORY } from '../src/data/blocks'
import type { Block, RGBColor } from '../src/types'

describe('rgbDistanceSq', () => {
  it('returns 0 for identical colors', () => {
    expect(rgbDistanceSq({ r: 100, g: 150, b: 200 }, { r: 100, g: 150, b: 200 })).toBe(0)
  })

  it('calculates correct squared distance', () => {
    // dr=3, dg=4, db=0 → 9+16+0=25
    expect(rgbDistanceSq({ r: 0, g: 0, b: 0 }, { r: 3, g: 4, b: 0 })).toBe(25)
  })

  it('is symmetric', () => {
    const a: RGBColor = { r: 10, g: 20, b: 30 }
    const b: RGBColor = { r: 50, g: 80, b: 120 }
    expect(rgbDistanceSq(a, b)).toBe(rgbDistanceSq(b, a))
  })
})

describe('findClosestBlock', () => {
  const palette: Block[] = [
    { id: 'black', name: '黑', nameEn: 'Black', category: 'wool', color: { r: 0,   g: 0,   b: 0   } },
    { id: 'white', name: '白', nameEn: 'White', category: 'wool', color: { r: 255, g: 255, b: 255 } },
    { id: 'red',   name: '紅', nameEn: 'Red',   category: 'wool', color: { r: 255, g: 0,   b: 0   } },
  ]

  it('finds white for a near-white color', () => {
    const result = findClosestBlock({ r: 240, g: 240, b: 240 }, palette)
    expect(result.id).toBe('white')
  })

  it('finds black for a near-black color', () => {
    const result = findClosestBlock({ r: 10, g: 10, b: 10 }, palette)
    expect(result.id).toBe('black')
  })

  it('finds red for pure red', () => {
    const result = findClosestBlock({ r: 255, g: 0, b: 0 }, palette)
    expect(result.id).toBe('red')
  })

  it('returns the only block when palette has one entry', () => {
    const single = [palette[0]!]
    const result = findClosestBlock({ r: 128, g: 128, b: 128 }, single)
    expect(result.id).toBe('black')
  })
})

describe('Block data integrity', () => {
  it('all blocks have valid RGB values (0-255)', () => {
    for (const block of BLOCKS) {
      const { r, g, b } = block.color
      expect(r).toBeGreaterThanOrEqual(0)
      expect(r).toBeLessThanOrEqual(255)
      expect(g).toBeGreaterThanOrEqual(0)
      expect(g).toBeLessThanOrEqual(255)
      expect(b).toBeGreaterThanOrEqual(0)
      expect(b).toBeLessThanOrEqual(255)
    }
  })

  it('all blocks have non-empty id, name, nameEn', () => {
    for (const block of BLOCKS) {
      expect(block.id.length).toBeGreaterThan(0)
      expect(block.name.length).toBeGreaterThan(0)
      expect(block.nameEn.length).toBeGreaterThan(0)
    }
  })

  it('has 16 wool blocks', () => {
    expect(BLOCKS_BY_CATEGORY.wool).toHaveLength(16)
  })

  it('has 16 concrete blocks', () => {
    expect(BLOCKS_BY_CATEGORY.concrete).toHaveLength(16)
  })

  it('all block ids are unique', () => {
    const ids = BLOCKS.map(b => b.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})

describe('Resolution calculation', () => {
  it('calculates height from aspect ratio correctly', () => {
    const aspect = 16 / 9
    const width = 64
    const height = Math.max(1, Math.round(width / aspect))
    expect(height).toBe(36)
  })

  it('clamps width to valid range', () => {
    const clamp = (v: number) => Math.max(16, Math.min(256, v))
    expect(clamp(0)).toBe(16)
    expect(clamp(500)).toBe(256)
    expect(clamp(128)).toBe(128)
  })
})
