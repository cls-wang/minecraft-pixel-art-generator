<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ResolutionConfig, PresetWidth } from '../types'

const props = defineProps<{
  imageAspect: number // width / height ratio of original image
}>()

const emit = defineEmits<{
  change: [config: ResolutionConfig]
}>()

const PRESETS: PresetWidth[] = [32, 64, 128]
const selectedPreset = ref<PresetWidth | null>(64)
const customWidth = ref<number>(64)

const width = computed(() => selectedPreset.value ?? Math.max(16, Math.min(256, customWidth.value)))
const height = computed(() => {
  if (props.imageAspect <= 0) return width.value
  return Math.max(1, Math.round(width.value / props.imageAspect))
})
const totalBlocks = computed(() => width.value * height.value)

watch([width, height], () => {
  emit('change', { width: width.value, height: height.value })
}, { immediate: true })

function selectPreset(p: PresetWidth) {
  selectedPreset.value = p
  customWidth.value = p
}

function onCustomInput(e: Event) {
  const val = parseInt((e.target as HTMLInputElement).value, 10)
  if (!isNaN(val)) {
    customWidth.value = Math.max(16, Math.min(256, val))
    selectedPreset.value = null
  }
}
</script>

<template>
  <div class="space-y-3">
    <label class="text-slate-300 text-sm font-medium">解析度（方塊數）</label>

    <div class="flex gap-2">
      <button
        v-for="p in PRESETS"
        :key="p"
        class="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="selectedPreset === p
          ? 'bg-green-600 text-white'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'"
        @click="selectPreset(p)"
      >
        {{ p }}
      </button>
    </div>

    <div class="flex items-center gap-2">
      <span class="text-slate-400 text-sm">自訂寬度：</span>
      <input
        type="number"
        :value="customWidth"
        min="16"
        max="256"
        class="w-20 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-green-500"
        @input="onCustomInput"
        @focus="selectedPreset = null"
      />
      <span class="text-slate-500 text-sm">（16–256）</span>
    </div>

    <div class="bg-slate-800 rounded-lg px-3 py-2 text-sm">
      <span class="text-slate-400">尺寸：</span>
      <span class="text-green-400 font-medium">{{ width }} × {{ height }}</span>
      <span class="text-slate-400"> 格 = </span>
      <span class="text-slate-300">{{ totalBlocks.toLocaleString() }} 個方塊</span>
    </div>
  </div>
</template>
