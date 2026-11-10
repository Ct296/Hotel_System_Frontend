export const BACKEND_BASE_URL = 'https://api.ct296.id.vn'

export const DEFAULT_IMAGES = {
  ROOM: `${BACKEND_BASE_URL}/image/default_room.jpg`,
  SERVICE: `${BACKEND_BASE_URL}/image/default_service.jpg`,
  AVATAR: `${BACKEND_BASE_URL}/image/default_avatar_customer.jpg`,
  PLACEHOLDER: 'https://placehold.co/100x100?text=No+Image'
}

// 1. Định dạng tiền tệ (Mặc định có chữ 'đ', truyền false nếu chỉ lấy số như bên Manager)
export const formatPrice = (price, withSymbol = true) => {
  const formatted = new Intl.NumberFormat('vi-VN').format(price || 0)
  return withSymbol ? `${formatted} đ` : formatted
}

export const formatShortPrice = (price) => {
  if (!price) return 0
  if (price >= 1_000_000_000) return (price / 1_000_000_000).toFixed(1) + ' Tỷ'
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(1) + ' Tr'
  if (price >= 1_000) return (price / 1_000).toFixed(1) + ' K'
  return price
}

// 2. Định dạng ngày giờ chuẩn 24h
export const formatDate = (val, fallback = '') => {
  if (!val) return fallback
  return new Date(val).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

export const formatTime = (val, fallback = '') => {
  if (!val) return fallback
  return new Date(val).toLocaleTimeString('vi-VN', {
    hour: '2-digit', minute: '2-digit', hour12: false
  })
}

export const formatDateTime = (val, includeYear = true, fallback = '') => {
  if (!val) return fallback
  const options = {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }
  if (includeYear) options.year = 'numeric'
  return new Date(val).toLocaleString('vi-VN', options)
}

// 3. Xử lý đường dẫn ảnh & ảnh lỗi
export const resolveImageUrl = (itemOrPath, fallback = DEFAULT_IMAGES.ROOM) => {
  if (!itemOrPath) return fallback
  const path = typeof itemOrPath === 'string'
    ? itemOrPath
    : (itemOrPath.imagePath || itemOrPath.url || itemOrPath.path)
  if (!path || !path.trim()) return fallback
  return path.startsWith('http') ? path : `${BACKEND_BASE_URL}${path.trim()}`
}

export const handleImageError = (e, fallback = DEFAULT_IMAGES.ROOM) => {
  if (e?.target && e.target.src !== fallback) {
    e.target.src = fallback
  }
}

// 4. Tính giá phòng qua đêm (Dùng chung cho Home.vue, Rooms.vue, Booking.vue)
export const getDailyPrice = (roomType) => {
  if (!roomType) return 0
  return roomType.dailyPrice || ((roomType.basePrice || 0) * 22)
}

export const getDiscountedDailyPrice = (item) => {
  if (!item) return 0
  const roomType = item.roomType || item // Hỗ trợ truyền vào RoomCard hoặc RoomType
  const daily = getDailyPrice(roomType)
  if (!item.surchargeAmount || !item.basePrice) return daily
  return daily + (daily * (item.surchargeAmount / item.basePrice))
}