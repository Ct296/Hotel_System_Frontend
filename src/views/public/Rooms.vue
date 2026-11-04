<template>
  <div class="bg-body-tertiary min-vh-100 py-5" style="padding-bottom: 100px !important;">
    <div class="container">
      <div class="text-center mb-5 mt-4">
        <span class="badge text-dark rounded-pill px-3 py-2 mb-3 tracking-wider text-uppercase" style="background-color: #f8e5c2;">Lựa chọn</span>
        <h2 class="fw-bold text-body-emphasis text-uppercase font-serif display-6">Danh sách phòng</h2>
        <div class="mx-auto mt-3" style="width: 60px; height: 3px; background-color: #212529;"></div>
      </div>
      
      <!-- THANH CHỌN THỜI GIAN NHẬN/TRẢ PHÒNG & HÌNH THỨC THUÊ -->
      <div class="bg-body p-4 rounded-4 shadow-sm border border-secondary-subtle mb-4 mx-0">
        <!-- CHỌN HÌNH THỨC THUÊ (GIAO DIỆN TAB XANH BIỂN) -->
        <div class="d-flex justify-content-center gap-5 mb-4 border-bottom border-secondary-subtle">
          <div 
            class="rental-tab pb-2 cursor-pointer" 
            :class="rentalType === 'HOURLY' ? 'active-tab text-primary' : 'text-body-secondary'"
            @click="rentalType = 'HOURLY'; handleRentalTypeChange()"
          >
            <i class="fas fa-clock me-1"></i> Theo giờ
          </div>
          <div 
            class="rental-tab pb-2 cursor-pointer" 
            :class="rentalType === 'DAILY' ? 'active-tab text-primary' : 'text-body-secondary'"
            @click="rentalType = 'DAILY'; handleRentalTypeChange()"
          >
            <i class="fas fa-moon me-1"></i> Qua đêm / Ngày
          </div>
        </div>

        <div class="row align-items-end g-3">
          <!-- CHỌN SỐ ĐÊM NẾU LÀ DAILY -->
          <div class="col-md-3" v-if="rentalType === 'DAILY'">
            <label class="form-label fw-bold small text-body-secondary tracking-wider text-uppercase" style="font-size: 0.75rem;">Số đêm lưu trú</label>
            <input type="number" class="form-control border-0 shadow-none px-2 bg-body-tertiary fw-bold text-primary" min="1" v-model="numberOfNights" @change="handleNightsChange" required>
          </div>

          <!-- Giờ nhận phòng -->
          <div :class="rentalType === 'DAILY' ? 'col-md-3' : 'col-md-5'">
            <label class="form-label fw-bold small text-body-secondary tracking-wider text-uppercase" style="font-size: 0.75rem;">
              Giờ nhận <span v-if="rentalType === 'DAILY'" class="text-primary text-lowercase fw-normal">(Từ 14:00)</span>
            </label>
            
            <!-- Giao diện ghép thêm đuôi 14:00 khi chọn DAILY -->
            <<div v-if="rentalType === 'DAILY'"
     class="input-group shadow-none flex-nowrap">

    <input type="date"
           class="form-control border-0 shadow-none px-2 bg-body-tertiary fw-bold text-primary"
           style="min-width: 0;"
           v-model="dailyCheckInDate"
           @change="handleDailyCheckInChange"
           required>

    <span class="input-group-text border-0 bg-body-tertiary text-primary fw-bold px-2 flex-shrink-0">
        14:00
    </span>
</div>

            <!-- Giao diện bình thường khi chọn HOURLY -->
            <input v-else type="datetime-local" class="form-control border-0 shadow-none px-2 bg-body-tertiary fw-bold text-primary" 
                   v-model="checkInDate" @change="applyTimeFilter" required>
          </div>

          <!-- Giờ trả phòng -->
          <div :class="rentalType === 'DAILY' ? 'col-md-4' : 'col-md-5'">
            <label class="form-label fw-bold small text-body-secondary tracking-wider text-uppercase" style="font-size: 0.75rem;">
              Giờ trả <span v-if="rentalType === 'DAILY'" class="text-danger text-lowercase fw-normal">(Lúc 12:00)</span>
            </label>
            <input v-if="rentalType === 'DAILY'" type="datetime-local" class="form-control border-0 shadow-none px-2 bg-body-secondary fw-bold text-danger" 
                   v-model="checkOutDate" readonly required>
            <input v-else type="datetime-local" class="form-control border-0 shadow-none px-2 bg-body-tertiary fw-bold text-danger" 
                   v-model="checkOutDate" @change="applyTimeFilter" required>
          </div>

          <!-- Nút Kiểm tra -->
          <div class="col-md-2">
            <button @click="applyTimeFilter" class="btn btn-dark w-100 fw-bold shadow-sm py-2 text-uppercase tracking-wider">
              <i class="fas fa-search me-2"></i> Kiểm tra
            </button>
          </div>
        </div>
      </div>

      <!-- THANH TÌM KIẾM, LỌC & SẮP XẾP -->
      <div class="row mb-5 align-items-center bg-body p-3 rounded-4 shadow-sm border border-secondary-subtle mx-0">
        <div class="col-md-4 mb-3 mb-md-0">
          <div class="input-group">
            <span class="input-group-text bg-body-tertiary border-0"><i class="fas fa-search text-body-secondary"></i></span>
            <input type="text" v-model="searchQuery" class="form-control border-0 bg-body-tertiary text-body fw-semibold" placeholder="Tên phòng, loại phòng...">
          </div>
        </div>
        <div class="col-md-4 mb-3 mb-md-0">
          <div class="input-group border-start border-end border-secondary-subtle px-2">
            <span class="input-group-text bg-body-tertiary border-0"><i class="fas fa-user-friends text-body-secondary"></i></span>
            <select v-model="filterAdults" class="form-select bg-body-tertiary border-0 text-body fw-semibold shadow-none">
              <option value="0">Mọi sức chứa</option>
              <option value="1">Từ 1 Khách</option>
              <option value="2">Từ 2 Khách</option>
              <option value="4">Từ 4 Khách</option>
              <option value="6">Từ 6 Khách</option>
            </select>
          </div>
        </div>
        <div class="col-md-4">
          <div class="input-group px-2">
            <span class="input-group-text bg-body-tertiary border-0"><i class="fas fa-sort text-body-secondary"></i></span>
            <select v-model="sortOption" class="form-select bg-body-tertiary border-0 text-body fw-semibold shadow-none">
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
        <div class="spinner-border text-dark" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="mt-3 text-body-secondary fw-bold tracking-wider text-uppercase small">Đang tìm kiếm phòng trống...</p>
      </div>
      
      <!-- Báo lỗi API -->
      <div v-else-if="errorMsg" class="alert alert-danger text-center shadow-sm rounded-4">
        <i class="fas fa-exclamation-triangle me-2"></i> {{ errorMsg }}
      </div>
      
      <!-- Lưới Danh sách phòng -->
      <div v-else class="row g-4">
        <div v-for="item in filteredAndSortedRooms" :key="item.id" class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm border-0 room-card overflow-hidden bg-body"
                :class="{'border-dark border-2 shadow': isSelected(item.id)}">
            
            <div class="position-relative overflow-hidden">
              <img :src="getImageUrl(item.images)" 
                   class="card-img-top room-img" 
                   style="height: 250px; object-fit: cover;" alt="Room Image" @error="handleImageError">
              <div v-if="isSelected(item.id)" class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center transition-all">
                <i class="fas fa-check-circle text-white" style="font-size: 3rem; text-shadow: 0 4px 12px rgba(0,0,0,0.5);"></i>
              </div>
            </div>
            
            <div class="card-body p-4 d-flex flex-column h-100">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="fw-bold text-body-emphasis mb-0 font-serif fs-4 text-truncate" style="max-width: 75%;">{{ item.roomType?.name || 'Phòng Tiêu Chuẩn' }}</h5>
                <span class="badge bg-body-tertiary text-body-emphasis border">P.{{ item.name || 'N/A' }}</span>
              </div>
              
              <!-- Thông số cơ bản -->
              <div class="d-flex flex-wrap gap-2 mb-3 mt-1">
                <span class="text-body-secondary small"><i class="fas fa-bed text-secondary me-1"></i>{{ item.roomType?.bed || '1 Giường' }}</span>
                <span class="text-body-secondary small border-start border-secondary-subtle ps-2"><i class="fas fa-vector-square text-secondary me-1"></i>{{ item.roomType?.area || 0 }}m&sup2;</span>
                <span class="text-body-secondary small border-start border-secondary-subtle ps-2"><i class="fas fa-user-friends text-secondary me-1"></i>{{ (item.roomType?.adultMax||0) + (item.roomType?.childrenMax||0) }} Khách</span>
              </div>
              
              <!-- Tiện ích phòng -->
              <div class="small text-body-secondary mb-2">
                <div v-if="item.roomType?.roomAmenities && item.roomType.roomAmenities.length > 0">
                  <span v-for="ra in item.roomType.roomAmenities.slice(0, 4)" :key="ra.amenity?.id" class="me-3 d-inline-block mb-1">
                    <i class="fas fa-check text-success me-1"></i> {{ ra.amenity?.name }}
                  </span>
                  <span v-if="item.roomType.roomAmenities.length > 4" class="fst-italic opacity-50">...</span>
                </div>
                <div v-else class="fst-italic opacity-50">Đang cập nhật tiện ích...</div>
              </div>

              <!-- Mô tả phòng -->
              <p class="small text-body-secondary mb-4 flex-grow-1 border-top border-secondary-subtle pt-2 mt-1">
                <i class="fas fa-info-circle text-primary me-1"></i> {{ item.roomType?.description || 'Không gian lưu trú tinh tế, tiện nghi, mang lại giấc ngủ ngon tuyệt đối.' }}
              </p>
              
              <!-- GIÁ & NÚT CHỌN -->
              <div class="mt-auto pt-3 border-top border-secondary-subtle">
                <div v-if="item.surchargeAmount && item.surchargeAmount !== 0" class="mb-2">
                  <span class="badge mb-2 px-2 py-1" :class="item.surchargeAmount < 0 ? 'bg-success' : 'bg-warning text-dark'">
                    <i class="fas fa-tag me-1"></i> {{ item.eventName }}
                  </span>
                  <div class="d-flex flex-column">
                    <span class="text-body-secondary text-decoration-line-through fw-semibold mb-2" style="font-size: 0.85rem;">
                      Gốc: {{ formatPrice(item.basePrice) }}/h | {{ formatPrice(getDailyPrice(item.roomType)) }}/đêm/22h
                    </span>
                    <div class="d-flex justify-content-between align-items-end mt-1">
                      <div class="d-flex flex-column">
                        <div class="mb-1">
                          <span class="text-danger fw-bold fs-4" style="letter-spacing: -1px;">{{ formatPrice(item.displayPrice) }}</span>
                          <span class="text-body-secondary ms-1 fw-semibold small">/ giờ</span>
                        </div>
                        <div>
                          <span class="text-danger fw-bold fs-5" style="letter-spacing: -1px;">{{ formatPrice(getDiscountedDailyPrice(item)) }}</span>
                          <span class="text-body-secondary ms-1 fw-semibold small">/ đêm/22h</span>
                        </div>
                      </div>
                      <button @click="toggleSelect(item)" 
                              class="btn btn-sm rounded-pill fw-bold px-4 py-2 shadow-sm transition-all mb-1"
                              :class="isSelected(item.id) ? 'btn-danger' : 'btn-dark'">
                        <i :class="isSelected(item.id) ? 'fas fa-times' : 'fas fa-plus'"></i> 
                        {{ isSelected(item.id) ? 'Bỏ chọn' : 'Chọn' }}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div v-else class="d-flex justify-content-between align-items-end">
                  <div class="d-flex flex-column">
                    <div class="mb-1">
                      <span class="text-body-emphasis fw-bold fs-4" style="letter-spacing: -1px;">{{ formatPrice(item.displayPrice || item.basePrice) }}</span>
                      <span class="text-body-secondary ms-1 fw-semibold small">/ giờ</span>
                    </div>
                    <div>
                      <span class="text-body-emphasis fw-bold fs-5" style="letter-spacing: -1px;">{{ formatPrice(getDailyPrice(item.roomType)) }}</span>
                      <span class="text-body-secondary ms-1 fw-semibold small">/ đêm/22h</span>
                    </div>
                  </div>
                  <button @click="toggleSelect(item)" 
                          class="btn btn-sm rounded-pill fw-bold px-4 py-2 shadow-sm transition-all mb-1"
                          :class="isSelected(item.id) ? 'btn-danger' : 'btn-dark'">
                    <i :class="isSelected(item.id) ? 'fas fa-times' : 'fas fa-plus'"></i> 
                    {{ isSelected(item.id) ? 'Bỏ chọn' : 'Chọn' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Trạng thái khi không tìm thấy phòng -->
        <div v-if="filteredAndSortedRooms.length === 0 && !isLoading" class="col-12 text-center py-5 text-body-secondary">
          <div class="bg-body rounded-circle d-inline-flex justify-content-center align-items-center mb-3 shadow-sm" style="width: 80px; height: 80px;">
            <i class="fas fa-search-minus fs-2 opacity-50"></i>
          </div>
          <h5 class="fw-bold font-serif">Không tìm thấy phòng phù hợp!</h5>
          <p>Vui lòng thay đổi thời gian hoặc bộ lọc tìm kiếm.</p>
        </div>
      </div>
    </div>

    <!-- THANH BOTTOM BAR NỔI LÊN KHI CÓ PHÒNG ĐƯỢC CHỌN -->
    <div v-if="selectedRooms.length > 0" class="position-fixed bottom-0 start-0 w-100 bg-body shadow-lg border-top border-secondary-subtle py-3 px-3 slide-up" style="z-index: 1050;">
      <div class="container d-flex justify-content-between align-items-center">
        <div>
          <h5 class="mb-0 fw-bold text-body-emphasis font-serif">Đã chọn {{ selectedRooms.length }} phòng</h5>
          <small class="text-body-secondary d-none d-sm-block">Bạn có thể chọn thêm nhiều phòng khác.</small>
        </div>
        <button @click="proceedToBooking" class="btn btn-dark fw-bold px-4 py-2 rounded-3 text-uppercase tracking-wider shadow">
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

const searchQuery = ref('')
const filterAdults = ref('0')
const sortOption = ref('default')

// Biến cho hình thức thuê
const rentalType = ref('HOURLY')
const dailyCheckInDate = ref('')
const numberOfNights = ref(1)

const filteredAndSortedRooms = computed(() => {
  let result = rooms.value

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(r => 
        (r.name && r.name.toLowerCase().includes(q)) || 
        (r.roomType?.name && r.roomType.name.toLowerCase().includes(q))
    )
  }

  const minAdults = parseInt(filterAdults.value)
  if (minAdults > 0) {
    result = result.filter(r => (r.roomType?.adultMax || 0) >= minAdults)
  }

  if (sortOption.value === 'price_asc') {
    result = result.slice().sort((a, b) => (a.displayPrice || 0) - (b.displayPrice || 0))
  } else if (sortOption.value === 'price_desc') {
    result = result.slice().sort((a, b) => (b.displayPrice || 0) - (a.displayPrice || 0))
  } else if (sortOption.value === 'capacity_desc') {
    result = result.slice().sort((a, b) => (b.roomType?.adultMax || 0) - (a.roomType?.adultMax || 0))
  }

  return result
})

// Cấu hình URL Ảnh mặc định
const defaultRoomImage = 'https://api.ct296.id.vn/image/default_room.jpg'
const getImageUrl = (images) => {
  if (!images || images.length === 0) return defaultRoomImage
  const path = typeof images[0] === 'string' ? images[0] : images[0].imagePath
  return path.startsWith('http') ? path : `https://api.ct296.id.vn${path}`
}

const handleImageError = (e) => {
  e.target.src = defaultRoomImage
}

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ'

// Helper tính giá qua đêm
const getDailyPrice = (roomType) => roomType?.dailyPrice || (roomType?.basePrice * 22 || 0)
const getDiscountedDailyPrice = (item) => {
  const daily = getDailyPrice(item.roomType)
  if (!item.surchargeAmount) return daily
  return daily + (daily * (item.surchargeAmount / item.basePrice))
}

const isSelected = (roomId) => selectedRooms.value.some(r => r.id === roomId)

const toggleSelect = (room) => {
  const idx = selectedRooms.value.findIndex(r => r.id === room.id)
  if (idx > -1) {
    selectedRooms.value.splice(idx, 1) 
  } else {
    selectedRooms.value.push(room)
  }
}

// Hàm dùng chung để ép cứng giờ nhận (14:00) và giờ trả (12:00)
const applyDailyFixedTimes = () => {
  let datePartCheckIn = '';

  if (dailyCheckInDate.value) {
    datePartCheckIn = dailyCheckInDate.value;
  } else if (checkInDate.value) {
    datePartCheckIn = checkInDate.value.split('T')[0];
    dailyCheckInDate.value = datePartCheckIn; 
  } else {
    return;
  }
  
  // 1. Ép cứng giờ nhận phòng thành 14:00
  checkInDate.value = `${datePartCheckIn}T14:00`

  // 2. Tính ngày trả phòng dựa trên số đêm
  const ciDate = new Date(datePartCheckIn)
  ciDate.setDate(ciDate.getDate() + numberOfNights.value)
  
  const year = ciDate.getFullYear()
  const month = String(ciDate.getMonth() + 1).padStart(2, '0')
  const day = String(ciDate.getDate()).padStart(2, '0')
  const datePartCheckOut = `${year}-${month}-${day}`

  // 3. Ép cứng giờ trả phòng thành 12:00
  checkOutDate.value = `${datePartCheckOut}T12:00`
}

const handleDailyCheckInChange = () => {
  if (dailyCheckInDate.value) {
     applyDailyFixedTimes();
     fetchRooms();
  }
}

const handleRentalTypeChange = () => {
  if (rentalType.value === 'DAILY' && checkInDate.value) {
      applyDailyFixedTimes()
  }
  applyTimeFilter()
}

const handleNightsChange = () => {
  if (rentalType.value === 'DAILY' && checkInDate.value && numberOfNights.value > 0) {
      applyDailyFixedTimes()
      fetchRooms()
  }
}

const applyTimeFilter = () => {
  if (checkInDate.value && checkOutDate.value) {
    const ci = new Date(checkInDate.value)
    const co = new Date(checkOutDate.value)
    
    if (co <= ci) {
      errorMsg.value = 'Giờ trả phòng phải sau giờ nhận phòng!'
      return
    }
  }
  fetchRooms()
}

const fetchRooms = async () => {
  isLoading.value = true
  errorMsg.value = ''
  selectedRooms.value = [] 
  
  try {
    const params = new URLSearchParams()
    if (route.query.checkIn && !checkInDate.value) {
        checkInDate.value = route.query.checkIn.substring(0, 16)
    }
    if (route.query.checkOut && !checkOutDate.value) {
        checkOutDate.value = route.query.checkOut.substring(0, 16)
    }
    
    if (checkInDate.value) {
      let ci = checkInDate.value
      if (ci.length === 16) ci += ':00' 
      params.append('checkIn', ci)
    }
    if (checkOutDate.value) {
      let co = checkOutDate.value
      if (co.length === 16) co += ':00'
      params.append('checkOut', co)
    }
    if (route.query.typeId) {
        params.append('typeId', route.query.typeId)
    }

    const response = await api.get(`/api/public/rooms?${params.toString()}`)
    
    rooms.value = response.data.rooms || []
    
    // Chỉ cập nhật nếu chưa có dữ liệu để tránh ghi đè lúc người dùng đang chọn
    if (!checkInDate.value) checkInDate.value = response.data.checkIn ? response.data.checkIn.substring(0, 16) : ''
    if (!checkOutDate.value) checkOutDate.value = response.data.checkOut ? response.data.checkOut.substring(0, 16) : ''
    
    // Đồng bộ dailyCheckInDate nếu có checkInDate
    if (checkInDate.value && !dailyCheckInDate.value) {
      dailyCheckInDate.value = checkInDate.value.split('T')[0]
    }
    
  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Không thể lấy danh sách phòng lúc này. Vui lòng thử lại sau.'
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
      checkOut: checkOutDate.value,
      rentalType: rentalType.value // Truyền rentalType qua trang Booking
    } 
  })
}

watch(() => route.query, () => {
  fetchRooms()
})

onMounted(() => {
  // Lấy rentalType từ query nếu có (ví dụ từ trang chủ truyền qua)
  if (route.query.rentalType) {
    rentalType.value = route.query.rentalType;
  }
  fetchRooms()
})
</script>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}
.tracking-wider {
  letter-spacing: 1.5px;
}
.room-card {
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}
.room-img {
  transition: transform 0.6s ease;
}
.room-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
}
.room-card:hover .room-img {
  transform: scale(1.05);
}
[data-bs-theme="dark"] .room-card:hover {
  box-shadow: 0 20px 40px rgba(0,0,0,0.5) !important;
}
.object-fit-cover {
  object-fit: cover;
}
.transition-all {
  transition: all 0.3s ease-in-out;
}
.slide-up {
  animation: slideUp 0.3s ease-out;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.input-group-text {
  background-color: transparent !important;
}
.input-group .form-control:focus, .input-group .form-select:focus {
  box-shadow: none;
}

/* GIAO DIỆN TAB HÌNH THỨC THUÊ */
.rental-tab {
  font-size: 1.15rem;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;
}
.rental-tab:hover:not(.active-tab) {
  color: #0d6efd !important; /* Xanh biển */
  opacity: 0.8;
}
.rental-tab.active-tab {
  font-weight: 800;
}
.rental-tab.active-tab::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #0d6efd; /* Vạch gạch chân màu xanh biển */
  border-radius: 4px 4px 0 0;
}
.cursor-pointer {
  cursor: pointer;
}
</style>