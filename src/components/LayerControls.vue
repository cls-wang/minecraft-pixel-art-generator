<script setup lang="ts">
import { computed } from 'vue'
import type { ConversionResult, BlockUsageEntry } from '../types'
import { BLOCK_MAP } from '../data/blocks'

const props = defineProps<{
  result: ConversionResult
  layerMode: boolean
  // currentLayer: 已顯示幾排（從底部算），1 = 只顯示最底排
  currentLayer: number
}>()

const emit = defineEmits<{
  'update:layerMode': [value: boolean]
  'update:currentLayer': [value: number]
}>()

const totalLayers = computed(() => props.result.height)

// 目前正在蓋的那排的 pixel y 座標
const currentRowPixelY = computed(() =>
  props.result.height - props.currentLayer
)

// 本排所需方塊
const layerUsage = computed((): BlockUsageEntry[] => {
  if (!props.layerMode) return []

  const row = currentRowPixelY.value
  const usageMap = new Map<string, number>()

  for (const px of props.result.pixels) {
    if (px.y !== row) continue
    usageMap.set(px.blockId, (usageMap.get(px.blockId) ?? 0) + 1)
  }

  return Array.from(usageMap.entries())
    .map(([blockId, count]) => ({
      block: BLOCK_MAP.get(blockId)!,
      count,
    }))
    .sort((a, b) => b.count - a.count)
})

const progress = computed(() =>
  Math.round((props.currentLayer / totalLayers.value) * 100)
)

function prevLayer() {
  if (props.currentLayer > 1) emit('update:currentLayer', props.currentLayer - 1)
}

function nextLayer() {
  if (props.currentLayer < totalLayers.value) emit('update:currentLayer', props.currentLayer + 1)
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}
</script>

<template>
  <div class="space-y-3">
    <!-- Toggle -->
    <div class="flex items-center justify-between">
      <div>
        <span class="text-slate-300 text-sm font-medium">建造輔助模式</span>
        <div class="text-slate-500 text-xs mt-0.5">從底部逐排顯示，照著蓋</div>
      </div>
      <button
        class="relative w-12 h-6 rounded-full transition-colors flex-shrink-0"
        :class="layerMode ? 'bg-green-600' : 'bg-slate-600'"
        @click="emit('update:layerMode', !layerMode)"
      >
        <span
          class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all"
          :class="layerMode ? 'left-7' : 'left-1'"
        />
      </button>
    </div>

    <template v-if="layerMode">
      <div class="bg-slate-900 rounded-xl p-3 space-y-3">

        <!-- Progress indicator -->
        <div class="flex items-center justify-between">
          <span class="text-slate-400 text-xs">建造進度</span>
          <span class="text-green-400 text-xs font-medium">{{ progress }}%</span>
        </div>
        <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-green-500 rounded-full transition-all"
            :style="{ width: progress + '%' }"
          />
        </div>

        <!-- Current layer label -->
        <div class="text-center py-1">
          <div class="text-yellow-400 font-bold text-base">
            🟨 第 {{ currentLayer }} 排（目前正在蓋）
          </div>
          <div class="text-slate-400 text-xs mt-0.5">
            已顯示 {{ currentLayer }} / {{ totalLayers }} 排
          </div>
        </div>

        <!-- Slider -->
        <input
          type="range"
          :min="1"
          :max="totalLayers"
          :value="currentLayer"
          class="w-full accent-yellow-400"
          @input="emit('update:currentLayer', parseInt(($event.target as HTMLInputElement).value))"
        />

        <!-- Prev / Next buttons -->
        <div class="flex gap-2">
          <button
            class="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="currentLayer > 1
              ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'"
            :disabled="currentLayer <= 1"
            @click="prevLayer"
          >← 上一排</button>

          <button
            class="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="currentLayer < totalLayers
              ? 'bg-yellow-600 text-white hover:bg-yellow-500'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'"
            :disabled="currentLayer >= totalLayers"
            @click="nextLayer"
          >下一排 →</button>
        </div>

        <!-- Per-layer block list -->
        <div v-if="layerUsage.length > 0" class="space-y-1.5">
          <div class="text-slate-300 text-xs font-medium border-t border-slate-700 pt-2">
            本排需要（共 {{ layerUsage.reduce((s, e) => s + e.count, 0) }} 個）：
          </div>
          <div
            v-for="entry in layerUsage"
            :key="entry.block.id"
            class="flex items-center gap-2"
          >
            <span
              class="w-4 h-4 rounded-sm flex-shrink-0 border border-slate-600"
              :style="{ backgroundColor: rgbToHex(entry.block.color.r, entry.block.color.g, entry.block.color.b) }"
            />
            <span class="text-slate-300 text-xs flex-1 truncate">{{ entry.block.name }}</span>
            <span class="text-yellow-400 text-xs font-medium">×{{ entry.count }}</span>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>
