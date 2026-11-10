import { ref } from 'vue'
import { resolveImageUrl, DEFAULT_IMAGES } from '../utils/formatters'

export function useRoomImageSlider() {
  const activeImageIndex = ref({})

  const getImageList = (item) => {
    if (!item?.images || item.images.length === 0) {
      return [DEFAULT_IMAGES.ROOM]
    }
    return item.images.map(img => resolveImageUrl(img, DEFAULT_IMAGES.ROOM))
  }

  const getCurrentImage = (item) => {
    if (!item) return DEFAULT_IMAGES.ROOM
    const list = getImageList(item)
    const idx = activeImageIndex.value[item.id] || 0
    return list[idx] || DEFAULT_IMAGES.ROOM
  }

  const prevImage = (item) => {
    const list = getImageList(item)
    if (list.length <= 1) return
    const current = activeImageIndex.value[item.id] || 0
    activeImageIndex.value[item.id] = (current - 1 + list.length) % list.length
  }

  const nextImage = (item) => {
    const list = getImageList(item)
    if (list.length <= 1) return
    const current = activeImageIndex.value[item.id] || 0
    activeImageIndex.value[item.id] = (current + 1) % list.length
  }

  return {
    activeImageIndex,
    getImageList,
    getCurrentImage,
    prevImage,
    nextImage
  }
}