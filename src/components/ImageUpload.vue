<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  upload: [dataUrl: string, file: File]
}>()

const isDragging = ref(false)
const error = ref('')

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

function handleFile(file: File) {
  error.value = ''
  if (!ACCEPTED_TYPES.includes(file.type)) {
    error.value = '不支援的檔案格式，請上傳 PNG、JPG、GIF 或 WebP'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result
    if (typeof result === 'string') {
      emit('upload', result, file)
    }
  }
  reader.readAsDataURL(file)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}

function onFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handleFile(file)
  input.value = ''
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}
</script>

<template>
  <div
    class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
    :class="isDragging
      ? 'border-green-400 bg-green-400/10'
      : 'border-slate-600 hover:border-slate-400 bg-slate-800/50'"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
    @click="($refs.fileInput as HTMLInputElement).click()"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/png,image/jpeg,image/gif,image/webp"
      class="hidden"
      @change="onFileInput"
    />

    <div class="flex flex-col items-center gap-3">
      <div class="text-4xl">🖼️</div>
      <p class="text-slate-300 font-medium">拖放圖片到這裡，或點擊選擇</p>
      <p class="text-slate-500 text-sm">支援 PNG（含透明）、JPG、GIF、WebP</p>
      <p class="text-slate-500 text-xs">PNG 帶透明通道時，透明區域不產生方塊</p>
    </div>

    <p v-if="error" class="mt-3 text-red-400 text-sm">{{ error }}</p>
  </div>
</template>
