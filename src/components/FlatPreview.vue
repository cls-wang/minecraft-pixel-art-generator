<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import type { ConversionResult } from '../types'
import { BLOCK_MAP } from '../data/blocks'

const props = defineProps<{
  result: ConversionResult | null
  visibleLayers: number | null
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const scrollRef = ref<HTMLDivElement | null>(null)
const zoom = ref(1)
const MIN_ZOOM = 0.5
const MAX_ZOOM = 8
const BASE_CELL = 10

// Pan state
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })

const cellSize = computed(() => Math.max(2, Math.round(BASE_CELL * zoom.value)))

function draw() {
  const canvas = canvasRef.value
  const result = props.result
  if (!canvas || !result) return

  const { pixels, width, height } = result
  const cell = cellSize.value

  canvas.width = width * cell
  canvas.height = height * cell

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const px of pixels) {
    const block = BLOCK_MAP.get(px.blockId)
    if (!block) continue

    const { r, g, b } = block.color
    const rowFromBottom = height - 1 - px.y

    if (props.visibleLayers === null) {
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(px.x * cell, px.y * cell, cell, cell)
      if (cell >= 6) {
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'
        ctx.lineWidth = 0.5
        ctx.strokeRect(px.x * cell, px.y * cell, cell, cell)
      }
    } else if (rowFromBottom < props.visibleLayers) {
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(px.x * cell, px.y * cell, cell, cell)
      if (cell >= 6) {
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'
        ctx.lineWidth = 0.5
        ctx.strokeRect(px.x * cell, px.y * cell, cell, cell)
      }
    } else {
      ctx.fillStyle = `rgba(${r},${g},${b},0.12)`
      ctx.fillRect(px.x * cell, px.y * cell, cell, cell)
    }
  }

  if (props.visibleLayers !== null && props.visibleLayers >= 1) {
    const currentRowY = height - props.visibleLayers
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = Math.max(1, cell / 5)
    ctx.strokeRect(
      ctx.lineWidth / 2,
      currentRowY * cell + ctx.lineWidth / 2,
      width * cell - ctx.lineWidth,
      cell - ctx.lineWidth
    )
  }
}

// ── Zoom ──────────────────────────────────────────────────────────────
function changeZoom(delta: number, originX?: number, originY?: number) {
  const container = scrollRef.value
  const oldZoom = zoom.value
  const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round((oldZoom + delta) * 10) / 10))
  if (newZoom === oldZoom) return

  // Keep the pixel under the cursor (or center) in place after zoom
  if (container) {
    const cx = originX ?? container.clientWidth / 2
    const cy = originY ?? container.clientHeight / 2
    const ratio = newZoom / oldZoom
    container.scrollLeft = (container.scrollLeft + cx) * ratio - cx
    container.scrollTop  = (container.scrollTop  + cy) * ratio - cy
  }

  zoom.value = newZoom
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const container = scrollRef.value
  if (!container) return
  const rect = container.getBoundingClientRect()
  changeZoom(e.deltaY > 0 ? -0.2 : 0.2, e.clientX - rect.left, e.clientY - rect.top)
}

// ── Pan ───────────────────────────────────────────────────────────────
function onMouseDown(e: MouseEvent) {
  if (e.button !== 0) return
  const container = scrollRef.value
  if (!container) return
  isPanning.value = true
  panStart.value = {
    x: e.clientX,
    y: e.clientY,
    scrollLeft: container.scrollLeft,
    scrollTop: container.scrollTop,
  }
  e.preventDefault()
}

function onMouseMove(e: MouseEvent) {
  if (!isPanning.value) return
  const container = scrollRef.value
  if (!container) return
  container.scrollLeft = panStart.value.scrollLeft - (e.clientX - panStart.value.x)
  container.scrollTop  = panStart.value.scrollTop  - (e.clientY - panStart.value.y)
}

function stopPan() {
  isPanning.value = false
}

watch(() => [props.result, props.visibleLayers, zoom.value], () => {
  nextTick(draw)
}, { deep: false })

onMounted(draw)
</script>

<template>
  <div class="relative w-full h-full flex flex-col select-none">
    <!-- Zoom controls -->
    <div v-if="result" class="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-slate-700">
      <span class="text-slate-500 text-xs">縮放：</span>
      <button
        class="text-slate-400 hover:text-slate-200 w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700"
        @click="changeZoom(-0.5)"
      >－</button>
      <input
        type="range"
        :min="MIN_ZOOM"
        :max="MAX_ZOOM"
        :step="0.1"
        :value="zoom"
        class="w-28 accent-green-500"
        @input="zoom = parseFloat(($event.target as HTMLInputElement).value)"
      />
      <button
        class="text-slate-400 hover:text-slate-200 w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700"
        @click="changeZoom(0.5)"
      >＋</button>
      <span class="text-slate-400 text-xs w-10 text-center">{{ Math.round(zoom * 100) }}%</span>
      <button
        class="text-slate-500 hover:text-slate-300 text-xs px-2 py-0.5 rounded border border-slate-700 hover:border-slate-500"
        @click="zoom = 1"
      >重設</button>
      <span class="text-slate-600 text-xs ml-auto">拖曳移動畫面</span>
    </div>

    <!-- Canvas scroll area -->
    <div
      ref="scrollRef"
      class="flex-1 overflow-auto p-4"
      :class="isPanning ? 'cursor-grabbing' : (result ? 'cursor-grab' : '')"
      @wheel.prevent="onWheel"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="stopPan"
      @mouseleave="stopPan"
    >
      <div v-if="result" class="inline-block">
        <canvas
          ref="canvasRef"
          style="image-rendering: pixelated; display: block; pointer-events: none;"
        />
      </div>

      <div v-else class="flex flex-col items-center justify-center h-full text-slate-500 pt-20">
        <div class="text-5xl mb-3">⛏️</div>
        <p>上傳圖片並點擊「轉換」後，這裡將顯示 2D 預覽</p>
      </div>
    </div>

    <!-- Dimension hint -->
    <div v-if="result" class="flex-shrink-0 text-center text-slate-600 text-xs py-1 border-t border-slate-700">
      {{ result.width }} × {{ result.height }} 格
    </div>
  </div>
</template>
