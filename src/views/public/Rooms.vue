<template>
  <div class="bg-light min-vh-100 py-5" style="padding-bottom: 100px !important;">
    <div class="container">
      <div class="text-center mb-5">
        <h2 class="fw-bold text-primary text-uppercase">Danh sách phòng</h2>
        <p class="text-muted">Lựa chọn không gian nghỉ dưỡng lý tưởng của bạn</p>
        <div class="mx-auto bg-warning mt-2" style="height: 3px; width: 60px;"></div>
      </div>
      
      <!-- THANH TÌM KIẾM, LỌC & SẮP XẾP -->
      <div class="row mb-4 align-items-center bg-white p-3 rounded-4 shadow-sm border mx-0">
        <!-- Tìm kiếm -->
        <div class="col-md-4 mb-3 mb-md-0">
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0"><i class="fas fa-search text-muted"></i></span>
            <input type="text" v-model="searchQuery" class="form-control border-start-0 bg-light" placeholder="Tìm tên phòng, loại phòng...">
          </div>
        </div>
        <!-- Lọc sức chứa -->
        <div class="col-md-4 mb-3 mb-md-0">
          <div class="input-group">
            <span class="input-group-text bg-light"><i class="fas fa-user-friends text-muted"></i></span>
            <select v-model="filterAdults" class="form-select bg-light">
              <option value="0">Mọi sức chứa</option>
              <option value="1">Từ 1 Người lớn</option>
              <option value="2">Từ 2 Người lớn</option>
              <option value="4">Từ 4 Người lớn</option>
              <option value="6">Từ 6 Người lớn</option>
            </select>
          </div>
        </div>
        <!-- Sắp xếp -->
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text bg-light"><i class="fas fa-sort text-muted"></i></span>
            <select v-model="sortOption" class="form-select bg-light">
              <option value="default">Sắp xếp mặc định</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="capacity_desc">Sức chứa lớn nhất</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Trạng thái Loading -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="mt-2 text-muted fw-semibold">Đang tìm kiếm phòng trống...</p>
      </div>
      
      <!-- Báo lỗi nếu API sập -->
      <div v-else-if="errorMsg" class="alert alert-danger text-center shadow-sm">
        <i class="fas fa-exclamation-triangle me-2"></i> {{ errorMsg }}
      </div>
      
      <!-- Lưới Danh sách phòng đã lọc -->
      <div v-else class="row g-4">
        <div v-for="item in filteredAndSortedRooms" :key="item.id" class="col-lg-6">
          <div class="card h-100 shadow-sm border-0 room-card overflow-hidden" 
               :class="{'border border-2 border-primary': isSelected(item.id)}">
            <div class="row g-0 h-100">
              <!-- Ảnh phòng -->
              <div class="col-sm-5 position-relative">
                <img :src="getImageUrl(item.images)" 
                     class="img-fluid rounded-start h-100 w-100 object-fit-cover" 
                     style="min-height: 200px;" alt="Room Image" @error="handleImageError">
                <div v-if="isSelected(item.id)" class="position-absolute top-0 start-0 w-100 h-100 bg-primary bg-opacity-25 d-flex justify-content-center align-items-center">
                  <i class="fas fa-check-circle text-white" style="font-size: 3rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3);"></i>
                </div>
              </div>
              
              <!-- Chi tiết phòng -->
              <div class="col-sm-7 d-flex flex-column">
                <div class="card-body p-3 d-flex flex-column h-100">
                  <div class="d-flex justify-content-between align-items-start mb-1">
                    <h5 class="fw-bold text-dark mb-0">{{ item.roomType?.name || 'Phòng Tiêu Chuẩn' }}</h5>
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle">P. {{ item.name || 'N/A' }}</span>
                  </div>
                  
                  <!-- Thông số cơ bản -->
                  <div class="d-flex flex-wrap gap-1 mb-2 mt-2">
                    <span class="badge bg-light text-dark border"><i class="fas fa-bed text-secondary me-1"></i>{{ item.roomType?.bed || '1 Giường' }}</span>
                    <span class="badge bg-light text-dark border"><i class="fas fa-vector-square text-secondary me-1"></i>{{ item.roomType?.area || 0 }}m&sup2;</span>
                    <span class="badge bg-light text-dark border"><i class="fas fa-user-friends text-secondary me-1"></i>{{ item.roomType?.adultMax }} NL, {{ item.roomType?.childrenMax }} TE</span>
                  </div>
                  
                  <!-- Tiện ích phòng -->
                  <div class="small text-muted mb-3">
                    <div v-if="item.roomType?.roomAmenities && item.roomType.roomAmenities.length > 0">
                      <span v-for="ra in item.roomType.roomAmenities" :key="ra.amenity?.id" class="me-2 d-inline-block mb-1">
                        <i class="fas fa-check text-success"></i> {{ ra.amenity?.name }}
                      </span>
                    </div>
                    <div v-else class="fst-italic">Đang cập nhật tiện ích...</div>
                  </div>
                  
                  <!-- Giá và Nút chọn -->
                  <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                    <div>
                      <span class="text-primary fw-bold fs-5">{{ formatPrice(item.displayPrice || 0) }}</span>
                      <small class="text-muted"> / giờ</small>
                    </div>
                    <button @click="toggleSelect(item)" 
                            class="btn btn-sm rounded-pill fw-bold px-3 shadow-sm transition-all"
                            :class="isSelected(item.id) ? 'btn-danger' : 'btn-outline-primary'">
                      <i :class="isSelected(item.id) ? 'fas fa-times' : 'fas fa-plus'"></i> 
                      {{ isSelected(item.id) ? 'Bỏ chọn' : 'Chọn' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
                 
        <!-- Trạng thái khi không tìm thấy phòng -->
        <div v-if="filteredAndSortedRooms.length === 0 && !isLoading" class="col-12 text-center py-5 text-muted">
          <div class="bg-white rounded-circle d-inline-flex justify-content-center align-items-center mb-3 shadow-sm" style="width: 80px; height: 80px;">
            <i class="fas fa-search-minus fs-2 text-secondary"></i>
          </div>
          <h5 class="fw-semibold">Không tìm thấy phòng phù hợp!</h5>
          <p>Vui lòng thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
        </div>
      </div>
    </div>

    <!-- THANH BOTTOM BAR NỔI LÊN KHI CÓ PHÒNG ĐƯỢC CHỌN -->
    <div v-if="selectedRooms.length > 0" class="position-fixed bottom-0 start-0 w-100 bg-white shadow-lg border-top py-3 px-3 slide-up" style="z-index: 1050;">
      <div class="container d-flex justify-content-between align-items-center">
        <div>
          <h5 class="mb-0 fw-bold text-primary">Đã chọn {{ selectedRooms.length }} phòng</h5>
          <small class="text-muted d-none d-sm-block">Bạn có thể tiếp tục chọn thêm phòng khác.</small>
        </div>
        <button @click="proceedToBooking" class="btn btn-success fw-bold px-4 py-2 rounded-pill shadow">
          Tiếp tục Đặt phòng <i class="fas fa-arrow-right ms-2"></i>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../utils/axios'

const route = useRoute()
const router = useRouter()

const rooms = ref([]) 
const selectedRooms = ref([]) 
const checkInDate = ref('')
const checkOutDate = ref('')
const isLoading = ref(true)
const errorMsg = ref('')

// Các biến cho bộ lọc và tìm kiếm
const searchQuery = ref('')
const filterAdults = ref('0')
const sortOption = ref('default')

// LOGIC COMPUTED: Tự động tính toán lại danh sách hiển thị khi có thay đổi
const filteredAndSortedRooms = computed(() => {
  let result = rooms.value

  // 1. Tìm kiếm (Text Search)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(r => 
      (r.name && r.name.toLowerCase().includes(q)) || 
      (r.roomType?.name && r.roomType.name.toLowerCase().includes(q))
    )
  }

  // 2. Lọc (Filter)
  const minAdults = parseInt(filterAdults.value)
  if (minAdults > 0) {
    result = result.filter(r => (r.roomType?.adultMax || 0) >= minAdults)
  }

  // 3. Sắp xếp (Sort)
  if (sortOption.value === 'price_asc') {
    result = result.slice().sort((a, b) => (a.displayPrice || 0) - (b.displayPrice || 0))
  } else if (sortOption.value === 'price_desc') {
    result = result.slice().sort((a, b) => (b.displayPrice || 0) - (a.displayPrice || 0))
  } else if (sortOption.value === 'capacity_desc') {
    result = result.slice().sort((a, b) => (b.roomType?.adultMax || 0) - (a.roomType?.adultMax || 0))
  }

  return result
})

const getImageUrl = (images) => {
  if (!images || images.length === 0) return 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80'
  const path = images[0]
  return path.startsWith('http') ? path : `https://api.ct296.id.vn${path}`
}

const handleImageError = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80'
}

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0) + ' đ'

const isSelected = (roomId) => selectedRooms.value.some(r => r.id === roomId)

const toggleSelect = (room) => {
  const idx = selectedRooms.value.findIndex(r => r.id === room.id)
  if (idx > -1) {
    selectedRooms.value.splice(idx, 1) 
  } else {
    selectedRooms.value.push(room) 
  }
}

const fetchRooms = async () => {
  isLoading.value = true
  errorMsg.value = ''
  selectedRooms.value = [] 
  
  try {
    const params = new URLSearchParams()
    if (route.query.checkIn) {
        let ci = route.query.checkIn
        if (ci.length === 16) ci += ':00' 
        params.append('checkIn', ci)
    }
    if (route.query.checkOut) {
        let co = route.query.checkOut
        if (co.length === 16) co += ':00'
        params.append('checkOut', co)
    }
    if (route.query.typeId) {
        params.append('typeId', route.query.typeId)
    }

    const response = await api.get(`/api/public/rooms?${params.toString()}`)
    
    rooms.value = response.data.rooms || []
    checkInDate.value = response.data.checkIn
    checkOutDate.value = response.data.checkOut
    
  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Không thể tải danh sách phòng lúc này. Vui lòng thử lại sau.'
  } finally {
    isLoading.value = false
  }
}

const proceedToBooking = () => {
  if (selectedRooms.value.length === 0) return
  const roomIds = selectedRooms.value.map(r => r.id)
  router.push({ 
    path: '/customer/booking', 
    query: { 
      roomId: roomIds, 
      checkIn: checkInDate.value, 
      checkOut: checkOutDate.value 
    } 
  })
}

watch(() => route.query, () => {
  fetchRooms()
})

onMounted(() => {
  fetchRooms()
})
</script>

<style scoped>
.room-card {
  transition: all 0.3s ease;
}
.room-card:hover {
  box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
}
.object-fit-cover {
  object-fit: cover;
}
.transition-all {
  transition: all 0.2s ease-in-out;
}
.slide-up {
  animation: slideUp 0.3s ease-out;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.input-group-text {
  border-right: none;
}
.input-group .form-control, .input-group .form-select {
  border-left: none;
}
.input-group .form-control:focus, .input-group .form-select:focus {
  border-color: #dee2e6;
  box-shadow: none;
}
</style>