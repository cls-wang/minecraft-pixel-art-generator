<script setup lang="ts">
import { ref, computed } from 'vue'
import { BLOCKS, BLOCKS_BY_CATEGORY, CATEGORY_LABELS } from '../data/blocks'
import type { Block, BlockCategory } from '../types'

const emit = defineEmits<{
  change: [selectedIds: Set<string>]
}>()

type CategoryKey = BlockCategory

const expanded = ref<Record<CategoryKey, boolean>>({
  wool: true,
  concrete: false,
  wood: false,
  stone: false,
})

const selectedIds = ref<Set<string>>(new Set(
  BLOCKS_BY_CATEGORY.wool.map(b => b.id)
))

const CATEGORY_KEYS: CategoryKey[] = ['wool', 'concrete', 'wood', 'stone']

const hasEnough = computed(() => selectedIds.value.size >= 1)

function toggleBlock(id: string) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedIds.value = next
  emit('change', next)
}

function toggleCategory(cat: CategoryKey, selected: boolean) {
  const next = new Set(selectedIds.value)
  for (const b of BLOCKS_BY_CATEGORY[cat]) {
    if (selected) next.add(b.id)
    else next.delete(b.id)
  }
  selectedIds.value = next
  emit('change', next)
}

function isCategoryAllSelected(cat: CategoryKey) {
  return BLOCKS_BY_CATEGORY[cat].every(b => selectedIds.value.has(b.id))
}

function isCategoryPartial(cat: CategoryKey) {
  const blocks = BLOCKS_BY_CATEGORY[cat]
  const count = blocks.filter(b => selectedIds.value.has(b.id)).length
  return count > 0 && count < blocks.length
}

function selectAll() {
  const next = new Set(BLOCKS.map(b => b.id))
  selectedIds.value = next
  emit('change', next)
}

function clearAll() {
  selectedIds.value = new Set()
  emit('change', new Set())
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function getBlockColor(block: Block) {
  return rgbToHex(block.color.r, block.color.g, block.color.b)
}

// emit initial selection
emit('change', selectedIds.value)
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label class="text-slate-300 text-sm font-medium">方塊調色盤</label>
      <div class="flex gap-2 text-xs">
        <button
          class="text-green-400 hover:text-green-300 transition-colors"
          @click="selectAll"
        >全選</button>
        <span class="text-slate-600">|</span>
        <button
          class="text-slate-400 hover:text-slate-300 transition-colors"
          @click="clearAll"
        >清除</button>
      </div>
    </div>

    <div class="text-xs text-slate-500">
      已選 {{ selectedIds.size }} 個方塊
    </div>

    <p v-if="!hasEnough" class="text-red-400 text-xs">請至少選擇 1 個方塊</p>

    <div
      v-for="cat in CATEGORY_KEYS"
      :key="cat"
      class="border border-slate-700 rounded-lg overflow-hidden"
    >
      <!-- Category header -->
      <button
        class="w-full flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-750 transition-colors"
        @click="expanded[cat] = !expanded[cat]"
      >
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="isCategoryAllSelected(cat)"
            :indeterminate="isCategoryPartial(cat)"
            class="w-4 h-4 accent-green-500"
            @click.stop="toggleCategory(cat, !isCategoryAllSelected(cat))"
          />
          <span class="text-slate-200 text-sm font-medium">{{ CATEGORY_LABELS[cat] }}</span>
          <span class="text-slate-500 text-xs">
            ({{ BLOCKS_BY_CATEGORY[cat].filter(b => selectedIds.has(b.id)).length }}/{{ BLOCKS_BY_CATEGORY[cat].length }})
          </span>
        </div>
        <span class="text-slate-400 text-xs">{{ expanded[cat] ? '▲' : '▼' }}</span>
      </button>

      <!-- Block list -->
      <div v-if="expanded[cat]" class="p-2 grid grid-cols-2 gap-1 bg-slate-900">
        <label
          v-for="block in BLOCKS_BY_CATEGORY[cat]"
          :key="block.id"
          class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-slate-800 transition-colors"
        >
          <input
            type="checkbox"
            :checked="selectedIds.has(block.id)"
            class="w-3.5 h-3.5 accent-green-500"
            @change="toggleBlock(block.id)"
          />
          <span
            class="w-4 h-4 rounded-sm flex-shrink-0 border border-slate-600"
            :style="{ backgroundColor: getBlockColor(block) }"
          />
          <span class="text-slate-300 text-xs truncate">{{ block.name }}</span>
        </label>
      </div>
    </div>
  </div>
</template>
