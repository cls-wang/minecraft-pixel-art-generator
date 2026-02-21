<script setup lang="ts">
import { ref, computed } from 'vue'
import ImageUpload from './components/ImageUpload.vue'
import ResolutionPicker from './components/ResolutionPicker.vue'
import BlockPalette from './components/BlockPalette.vue'
import IsometricPreview from './components/IsometricPreview.vue'
import BlockUsageStats from './components/BlockUsageStats.vue'
import { convertImage } from './composables/useImageConverter'
import { BLOCKS } from './data/blocks'
import type { ConversionResult, ResolutionConfig } from './types'

const imageDataUrl = ref<string | null>(null)
const imageAspect = ref(1)
const resolution = ref<ResolutionConfig>({ width: 64, height: 64 })
const selectedBlockIds = ref<Set<string>>(new Set(
  BLOCKS.filter(b => b.category === 'wool').map(b => b.id)
))

const conversionResult = ref<ConversionResult | null>(null)
const isConverting = ref(false)
const errorMsg = ref('')

const canConvert = computed(() =>
  imageDataUrl.value !== null && selectedBlockIds.value.size >= 1
)

function onImageUpload(dataUrl: string, _file: File) {
  imageDataUrl.value = dataUrl
  errorMsg.value = ''
  conversionResult.value = null

  // Determine aspect ratio
  const img = new Image()
  img.onload = () => {
    imageAspect.value = img.width / img.height
  }
  img.src = dataUrl
}

function onResolutionChange(config: ResolutionConfig) {
  resolution.value = config
}

function onPaletteChange(ids: Set<string>) {
  selectedBlockIds.value = ids
}

async function convert() {
  if (!imageDataUrl.value || !canConvert.value) return

  isConverting.value = true
  errorMsg.value = ''

  try {
    const palette = BLOCKS.filter(b => selectedBlockIds.value.has(b.id))
    const result = await convertImage(
      imageDataUrl.value,
      resolution.value.width,
      resolution.value.height,
      palette
    )
    conversionResult.value = result
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : '轉換失敗，請重試'
  } finally {
    isConverting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-100">
    <!-- Header -->
    <header class="border-b border-slate-700 px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center gap-3">
        <span class="text-2xl">⛏️</span>
        <div>
          <h1 class="text-xl font-bold text-white">Minecraft Pixel Art Generator</h1>
          <p class="text-slate-400 text-sm">將圖片轉換為 Minecraft 方塊點陣圖</p>
        </div>
      </div>
    </header>

    <!-- Main layout -->
    <div class="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      <!-- Left: Settings panel -->
      <aside class="w-full lg:w-80 flex-shrink-0 space-y-5">
        <!-- Upload -->
        <section class="bg-slate-800 rounded-xl p-4 space-y-3">
          <h2 class="text-slate-200 font-medium text-sm uppercase tracking-wide">1. 上傳圖片</h2>
          <ImageUpload @upload="onImageUpload" />

          <!-- Original preview -->
          <div v-if="imageDataUrl" class="mt-2">
            <p class="text-slate-400 text-xs mb-1">原圖預覽</p>
            <img
              :src="imageDataUrl"
              alt="原圖"
              class="w-full rounded-lg max-h-40 object-contain bg-slate-900"
            />
          </div>
        </section>

        <!-- Resolution -->
        <section class="bg-slate-800 rounded-xl p-4">
          <h2 class="text-slate-200 font-medium text-sm uppercase tracking-wide mb-3">2. 解析度</h2>
          <ResolutionPicker
            :image-aspect="imageAspect"
            @change="onResolutionChange"
          />
        </section>

        <!-- Block palette -->
        <section class="bg-slate-800 rounded-xl p-4">
          <h2 class="text-slate-200 font-medium text-sm uppercase tracking-wide mb-3">3. 方塊選擇</h2>
          <BlockPalette @change="onPaletteChange" />
        </section>

        <!-- Convert button -->
        <button
          class="w-full py-3 rounded-xl font-bold text-base transition-all"
          :class="canConvert && !isConverting
            ? 'bg-green-600 hover:bg-green-500 text-white cursor-pointer'
            : 'bg-slate-700 text-slate-500 cursor-not-allowed'"
          :disabled="!canConvert || isConverting"
          @click="convert"
        >
          <span v-if="isConverting">轉換中...</span>
          <span v-else-if="!imageDataUrl">請先上傳圖片</span>
          <span v-else-if="selectedBlockIds.size === 0">請選擇方塊</span>
          <span v-else>⚡ 轉換為方塊</span>
        </button>

        <p v-if="errorMsg" class="text-red-400 text-sm px-1">{{ errorMsg }}</p>
      </aside>

      <!-- Right: Preview area -->
      <main class="flex-1 space-y-5 min-w-0">
        <!-- 3D Preview -->
        <section class="bg-slate-800 rounded-xl overflow-hidden" style="height: 480px;">
          <IsometricPreview :result="conversionResult" />
        </section>

        <!-- Usage stats -->
        <section v-if="conversionResult" class="bg-slate-800 rounded-xl p-4">
          <BlockUsageStats :result="conversionResult" />
        </section>
      </main>
    </div>
  </div>
</template>
