<template>
  <div class="signature-pad">
    <canvas
      ref="canvasRef"
      :width="width"
      :height="height"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="stopDrawing"
    />
    <div class="signature-actions">
      <el-button size="small" @click="clear">清除</el-button>
      <el-button size="small" type="primary" @click="save">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  modelValue?: string
  width?: number
  height?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const canvasRef = ref<HTMLCanvasElement>()
const isDrawing = ref(false)
let ctx: CanvasRenderingContext2D | null = null

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
    }

    // 加载已有签名
    if (props.modelValue) {
      const img = new Image()
      img.onload = () => {
        ctx?.drawImage(img, 0, 0)
      }
      img.src = props.modelValue
    }
  }
})

const getPos = (e: MouseEvent | TouchEvent) => {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  
  if (e instanceof MouseEvent) {
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  } else {
    const touch = e.touches[0] || e.changedTouches[0]
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    }
  }
}

const startDrawing = (e: MouseEvent) => {
  isDrawing.value = true
  const pos = getPos(e)
  ctx?.beginPath()
  ctx?.moveTo(pos.x, pos.y)
}

const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !ctx) return
  const pos = getPos(e)
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
}

const stopDrawing = () => {
  isDrawing.value = false
  ctx?.closePath()
}

const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault()
  startDrawing(e as any)
}

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault()
  draw(e as any)
}

const clear = () => {
  if (ctx && canvasRef.value) {
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    emit('update:modelValue', '')
  }
}

const save = () => {
  if (canvasRef.value) {
    const dataUrl = canvasRef.value.toDataURL('image/png')
    emit('update:modelValue', dataUrl)
  }
}
</script>

<style scoped lang="scss">
.signature-pad {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  background: #fff;

  canvas {
    border: 1px dashed #c0c4cc;
    cursor: crosshair;
    display: block;
  }

  .signature-actions {
    margin-top: 10px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
}
</style>
