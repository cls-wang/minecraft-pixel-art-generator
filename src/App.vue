<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import ImageUpload from './components/ImageUpload.vue'
import ResolutionPicker from './components/ResolutionPicker.vue'
import BlockPalette from './components/BlockPalette.vue'
import IsometricPreview from './components/IsometricPreview.vue'
import FlatPreview from './components/FlatPreview.vue'
import BlockUsageStats from './components/BlockUsageStats.vue'
import LayerControls from './components/LayerControls.vue'
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
const denoise = ref(true)

// View mode
const viewMode = ref<'2d' | '3d'>('2d')

// Layer controls
const layerMode = ref(false)
const currentLayer = ref(1)

const visibleLayers = computed((): number | null =>
  layerMode.value ? currentLayer.value : null
)
const activeRow = computed((): number | null => {
  if (!layerMode.value || !conversionResult.value) return null
  return conversionResult.value.height - currentLayer.value
})

// Section collapse state
const collapsed = reactive({
  upload: false,
  resolution: false,
  palette: false,
  layer: false,
})

const canConvert = computed(() =>
  imageDataUrl.value !== null && selectedBlockIds.value.size >= 1
)

// After conversion: collapse setup sections, expand layer
watch(conversionResult, (result) => {
  currentLayer.value = 1
  layerMode.value = false
  if (result) {
    collapsed.upload = true
    collapsed.resolution = true
    collapsed.palette = true
    collapsed.layer = false
  }
})

function onImageUpload(dataUrl: string, _file: File) {
  imageDataUrl.value = dataUrl
  errorMsg.value = ''
  conversionResult.value = null
  collapsed.upload = false

  const img = new Image()
  img.onload = () => { imageAspect.value = img.width / img.height }
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
      palette,
      denoise.value
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

    <div class="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      <!-- Left: Settings panel -->
      <aside class="w-full lg:w-80 flex-shrink-0 space-y-3">

        <!-- 1. 上傳圖片 -->
        <section class="bg-slate-800 rounded-xl overflow-hidden">
          <button
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-750 transition-colors"
            @click="collapsed.upload = !collapsed.upload"
          >
            <div class="flex items-center gap-2">
              <span class="text-slate-400 text-xs font-bold">1</span>
              <h2 class="text-slate-200 font-medium text-sm">上傳圖片</h2>
              <span v-if="imageDataUrl && collapsed.upload" class="text-green-400 text-xs">✓ 已上傳</span>
            </div>
            <span class="text-slate-500 text-xs">{{ collapsed.upload ? '▼' : '▲' }}</span>
          </button>
          <div v-show="!collapsed.upload" class="px-4 pb-4 space-y-3">
            <ImageUpload @upload="onImageUpload" />
            <div v-if="imageDataUrl">
              <p class="text-slate-400 text-xs mb-1">原圖預覽</p>
              <img
                :src="imageDataUrl"
                alt="原圖"
                class="w-full rounded-lg max-h-40 object-contain bg-slate-900"
              />
            </div>
          </div>
        </section>

        <!-- 2. 解析度 -->
        <section class="bg-slate-800 rounded-xl overflow-hidden">
          <button
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-750 transition-colors"
            @click="collapsed.resolution = !collapsed.resolution"
          >
            <div class="flex items-center gap-2">
              <span class="text-slate-400 text-xs font-bold">2</span>
              <h2 class="text-slate-200 font-medium text-sm">解析度</h2>
              <span v-if="collapsed.resolution" class="text-slate-400 text-xs">
                {{ resolution.width }} × {{ resolution.height }} 格
              </span>
            </div>
            <span class="text-slate-500 text-xs">{{ collapsed.resolution ? '▼' : '▲' }}</span>
          </button>
          <div v-show="!collapsed.resolution" class="px-4 pb-4">
            <ResolutionPicker :image-aspect="imageAspect" @change="onResolutionChange" />
          </div>
        </section>

        <!-- 3. 方塊選擇 -->
        <section class="bg-slate-800 rounded-xl overflow-hidden">
          <button
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-750 transition-colors"
            @click="collapsed.palette = !collapsed.palette"
          >
            <div class="flex items-center gap-2">
              <span class="text-slate-400 text-xs font-bold">3</span>
              <h2 class="text-slate-200 font-medium text-sm">方塊選擇</h2>
              <span v-if="collapsed.palette" class="text-slate-400 text-xs">
                已選 {{ selectedBlockIds.size }} 個方塊
              </span>
            </div>
            <span class="text-slate-500 text-xs">{{ collapsed.palette ? '▼' : '▲' }}</span>
          </button>
          <div v-show="!collapsed.palette" class="px-4 pb-4">
            <BlockPalette @change="onPaletteChange" />
          </div>
        </section>

        <!-- Denoise option -->
        <label class="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-xl cursor-pointer select-none">
          <input
            type="checkbox"
            v-model="denoise"
            class="w-4 h-4 accent-green-500 cursor-pointer"
          />
          <div>
            <p class="text-slate-200 text-sm font-medium">減少雜點</p>
            <p class="text-slate-500 text-xs">移除周圍顏色不同的孤立方塊</p>
          </div>
        </label>

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

        <!-- 4. 分層瀏覽 -->
        <section v-if="conversionResult" class="bg-slate-800 rounded-xl overflow-hidden">
          <button
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-750 transition-colors"
            @click="collapsed.layer = !collapsed.layer"
          >
            <div class="flex items-center gap-2">
              <span class="text-slate-400 text-xs font-bold">4</span>
              <h2 class="text-slate-200 font-medium text-sm">分層瀏覽</h2>
              <span v-if="layerMode && collapsed.layer" class="text-yellow-400 text-xs">
                第 {{ currentLayer }} / {{ conversionResult.height }} 排
              </span>
              <span v-else-if="!layerMode && collapsed.layer" class="text-slate-400 text-xs">關閉</span>
            </div>
            <span class="text-slate-500 text-xs">{{ collapsed.layer ? '▼' : '▲' }}</span>
          </button>
          <div v-show="!collapsed.layer" class="px-4 pb-4">
            <LayerControls
              :result="conversionResult"
              :layer-mode="layerMode"
              :current-layer="currentLayer"
              @update:layer-mode="layerMode = $event"
              @update:current-layer="currentLayer = $event"
            />
          </div>
        </section>

      </aside>

      <!-- Right: Preview area -->
      <main class="flex-1 space-y-4 min-w-0">
        <section class="bg-slate-800 rounded-xl overflow-hidden flex flex-col" style="height: 520px;">
          <div class="flex border-b border-slate-700 flex-shrink-0">
            <button
              class="px-5 py-3 text-sm font-medium transition-colors"
              :class="viewMode === '2d'
                ? 'text-green-400 border-b-2 border-green-400 -mb-px'
                : 'text-slate-400 hover:text-slate-200'"
              @click="viewMode = '2d'"
            >🗺️ 2D 平面</button>
            <button
              class="px-5 py-3 text-sm font-medium transition-colors"
              :class="viewMode === '3d'
                ? 'text-green-400 border-b-2 border-green-400 -mb-px'
                : 'text-slate-400 hover:text-slate-200'"
              @click="viewMode = '3d'"
            >🧊 3D 等角</button>
          </div>

          <div class="flex-1 min-h-0">
            <FlatPreview
              v-show="viewMode === '2d'"
              :result="conversionResult"
              :visible-layers="visibleLayers"
            />
            <IsometricPreview
              v-show="viewMode === '3d'"
              :result="conversionResult"
              :active-row="activeRow"
            />
          </div>
        </section>

        <section v-if="conversionResult" class="bg-slate-800 rounded-xl p-4">
          <BlockUsageStats :result="conversionResult" />
        </section>
      </main>
    </div>
  </div>
</template>
