<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ConversionResult } from '../types'

const props = defineProps<{
  result: ConversionResult
}>()

const copied = ref(false)

const totalBlocks = computed(() =>
  props.result.blockUsage.reduce((sum, e) => sum + e.count, 0)
)

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function getColor(entry: typeof props.result.blockUsage[0]) {
  const { r, g, b } = entry.block.color
  return rgbToHex(r, g, b)
}

function barWidth(count: number): string {
  const max = props.result.blockUsage[0]?.count ?? 1
  return `${Math.round((count / max) * 100)}%`
}

async function copyList() {
  const text = props.result.blockUsage
    .map(e => `${e.block.name} (${e.block.nameEn}) ×${e.count}`)
    .join('\n')

  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback: select text
  }
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-slate-200 font-medium">
        方塊用量統計
        <span class="text-slate-400 text-sm font-normal ml-2">
          共 {{ totalBlocks.toLocaleString() }} 個方塊，{{ result.blockUsage.length }} 種
        </span>
      </h3>
      <button
        class="text-xs px-3 py-1.5 rounded-lg transition-colors"
        :class="copied
          ? 'bg-green-700 text-green-200'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'"
        @click="copyList"
      >
        {{ copied ? '已複製！' : '複製清單' }}
      </button>
    </div>

    <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
      <div
        v-for="entry in result.blockUsage"
        :key="entry.block.id"
        class="flex items-center gap-2 group"
      >
        <!-- Color swatch -->
        <span
          class="w-4 h-4 rounded-sm flex-shrink-0 border border-slate-600"
          :style="{ backgroundColor: getColor(entry) }"
        />

        <!-- Block name -->
        <span class="text-slate-300 text-sm w-28 flex-shrink-0 truncate" :title="entry.block.name">
          {{ entry.block.name }}
        </span>

        <!-- Bar -->
        <div class="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :style="{
              width: barWidth(entry.count),
              backgroundColor: getColor(entry),
              opacity: 0.7,
            }"
          />
        </div>

        <!-- Count -->
        <span class="text-slate-400 text-xs w-12 text-right flex-shrink-0">
          ×{{ entry.count.toLocaleString() }}
        </span>
      </div>
    </div>
  </div>
</template>
