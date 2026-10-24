<template>
  <div class="bg-light min-vh-100 py-5">
    <div class="container">
      <div class="text-center mb-5">
        <h2 class="fw-bold text-primary text-uppercase">Danh sách phòng</h2>
        <p class="text-muted">Lựa chọn không gian nghỉ dưỡng lý tưởng của bạn</p>
        <div class="mx-auto bg-warning mt-2" style="height: 3px; width: 60px;"></div>
      </div>

      <!-- Trạng thái Loading -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="mt-2 text-muted fw-semibold">Đang tải danh sách phòng...</p>
      </div>

      <!-- Trạng thái Lỗi -->
      <div v-else-if="errorMsg" class="alert alert-danger text-center shadow-sm">
        <i class="fas fa-exclamation-triangle me-2"></i> {{ errorMsg }}
      </div>

      <!-- Lưới Danh sách phòng -->
      <div v-else class="row g-4">
        <div v-for="item in rooms" :key="item.id" class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm border-0 room-card overflow-hidden">
            <!-- Ảnh phòng: Lấy chuỗi ảnh đầu tiên trong mảng images -->
            <img :src="(item.images && item.images.length > 0) ? item.images[0] : 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80'" 
                 class="card-img-top" alt="Room Image" style="height: 220px; object-fit: cover;">
            
            <div class="card-body d-flex flex-column">
              <!-- Tên loại phòng -->
              <h5 class="card-title fw-bold text-dark mb-1">
                {{ item.roomTypeName || 'Phòng Tiêu Chuẩn' }}
              </h5>
              
              <!-- Tên phòng (ví dụ: 101) -->
              <p class="text-muted small mb-3">
                <i class="fas fa-door-closed me-2 text-secondary"></i> {{ item.name || 'Đang cập nhật' }}
              </p>
              
              <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                <div>
                  <!-- Giá phòng: Trỏ vào displayPrice -->
                  <span class="text-primary fw-bold fs-5">
                    {{ formatPrice(item.displayPrice || 0) }}
                  </span>
                  <small class="text-muted">/đêm</small>
                </div>
                <button @click="bookRoom(item)" class="btn btn-primary btn-sm fw-bold px-4 rounded-pill shadow-sm hover-lift">
                  Đặt ngay
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Trường hợp Backend trả về mảng rỗng -->
        <div v-if="rooms.length === 0" class="col-12 text-center py-5 text-muted">
          <div class="bg-white rounded-circle d-inline-flex justify-content-center align-items-center mb-3 shadow-sm" style="width: 80px; height: 80px;">
            <i class="fas fa-box-open fs-2 text-secondary"></i>
          </div>
          <h5 class="fw-semibold">Hiện chưa có phòng nào trống!</h5>
          <p>Vui lòng quay lại sau nhé.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../utils/axios'

const router = useRouter()
const rooms = ref([])
const isLoading = ref(true)
const errorMsg = ref('')

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const fetchRooms = async () => {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const response = await api.get('/api/public/rooms') 
    // QUAN TRỌNG: Trỏ đúng vào mảng 'rooms' bên trong object response.data
    rooms.value = response.data.rooms || [] 
  } catch (error) {
    console.error('Lỗi lấy danh sách phòng:', error)
    errorMsg.value = 'Không thể tải danh sách phòng lúc này. Vui lòng thử lại sau.'
  } finally {
    isLoading.value = false
  }
}

const bookRoom = (item) => {
  router.push({ path: '/customer/booking', query: { roomId: item.id } })
}

onMounted(() => {
  fetchRooms()
})
</script>

<style scoped>
.room-card {
  transition: all 0.3s ease;
}
.room-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
}
.hover-lift {
  transition: transform 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
}
</style>