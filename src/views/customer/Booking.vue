<template>
  <div class="container my-5">
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-body-secondary fw-semibold">Đang tính toán chi phí...</p>
    </div>
    
    <div v-else-if="errorMsg" class="alert alert-danger shadow-sm text-center">
      <i class="fas fa-exclamation-triangle me-2"></i> {{ errorMsg }}
      <div class="mt-3">
        <router-link to="/rooms" class="btn btn-outline-danger btn-sm">Quay lại chọn phòng</router-link>
      </div>
    </div>
    
    <div v-else class="row g-4">
      <div class="col-12 mb-2">
        <h2 class="fw-bold text-primary"><i class="fas fa-clipboard-check me-2"></i> Xác nhận đặt phòng</h2>
        <p class="text-body-secondary mb-0">Hệ thống sẽ tính tiền theo giờ hoặc qua đêm tùy lựa chọn.</p>
      </div>
      
      <!-- CỘT TRÁI: DANH SÁCH PHÒNG ĐÃ CHỌN (ĐÃ LẤP ĐẦY THÔNG TIN & THÊM SLIDER ẢNH) -->
      <div class="col-lg-5">
        <h5 class="fw-bold mb-3 border-bottom pb-2 text-body-emphasis">Các phòng đã chọn ({{ bookingData.rooms?.length || 0 }})</h5>
        
        <div class="d-flex flex-column gap-3 mb-4" style="max-height: 680px; overflow-y: auto;">
          <div class="card shadow-sm border-0 bg-body-tertiary overflow-hidden rounded-4" v-for="room in bookingData.rooms" :key="room.id">
            <div class="row g-0 align-items-stretch">
              <!-- Cột ảnh kèm nút chuyển ảnh -->
              <div class="col-sm-5 position-relative room-slider-container" style="min-height: 210px;">
                <img :src="getCurrentRoomImage(room)" class="w-100 h-100 object-fit-cover" alt="Room" @error="handleImageError">
                
                <template v-if="getRoomImageList(room).length > 1">
                  <button type="button" class="slider-btn slider-btn-prev" @click.stop.prevent="prevRoomImage(room)" title="Ảnh trước">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <button type="button" class="slider-btn slider-btn-next" @click.stop.prevent="nextRoomImage(room)" title="Ảnh tiếp">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                  <span class="slider-counter badge bg-dark bg-opacity-75 rounded-pill px-2 py-1">
                    {{ (activeImageIndex[room.id] || 0) + 1 }}/{{ getRoomImageList(room).length }}
                  </span>
                </template>
              </div>

              <!-- Cột thông tin chi tiết lấp đầy khoảng trống -->
              <div class="col-sm-7">
                <div class="card-body p-3 d-flex flex-column h-100 justify-content-between">
                  <div>
                    <!-- Header: Tên phòng + Hạng phòng + Vị trí -->
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 class="fw-bold mb-0 text-primary fs-5">Phòng {{ room.name }}</h6>
                        <span class="badge bg-primary text-white mt-1">{{ room.roomType?.name }}</span>
                      </div>
                      <span v-if="room.location" class="badge bg-body text-body-secondary border border-secondary-subtle">
                        <i class="fas fa-map-marker-alt text-danger me-1"></i>{{ room.location }}
                      </span>
                    </div>

                    <!-- Lưới 2 cột thông số: Người lớn/Trẻ em, Diện tích, Giường -->
                    <div class="row g-1 small text-body-secondary mb-2 bg-body p-2 rounded-3 border border-secondary-subtle">
                      <div class="col-12 mb-1">
                        <i class="fas fa-user-friends text-primary me-1"></i>
                        Sức chứa: <strong class="text-body-emphasis">{{ room.roomType?.adultMax || 0 }} Người lớn, {{ room.roomType?.childrenMax || 0 }} Trẻ em</strong>
                      </div>
                      <div class="col-6">
                        <i class="fas fa-ruler-combined text-secondary me-1"></i> {{ room.roomType?.area }} m&sup2;
                      </div>
                      <div class="col-6 text-truncate" :title="room.roomType?.bed">
                        <i class="fas fa-bed text-secondary me-1"></i> {{ room.roomType?.bed || '1 Giường' }}
                      </div>
                    </div>

                    <!-- HIỂN THỊ TIỆN ÍCH -->
                    <div class="small text-body-secondary mb-2" v-if="room.roomType?.roomAmenities && room.roomType.roomAmenities.length > 0">
                      <div class="d-flex flex-wrap gap-1">
                        <span v-for="ra in room.roomType.roomAmenities" :key="ra.amenity?.id" class="badge bg-body text-body-emphasis border border-secondary-subtle fw-normal">
                          <i class="fas fa-check text-success me-1"></i>{{ ra.amenity?.name }}
                        </span>
                      </div>
                    </div>

                    <!-- Mô tả ngắn -->
                    <p v-if="room.roomType?.description" class="small text-body-secondary fst-italic mb-2 text-truncate" :title="room.roomType.description">
                      "{{ room.roomType.description }}"
                    </p>
                  </div>

                  <!-- Chân thẻ: Giá phòng & Cọc -->
                  <div class="pt-2 border-top border-secondary-subtle d-flex justify-content-between align-items-end">
                    <div class="small">
                      <div class="fw-bold text-body-emphasis">{{ formatPrice(room.roomType?.basePrice) }}<span class="fw-normal text-body-secondary">/giờ</span></div>
                      <div class="fw-semibold text-primary" style="font-size: 0.78rem;">{{ formatPrice(room.roomType?.dailyPrice || (room.roomType?.basePrice * 22)) }}<span class="fw-normal text-body-secondary">/đêm</span></div>
                    </div>
                    <span class="badge bg-danger-subtle text-danger border border-danger-subtle">
                      Cần cọc: {{ room.roomType?.depositPercent }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="alert alert-warning small shadow-sm text-dark">
          <i class="fas fa-clock me-2"></i> Hệ thống sẽ giữ phòng trong <strong>15 phút</strong> để bạn thanh toán tiền cọc.
        </div>
      </div>
      
      <!-- CỘT PHẢI: FORM THÔNG TIN & TÍNH TIỀN -->
      <div class="col-lg-7">
        <div class="card shadow-sm border-0 p-4 bg-body-tertiary rounded-4">
          <h5 class="fw-bold mb-4 text-body-emphasis">Thông tin chuyến đi</h5>
          
          <div v-if="bookingData.conflictMessage" class="alert alert-danger small fw-bold">
            <i class="fas fa-triangle-exclamation me-2"></i> {{ bookingData.conflictMessage }}
          </div>
          
          <form @submit.prevent="submitBooking">
            <!-- CHỌN HÌNH THỨC THUÊ -->
            <div class="d-flex justify-content-center gap-5 mb-4 border-bottom border-secondary-subtle">
              <div 
                class="rental-tab pb-2 cursor-pointer" 
                :class="form.rentalType === 'HOURLY' ? 'active-tab text-primary' : 'text-body-secondary'"
                @click="form.rentalType = 'HOURLY'; handleRentalTypeChange()"
              >
                <i class="fas fa-clock me-1"></i> Theo giờ
              </div>
              <div 
                class="rental-tab pb-2 cursor-pointer" 
                :class="form.rentalType === 'DAILY' ? 'active-tab text-primary' : 'text-body-secondary'"
                @click="form.rentalType = 'DAILY'; handleRentalTypeChange()"
              >
                <i class="fas fa-moon me-1"></i> Qua đêm / Ngày
              </div>
            </div>

            <!-- CHẾ ĐỘ DAILY -->
            <div class="mb-4" v-if="form.rentalType === 'DAILY'">
              <label class="form-label fw-bold small text-body-secondary">Số đêm lưu trú</label>
              <input type="number" class="form-control bg-body fw-bold text-primary w-50" min="1" v-model="form.numberOfNights" @change="handleNightsChange" required>
            </div>

            <div class="row mb-3 g-3">
              <div class="col-md-6">
                <label class="form-label fw-bold small text-body-secondary">Giờ nhận phòng</label>
                <input v-if="form.rentalType === 'DAILY'" type="date" class="form-control fw-bold text-primary bg-body" 
                       v-model="dailyCheckInDate" @change="handleDailyCheckInChange" required>
                <input v-else type="datetime-local" class="form-control fw-bold text-primary bg-body" 
                       v-model="form.checkIn" @change="handleDateChange" required>
                <div v-if="form.rentalType === 'DAILY'" class="form-text small text-body-secondary mt-1">Giờ nhận phòng cố định vào 14:00. Bạn có thể chọn ngày khác.</div>
              </div>
              
              <div class="col-md-6">
                <label class="form-label fw-bold small text-body-secondary">Giờ trả phòng</label>
                <input v-if="form.rentalType === 'DAILY'" type="datetime-local" class="form-control fw-bold text-danger bg-body-secondary" 
                       v-model="form.checkOut" readonly required>
                <input v-else type="datetime-local" class="form-control fw-bold text-danger bg-body" 
                       v-model="form.checkOut" @change="handleDateChange" required>
                <div v-if="form.rentalType === 'DAILY'" class="form-text small text-body-secondary mt-1">Giờ trả phòng cố định vào 12:00 trưa.</div>
              </div>
            </div>
            
            <h5 class="fw-bold mt-4 mb-3 text-body-emphasis">Thông tin khách lưu trú từng phòng</h5>
            <div v-for="(room, index) in bookingData.rooms" :key="room.id" class="card border mb-3 bg-body">
              <div class="card-header bg-body-secondary py-2 border-bottom">
                <span class="fw-bold text-primary">Phòng: {{ room.name }}</span>
                <span class="badge bg-secondary ms-2">{{ room.roomType?.name }}</span>
              </div>
              <div class="card-body p-3">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-bold small text-body-secondary">Người lớn</label>
                    <input type="number" v-model="form.adultCounts[index]" class="form-control bg-body" min="1" :max="room.roomType?.adultMax" required>
                    <div class="form-text small text-body-secondary">Tối đa: {{ room.roomType?.adultMax }} người lớn</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold small text-body-secondary">Trẻ em</label>
                    <input type="number" v-model="form.childrenCounts[index]" class="form-control bg-body" min="0" :max="room.roomType?.childrenMax" required>
                    <div class="form-text small text-body-secondary">Tối đa: {{ room.roomType?.childrenMax }} trẻ em</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="alert alert-info d-flex align-items-center mb-4 shadow-sm">
              <i class="fas fa-info-circle fs-4 me-3"></i>
              <div v-if="form.rentalType === 'HOURLY'">
                Tổng thời gian lưu trú: <strong class="fs-5">{{ bookingData.stayHours }}</strong> giờ
              </div>
              <div v-else>
                Tổng thời gian lưu trú: <strong class="fs-5">{{ form.numberOfNights }}</strong> đêm
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label fw-bold small text-body-secondary">Ghi chú thêm (Không bắt buộc)</label>
              <textarea v-model="form.note" class="form-control bg-body" rows="2" maxlength="255" placeholder="Ví dụ: Xin check-in sớm..."></textarea>
            </div>
            
            <hr class="my-4">
            
            <!-- TỔNG KẾT TIỀN -->
            <div class="bg-body p-3 rounded-3 border border-secondary-subtle mb-4 shadow-sm">
              <h6 class="fw-bold mb-3 text-body-emphasis border-bottom border-secondary-subtle pb-2">
                <i class="fas fa-file-invoice-dollar text-primary me-2"></i> Chi tiết thanh toán
              </h6>
              
              <div class="d-flex justify-content-between align-items-center mb-2 small text-body-secondary">
                <span v-if="form.rentalType === 'HOURLY'">Tiền phòng (Giá gốc x {{ bookingData.stayHours }}h):</span>
                <span v-else>Tiền phòng (Giá gốc x {{ form.numberOfNights }} đêm):</span>
                <span class="fw-semibold text-body-emphasis">{{ formatPrice(bookingData.originalRoomSubTotal) }}</span>
              </div>
              
              <div v-if="bookingData.eventSurchargeAmount !== 0" class="d-flex justify-content-between align-items-center mb-2 small">
                <span>Ưu đãi / Phụ thu sự kiện:</span>
                <span class="fw-semibold" :class="bookingData.eventSurchargeAmount < 0 ? 'text-success' : 'text-warning text-dark'">
                  {{ bookingData.eventSurchargeAmount > 0 ? '+' : '' }}{{ formatPrice(bookingData.eventSurchargeAmount) }}
                </span>
              </div>
              
              <div class="my-3 border-bottom border-secondary-subtle" style="border-bottom-style: dashed !important;"></div>
              
              <div class="d-flex justify-content-between align-items-center mb-3 text-body-emphasis">
                <span class="fw-bold">Tổng tiền:</span>
                <span class="fw-bold text-danger fs-5">{{ formatPrice(bookingData.totalPrice) }}</span>
              </div>
              
              <div class="d-flex justify-content-between align-items-center mb-2 text-body-emphasis">
                <span>Tiền thanh toán trước (Cọc):</span>
                <span class="fw-bold text-primary fs-5">{{ formatPrice(bookingData.depositAmount) }}</span>
              </div>
              
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-body-secondary small">Thanh toán tại khách sạn (Khi Check-out):</span>
                <span class="fw-bold text-body-secondary">{{ formatPrice(bookingData.remainingAmount) }}</span>
              </div>
            </div>
            
            <button type="submit" class="btn btn-success w-100 py-3 fw-bold fs-6 shadow" :disabled="isSubmitting || !bookingData.bookingAvailable">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-check-circle me-2"></i> XÁC NHẬN ĐẶT PHÒNG
            </button>
            <router-link to="/rooms" class="btn btn-outline-secondary w-100 mt-3 py-2 fw-bold">
              <i class="fas fa-arrow-left me-2"></i> QUAY LẠI CHỌN PHÒNG
            </router-link>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL LỖI / PHẠT -->
    <div v-if="showErrorModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body overflow-hidden">
          
          <div class="bg-danger py-4 text-center text-white">
            <i class="fas fa-user-lock mb-2" style="font-size: 3.5rem;"></i>
            <h5 class="fw-bold mb-0 px-2">{{ errorTitle }}</h5>
          </div>
          
          <div class="modal-body pt-4 pb-4 px-4">
            <!-- Nếu chuỗi có phân tách bằng | -->
            <div v-if="errorMessage.includes('|')" class="text-start small">
              <div v-for="(line, idx) in errorMessage.split('|')" :key="idx" class="mb-3">
                <div v-if="idx === 0" class="fw-bold text-danger text-center fs-6 mb-3">{{ line }}</div>
                <div v-else-if="idx === 1" class="d-flex"><i class="fas fa-exclamation-circle text-danger me-2 mt-1"></i> <span class="fw-semibold text-body-emphasis">{{ line }}</span></div>
                <div v-else-if="idx === 2" class="d-flex"><i class="fas fa-clock text-warning me-2 mt-1"></i> <span class="text-body-secondary">{{ line }}</span></div>
                <div v-else-if="idx === 3" class="d-flex"><i class="fas fa-headset text-primary me-2 mt-1"></i> <span class="text-body-secondary fst-italic">{{ line }}</span></div>
              </div>
            </div>
            
            <!-- Nếu là lỗi bình thường -->
            <p v-else class="text-body-secondary mb-0 text-center" style="font-size: 0.95rem;">
              {{ errorMessage }}
            </p>
          </div>
          
          <div class="modal-footer bg-light border-0 d-flex justify-content-center py-3">
            <button type="button" class="btn btn-danger px-5 fw-bold rounded-pill shadow-sm" @click="showErrorModal = false">ĐÃ HIỂU</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../utils/axios'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMsg = ref('')
const bookingData = ref({})
let isInitialLoad = true 

const showErrorModal = ref(false)
const errorMessage = ref('')
const errorTitle = ref('Từ chối đặt phòng')

const dailyCheckInDate = ref('')
const activeImageIndex = ref({})

const form = ref({
  roomId: [],
  checkIn: '',
  checkOut: '',
  rentalType: 'HOURLY', 
  numberOfNights: 1, 
  adultCounts: [],
  childrenCounts: [],
  note: ''
})

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ'
const formatForInput = (isoString) => isoString ? isoString.substring(0, 16) : ''

const defaultImage = 'https://api.ct296.id.vn/image/default_room.jpg'

// Xử lý danh sách ảnh & Slider cho từng phòng trên trang Booking
const getRoomImageList = (room) => {
  if (!room || !room.images || room.images.length === 0) return [defaultImage]
  // Đưa ảnh chính (isPrimary) lên đầu danh sách
  const sorted = [...room.images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
  return sorted.map(img => {
    const imgPath = typeof img === 'string' ? img : img.imagePath
    if (!imgPath) return defaultImage
    return imgPath.startsWith('http') ? imgPath : `https://api.ct296.id.vn${imgPath}`
  })
}

const getCurrentRoomImage = (room) => {
  const list = getRoomImageList(room)
  const idx = activeImageIndex.value[room.id] || 0
  return list[idx] || defaultImage
}

const prevRoomImage = (room) => {
  const list = getRoomImageList(room)
  if (list.length <= 1) return
  const current = activeImageIndex.value[room.id] || 0
  activeImageIndex.value[room.id] = (current - 1 + list.length) % list.length
}

const nextRoomImage = (room) => {
  const list = getRoomImageList(room)
  if (list.length <= 1) return
  const current = activeImageIndex.value[room.id] || 0
  activeImageIndex.value[room.id] = (current + 1) % list.length
}

const handleImageError = (e) => { e.target.src = defaultImage }

const applyDailyFixedTimes = () => {
  let datePartCheckIn = '';
  if (dailyCheckInDate.value) {
    datePartCheckIn = dailyCheckInDate.value;
  } else if (form.value.checkIn) {
    datePartCheckIn = form.value.checkIn.split('T')[0];
    dailyCheckInDate.value = datePartCheckIn; 
  } else {
    return;
  }

  form.value.checkIn = `${datePartCheckIn}T14:00`

  const ciDate = new Date(datePartCheckIn)
  ciDate.setDate(ciDate.getDate() + form.value.numberOfNights)
  
  const year = ciDate.getFullYear()
  const month = String(ciDate.getMonth() + 1).padStart(2, '0')
  const day = String(ciDate.getDate()).padStart(2, '0')
  const datePartCheckOut = `${year}-${month}-${day}`

  form.value.checkOut = `${datePartCheckOut}T12:00`
}

const handleDailyCheckInChange = () => {
  if (dailyCheckInDate.value) {
     applyDailyFixedTimes();
     fetchCalculation();
  }
}

const handleDateChange = () => {
  if (form.value.checkIn && form.value.checkOut) {
    if (form.value.rentalType === 'DAILY') {
      applyDailyFixedTimes()
    }
    const ci = new Date(form.value.checkIn)
    const co = new Date(form.value.checkOut)
    
    if (co <= ci) {
      errorMsg.value = ''
      bookingData.value.conflictMessage = 'Giờ trả phòng phải sau giờ nhận phòng!'
      bookingData.value.bookingAvailable = false
      return
    }
    fetchCalculation()
  }
}

const handleRentalTypeChange = () => {
  if (form.value.rentalType === 'DAILY') {
    applyDailyFixedTimes()
  }
  fetchCalculation()
}

const handleNightsChange = () => {
  if (form.value.rentalType === 'DAILY' && form.value.numberOfNights > 0) {
    applyDailyFixedTimes()
    fetchCalculation()
  }
}

const fetchCalculation = async () => {
  try {
    let ci = form.value.checkIn
    let co = form.value.checkOut
    if (ci && ci.length === 16) ci += ':00'
    if (co && co.length === 16) co += ':00'

    const payload = {
      roomId: form.value.roomId,
      checkIn: ci || null,
      checkOut: co || null,
      rentalType: form.value.rentalType,
      numberOfNights: form.value.numberOfNights
    }

    const res = await api.post('/api/customer/booking/calculate', payload)
    bookingData.value = res.data

    if (isInitialLoad) {
      form.value.checkIn = formatForInput(res.data.checkIn)
      form.value.checkOut = formatForInput(res.data.checkOut)
      if (form.value.checkIn) {
        dailyCheckInDate.value = form.value.checkIn.split('T')[0]
      }
      form.value.adultCounts = (res.data.rooms || []).map(() => 1)
      form.value.childrenCounts = (res.data.rooms || []).map(() => 0)
      isInitialLoad = false
    }
  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Không thể tải thông tin đặt phòng.'
  } finally {
    isLoading.value = false
  }
}

const submitBooking = async () => {
  isSubmitting.value = true
  try {
    let ci = form.value.checkIn
    let co = form.value.checkOut
    if (ci && ci.length === 16) ci += ':00'
    if (co && co.length === 16) co += ':00'

    const payload = {
      roomId: form.value.roomId,
      checkIn: ci,
      checkOut: co,
      rentalType: form.value.rentalType,
      adultCounts: form.value.adultCounts,
      childrenCounts: form.value.childrenCounts,
      note: form.value.note
    }

    const res = await api.post('/api/customer/booking/confirm', payload)
    if (res.data.paymentUrl) {
      window.location.href = res.data.paymentUrl
    } else {
      router.push('/customer/profile?status=success')
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Có lỗi xảy ra khi xác nhận đặt phòng.'
    showErrorModal.value = true
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  const qRooms = route.query.roomId
  if (!qRooms) {
    errorMsg.value = 'Bạn chưa chọn phòng nào!'
    isLoading.value = false
    return
  }
  form.value.roomId = Array.isArray(qRooms) ? qRooms : [qRooms]
  if (route.query.checkIn) {
    form.value.checkIn = route.query.checkIn.substring(0, 16)
    dailyCheckInDate.value = form.value.checkIn.split('T')[0]
  }
  if (route.query.checkOut) {
    form.value.checkOut = route.query.checkOut.substring(0, 16)
  }
  if (route.query.rentalType) {
    form.value.rentalType = route.query.rentalType
  }
  fetchCalculation()
})
</script>

<style scoped>
.object-fit-cover {
  object-fit: cover;
}
.cursor-pointer {
  cursor: pointer;
}
.rental-tab {
  font-size: 1.1rem;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;
}
.rental-tab:hover:not(.active-tab) {
  color: #0d6efd !important;
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
  background-color: #0d6efd;
  border-radius: 4px 4px 0 0;
}

/* NÚT SLIDER ẢNH TRÊN TRANG BOOKING */
.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 5;
}
.room-slider-container:hover .slider-btn {
  opacity: 1;
}
.slider-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-50%) scale(1.1);
}
.slider-btn-prev { left: 8px; }
.slider-btn-next { right: 8px; }
.slider-counter {
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 0.7rem;
  z-index: 4;
}
</style>