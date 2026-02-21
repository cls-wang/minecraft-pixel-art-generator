import type { Block } from '../types'

export const BLOCKS: Block[] = [
  // === Wool ===
  { id: 'white_wool',      name: '白色羊毛',     nameEn: 'White Wool',       category: 'wool', color: { r: 233, g: 236, b: 236 } },
  { id: 'orange_wool',     name: '橙色羊毛',     nameEn: 'Orange Wool',      category: 'wool', color: { r: 240, g: 118, b: 19  } },
  { id: 'magenta_wool',    name: '洋紅色羊毛',   nameEn: 'Magenta Wool',     category: 'wool', color: { r: 189, g: 68,  b: 179 } },
  { id: 'light_blue_wool', name: '淡藍色羊毛',   nameEn: 'Light Blue Wool',  category: 'wool', color: { r: 58,  g: 175, b: 217 } },
  { id: 'yellow_wool',     name: '黃色羊毛',     nameEn: 'Yellow Wool',      category: 'wool', color: { r: 248, g: 197, b: 39  } },
  { id: 'lime_wool',       name: '黃綠色羊毛',   nameEn: 'Lime Wool',        category: 'wool', color: { r: 112, g: 185, b: 25  } },
  { id: 'pink_wool',       name: '粉紅色羊毛',   nameEn: 'Pink Wool',        category: 'wool', color: { r: 237, g: 141, b: 172 } },
  { id: 'gray_wool',       name: '灰色羊毛',     nameEn: 'Gray Wool',        category: 'wool', color: { r: 71,  g: 79,  b: 82  } },
  { id: 'light_gray_wool', name: '淡灰色羊毛',   nameEn: 'Light Gray Wool',  category: 'wool', color: { r: 142, g: 142, b: 134 } },
  { id: 'cyan_wool',       name: '青色羊毛',     nameEn: 'Cyan Wool',        category: 'wool', color: { r: 21,  g: 137, b: 145 } },
  { id: 'purple_wool',     name: '紫色羊毛',     nameEn: 'Purple Wool',      category: 'wool', color: { r: 121, g: 42,  b: 172 } },
  { id: 'blue_wool',       name: '藍色羊毛',     nameEn: 'Blue Wool',        category: 'wool', color: { r: 53,  g: 57,  b: 157 } },
  { id: 'brown_wool',      name: '棕色羊毛',     nameEn: 'Brown Wool',       category: 'wool', color: { r: 114, g: 71,  b: 40  } },
  { id: 'green_wool',      name: '綠色羊毛',     nameEn: 'Green Wool',       category: 'wool', color: { r: 84,  g: 109, b: 27  } },
  { id: 'red_wool',        name: '紅色羊毛',     nameEn: 'Red Wool',         category: 'wool', color: { r: 160, g: 39,  b: 34  } },
  { id: 'black_wool',      name: '黑色羊毛',     nameEn: 'Black Wool',       category: 'wool', color: { r: 20,  g: 21,  b: 25  } },

  // === Concrete ===
  { id: 'white_concrete',      name: '白色混凝土',   nameEn: 'White Concrete',      category: 'concrete', color: { r: 207, g: 213, b: 214 } },
  { id: 'orange_concrete',     name: '橙色混凝土',   nameEn: 'Orange Concrete',     category: 'concrete', color: { r: 224, g: 97,  b: 0   } },
  { id: 'magenta_concrete',    name: '洋紅色混凝土', nameEn: 'Magenta Concrete',    category: 'concrete', color: { r: 169, g: 48,  b: 159 } },
  { id: 'light_blue_concrete', name: '淡藍色混凝土', nameEn: 'Light Blue Concrete', category: 'concrete', color: { r: 35,  g: 137, b: 198 } },
  { id: 'yellow_concrete',     name: '黃色混凝土',   nameEn: 'Yellow Concrete',     category: 'concrete', color: { r: 240, g: 175, b: 21  } },
  { id: 'lime_concrete',       name: '黃綠色混凝土', nameEn: 'Lime Concrete',       category: 'concrete', color: { r: 94,  g: 168, b: 24  } },
  { id: 'pink_concrete',       name: '粉紅色混凝土', nameEn: 'Pink Concrete',       category: 'concrete', color: { r: 213, g: 101, b: 143 } },
  { id: 'gray_concrete',       name: '灰色混凝土',   nameEn: 'Gray Concrete',       category: 'concrete', color: { r: 54,  g: 57,  b: 61  } },
  { id: 'light_gray_concrete', name: '淡灰色混凝土', nameEn: 'Light Gray Concrete', category: 'concrete', color: { r: 125, g: 125, b: 115 } },
  { id: 'cyan_concrete',       name: '青色混凝土',   nameEn: 'Cyan Concrete',       category: 'concrete', color: { r: 21,  g: 119, b: 136 } },
  { id: 'purple_concrete',     name: '紫色混凝土',   nameEn: 'Purple Concrete',     category: 'concrete', color: { r: 100, g: 31,  b: 156 } },
  { id: 'blue_concrete',       name: '藍色混凝土',   nameEn: 'Blue Concrete',       category: 'concrete', color: { r: 44,  g: 46,  b: 143 } },
  { id: 'brown_concrete',      name: '棕色混凝土',   nameEn: 'Brown Concrete',      category: 'concrete', color: { r: 96,  g: 59,  b: 31  } },
  { id: 'green_concrete',      name: '綠色混凝土',   nameEn: 'Green Concrete',      category: 'concrete', color: { r: 73,  g: 91,  b: 36  } },
  { id: 'red_concrete',        name: '紅色混凝土',   nameEn: 'Red Concrete',        category: 'concrete', color: { r: 142, g: 32,  b: 32  } },
  { id: 'black_concrete',      name: '黑色混凝土',   nameEn: 'Black Concrete',      category: 'concrete', color: { r: 8,   g: 10,  b: 15  } },

  // === Wood (logs, top face color) ===
  { id: 'oak_log',      name: '橡木原木',   nameEn: 'Oak Log',      category: 'wood', color: { r: 162, g: 130, b: 78  } },
  { id: 'birch_log',    name: '白樺原木',   nameEn: 'Birch Log',    category: 'wood', color: { r: 216, g: 215, b: 178 } },
  { id: 'spruce_log',   name: '雲杉原木',   nameEn: 'Spruce Log',   category: 'wood', color: { r: 106, g: 80,  b: 46  } },
  { id: 'jungle_log',   name: '叢林原木',   nameEn: 'Jungle Log',   category: 'wood', color: { r: 160, g: 115, b: 65  } },
  { id: 'acacia_log',   name: '金合歡原木', nameEn: 'Acacia Log',   category: 'wood', color: { r: 168, g: 90,  b: 51  } },
  { id: 'dark_oak_log', name: '深色橡木原木', nameEn: 'Dark Oak Log', category: 'wood', color: { r: 66, g: 45, b: 20  } },
  { id: 'mangrove_log', name: '紅樹原木',   nameEn: 'Mangrove Log', category: 'wood', color: { r: 115, g: 37,  b: 32  } },
  { id: 'cherry_log',   name: '櫻花原木',   nameEn: 'Cherry Log',   category: 'wood', color: { r: 206, g: 122, b: 117 } },

  // === Stone ===
  { id: 'stone',          name: '石頭',     nameEn: 'Stone',          category: 'stone', color: { r: 125, g: 125, b: 125 } },
  { id: 'cobblestone',    name: '圓石',     nameEn: 'Cobblestone',    category: 'stone', color: { r: 127, g: 127, b: 127 } },
  { id: 'stone_bricks',   name: '石磚',     nameEn: 'Stone Bricks',   category: 'stone', color: { r: 119, g: 118, b: 119 } },
  { id: 'andesite',       name: '安山岩',   nameEn: 'Andesite',       category: 'stone', color: { r: 136, g: 136, b: 136 } },
  { id: 'diorite',        name: '閃長岩',   nameEn: 'Diorite',        category: 'stone', color: { r: 188, g: 188, b: 188 } },
  { id: 'granite',        name: '花崗岩',   nameEn: 'Granite',        category: 'stone', color: { r: 149, g: 103, b: 80  } },
  { id: 'deepslate',      name: '深板岩',   nameEn: 'Deepslate',      category: 'stone', color: { r: 76,  g: 76,  b: 83  } },
  { id: 'blackstone',     name: '黑石',     nameEn: 'Blackstone',     category: 'stone', color: { r: 40,  g: 34,  b: 41  } },
  { id: 'sandstone',      name: '砂岩',     nameEn: 'Sandstone',      category: 'stone', color: { r: 217, g: 204, b: 158 } },
  { id: 'red_sandstone',  name: '紅砂岩',   nameEn: 'Red Sandstone',  category: 'stone', color: { r: 177, g: 96,  b: 24  } },
  { id: 'obsidian',       name: '黑曜石',   nameEn: 'Obsidian',       category: 'stone', color: { r: 15,  g: 10,  b: 25  } },
  { id: 'netherrack',     name: '地獄岩',   nameEn: 'Netherrack',     category: 'stone', color: { r: 114, g: 55,  b: 55  } },
]

export const BLOCK_MAP = new Map<string, Block>(
  BLOCKS.map(b => [b.id, b])
)

export const BLOCKS_BY_CATEGORY = {
  wool:     BLOCKS.filter(b => b.category === 'wool'),
  concrete: BLOCKS.filter(b => b.category === 'concrete'),
  wood:     BLOCKS.filter(b => b.category === 'wood'),
  stone:    BLOCKS.filter(b => b.category === 'stone'),
}

export const CATEGORY_LABELS: Record<string, string> = {
  wool:     '全彩羊毛',
  concrete: '混凝土',
  wood:     '木頭類',
  stone:    '石材類',
}
