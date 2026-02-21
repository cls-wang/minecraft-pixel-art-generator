<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { ConversionResult } from '../types'
import { BLOCK_MAP } from '../data/blocks'

const props = defineProps<{
  result: ConversionResult | null
  activeRow: number | null // null = show all, pixel y coord = highlight that row
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const tooltip = ref({ visible: false, text: '', x: 0, y: 0 })

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.OrthographicCamera | null = null
let controls: OrbitControls | null = null
let animFrameId: number | null = null
let blockMeshes: THREE.Mesh[] = []
let raycaster: THREE.Raycaster | null = null
let mouse: THREE.Vector2 | null = null

const BLOCK_SIZE = 1

function shadeColor(r: number, g: number, b: number, factor: number): number {
  return new THREE.Color(
    (r / 255) * factor,
    (g / 255) * factor,
    (b / 255) * factor
  ).getHex()
}

function createBlockGeometry(): THREE.BufferGeometry {
  return new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
}

function buildScene(result: ConversionResult) {
  if (!scene) return

  // Remove old meshes
  for (const mesh of blockMeshes) {
    scene.remove(mesh)
    mesh.geometry.dispose()
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(m => m.dispose())
    } else {
      mesh.material.dispose()
    }
  }
  blockMeshes = []

  const { pixels, width, height } = result

  const geo = createBlockGeometry()

  for (const px of pixels) {
    const block = BLOCK_MAP.get(px.blockId)
    if (!block) continue

    const { r, g, b } = block.color
    const isActive = props.activeRow === null || px.y === props.activeRow
    const factor = isActive ? 1.0 : 0.15

    const materials = [
      new THREE.MeshBasicMaterial({ color: shadeColor(r, g, b, 0.96 * factor) }), // +X right
      new THREE.MeshBasicMaterial({ color: shadeColor(r, g, b, 0.88 * factor) }), // -X left
      new THREE.MeshBasicMaterial({ color: shadeColor(r, g, b, 1.0  * factor) }), // +Y top
      new THREE.MeshBasicMaterial({ color: shadeColor(r, g, b, 0.80 * factor) }), // -Y bottom
      new THREE.MeshBasicMaterial({ color: shadeColor(r, g, b, 0.93 * factor) }), // +Z front
      new THREE.MeshBasicMaterial({ color: shadeColor(r, g, b, 0.85 * factor) }), // -Z back
    ]

    const mesh = new THREE.Mesh(geo, materials)
    mesh.position.set(
      px.x - width / 2,
      0,
      px.y - height / 2
    )
    mesh.userData = { blockId: px.blockId, x: px.x, y: px.y }
    scene.add(mesh)
    blockMeshes.push(mesh)
  }

  fitCamera(width, height)
}

// Update visibility/brightness without rebuilding entire scene
function applyActiveRow() {
  for (const mesh of blockMeshes) {
    const { y, blockId } = mesh.userData as { y: number; blockId: string }
    const block = BLOCK_MAP.get(blockId)
    if (!block) continue

    const { r, g, b } = block.color
    const isActive = props.activeRow === null || y === props.activeRow
    const factor = isActive ? 1.0 : 0.15

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    const factors = [0.96, 0.88, 1.0, 0.80, 0.93, 0.85]
    mats.forEach((mat, i) => {
      if (mat instanceof THREE.MeshBasicMaterial) {
        mat.color.setHex(shadeColor(r, g, b, factors[i]! * factor))
      }
    })
  }
}

function fitCamera(width: number, height: number) {
  if (!camera || !controls) return
  const size = Math.max(width, height) * 0.65
  camera.left = -size
  camera.right = size
  camera.top = size * 0.75
  camera.bottom = -size * 0.75
  camera.updateProjectionMatrix()
  controls.target.set(0, 0, 0)
  controls.update()
}

function initThree() {
  const container = containerRef.value
  if (!container) return

  const w = container.clientWidth
  const h = container.clientHeight

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a2e)

  const aspect = w / h
  camera = new THREE.OrthographicCamera(-50 * aspect, 50 * aspect, 50, -50, -1000, 1000)
  camera.position.set(60, 60, 60)
  camera.lookAt(0, 0, 0)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = true
  controls.enableZoom = true
  controls.zoomSpeed = 1.5
  controls.rotateSpeed = 0.6

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  const animate = () => {
    animFrameId = requestAnimationFrame(animate)
    controls!.update()
    renderer!.render(scene!, camera!)
  }
  animate()

  const ro = new ResizeObserver(() => {
    if (!container || !renderer || !camera) return
    const w2 = container.clientWidth
    const h2 = container.clientHeight
    renderer.setSize(w2, h2)
    const asp = w2 / h2
    camera.left = camera.top * -asp
    camera.right = camera.top * asp
    camera.updateProjectionMatrix()
  })
  ro.observe(container)
}

function onMouseMove(e: MouseEvent) {
  const container = containerRef.value
  if (!container || !raycaster || !mouse || !camera || !scene) return

  const rect = container.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const visibleMeshes = blockMeshes.filter(m => {
    const { y } = m.userData as { y: number }
    return props.activeRow === null || y === props.activeRow
  })
  const intersects = raycaster.intersectObjects(visibleMeshes)

  if (intersects.length > 0) {
    const obj = intersects[0]!.object
    const { blockId, x, y } = obj.userData as { blockId: string; x: number; y: number }
    const block = BLOCK_MAP.get(blockId)
    tooltip.value = {
      visible: true,
      text: `${block?.name ?? blockId} (${x}, ${y})`,
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top - 8,
    }
  } else {
    tooltip.value.visible = false
  }
}

watch(() => props.result, (result) => {
  if (result) buildScene(result)
})

// When only activeRow changes (not the result), just recolor — much faster
watch(() => props.activeRow, () => {
  applyActiveRow()
})

onMounted(() => {
  initThree()
  if (props.result) buildScene(props.result)
})

onUnmounted(() => {
  if (animFrameId !== null) cancelAnimationFrame(animFrameId)
  renderer?.dispose()
})
</script>

<template>
  <div class="relative w-full h-full min-h-[400px]">
    <div
      ref="containerRef"
      class="w-full h-full rounded-xl overflow-hidden"
      @mousemove="onMouseMove"
      @mouseleave="tooltip.visible = false"
    />

    <div
      v-if="!result"
      class="absolute inset-0 flex flex-col items-center justify-center text-slate-500 pointer-events-none"
    >
      <div class="text-5xl mb-3">⛏️</div>
      <p>上傳圖片並點擊「轉換」後，這裡將顯示 3D 預覽</p>
    </div>

    <div
      v-if="tooltip.visible"
      class="absolute pointer-events-none bg-slate-900/90 text-slate-200 text-xs px-2 py-1 rounded border border-slate-600 whitespace-nowrap z-10"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      {{ tooltip.text }}
    </div>

    <div
      v-if="result"
      class="absolute bottom-2 right-2 text-slate-500 text-xs bg-slate-900/70 px-2 py-1 rounded pointer-events-none"
    >
      拖曳旋轉 · 滾輪縮放
    </div>
  </div>
</template>
