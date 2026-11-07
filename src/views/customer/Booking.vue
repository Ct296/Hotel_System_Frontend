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
      
      <!-- CỘT TRÁI: DANH SÁCH PHÒNG CHỌN -->
      <div class="col-lg-5">
        <h5 class="fw-bold mb-3 border-bottom pb-2 text-body-emphasis">Các phòng đã chọn ({{ bookingData.rooms?.length || 0 }})</h5>
        
        <div class="d-flex flex-column gap-3 mb-4" style="max-height: 600px; overflow-y: auto;">
          <div class="card shadow-sm border-0 bg-body-tertiary" v-for="room in bookingData.rooms" :key="room.id">
            <div class="row g-0">
              <div class="col-4">
                <img :src="getRoomImage(room)" class="img-fluid rounded-start h-100 object-fit-cover" alt="Room" @error="handleImageError">
              </div>
              <div class="col-8">
                <div class="card-body p-3">
                  <h6 class="fw-bold mb-1 text-primary">Phòng {{ room.name }}</h6>
                  <span class="badge bg-primary text-white mb-2">{{ room.roomType?.name }}</span>
                  <div class="small text-body-secondary mb-1"><i class="fas fa-user-friends me-1"></i> Tối đa {{ (room.roomType?.adultMax || 0) + (room.roomType?.childrenMax || 0) }} người</div>
                  <div class="small text-body-secondary mb-2"><i class="fas fa-ruler-combined me-1"></i> {{ room.roomType?.area }} m&sup2;</div>
                  
                  <!-- HIỂN THỊ TIỆN ÍCH -->
                  <div class="small text-body-secondary mb-2">
                    <div v-if="room.roomType?.roomAmenities && room.roomType.roomAmenities.length > 0">
                      <span v-for="ra in room.roomType.roomAmenities.slice(0, 3)" :key="ra.amenity?.id" class="me-2 d-inline-block mb-1">
                        <i class="fas fa-check text-success me-1"></i> {{ ra.amenity?.name }}
                      </span>
                      <span v-if="room.roomType.roomAmenities.length > 3" class="fst-italic opacity-50">...</span>
                    </div>
                  </div>
                  <div class="text-danger fw-bold small">Cần cọc: {{ room.roomType?.depositPercent }}%</div>
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
        <div class="card shadow-sm border-0 p-4 bg-body-tertiary">
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
                    <div class="form-text small text-body-secondary">Tối đa: {{ room.roomType?.adultMax }} người</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold small text-body-secondary">Trẻ em</label>
                    <input type="number" v-model="form.childrenCounts[index]" class="form-control bg-body" min="0" :max="room.roomType?.childrenMax" required>
                    <div class="form-text small text-body-secondary">Tối đa: {{ room.roomType?.childrenMax }} người</div>
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
            <!-- Nếu chuỗi lỗi có phân cách bằng | -->
            <div v-if="errorMessage.includes('|')" class="text-start small">
              <div v-for="(line, idx) in errorMessage.split('|')" :key="idx" class="mb-3">
                <div v-if="idx === 0" class="fw-bold text-danger text-center fs-6 mb-3">{{ line }}</div>
                <div v-else-if="idx === 1" class="d-flex"><i class="fas fa-exclamation-circle text-danger me-2 mt-1"></i> <span class="fw-semibold text-body-emphasis">{{ line }}</span></div>
                <div v-else-if="idx === 2" class="d-flex"><i class="fas fa-clock text-warning me-2 mt-1"></i> <span class="text-body-secondary">{{ line }}</span></div>
                <div v-else-if="idx === 3" class="d-flex"><i class="fas fa-headset text-primary me-2 mt-1"></i> <span class="text-body-secondary fst-italic">{{ line }}</span></div>
              </div>
            </div>
            
            <!-- Nếu lỗi bình thường -->
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

const getRoomImage = (room) => {
  const defaultImage = 'https://api.ct296.id.vn/image/default_room.jpg';
  if (room && room.images && room.images.length > 0) {
      const primaryImg = room.images.find(img => img.isPrimary) || room.images[0];
      const imgPath = primaryImg.imagePath;
      if (!imgPath) return defaultImage;
      return imgPath.startsWith('http') ? imgPath : `https://api.ct296.id.vn${imgPath}`;
  }
  return defaultImage;
}

const handleImageError = (e) => { e.target.src = 'https://api.ct296.id.vn/image/default_room.jpg' }

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
  if (form.value.rentalType === 'DAILY' && form.value.checkIn) {
      applyDailyFixedTimes()
  }
  handleDateChange()
}

const handleNightsChange = () => {
  if (form.value.rentalType === 'DAILY' && form.value.checkIn && form.value.numberOfNights > 0) {
      applyDailyFixedTimes()
      fetchCalculation()
  }
}

const fetchCalculation = async () => {
  isLoading.value = isInitialLoad 
  errorMsg.value = ''
  
  let roomIds = route.query.roomId
  if (!roomIds) {
    errorMsg.value = 'Chưa chọn phòng nào!'
    isLoading.value = false
    return
  }
  if (!Array.isArray(roomIds)) roomIds = [roomIds] 
  form.value.roomId = roomIds

  if (isInitialLoad) {
    form.value.checkIn = formatForInput(route.query.checkIn)
    form.value.checkOut = formatForInput(route.query.checkOut)
    if(form.value.rentalType === 'DAILY') {
       applyDailyFixedTimes();
    }
    isInitialLoad = false
  }

  try {
    const res = await api.post('/api/customer/booking/calculate', {
      roomId: form.value.roomId,
      checkIn: form.value.checkIn.length === 16 ? form.value.checkIn + ':00' : form.value.checkIn,
      checkOut: form.value.checkOut.length === 16 ? form.value.checkOut + ':00' : form.value.checkOut,
      rentalType: form.value.rentalType 
    })
    
    bookingData.value = res.data
    form.value.checkIn = formatForInput(res.data.checkIn)
    form.value.checkOut = formatForInput(res.data.checkOut)
    
    if (form.value.adultCounts.length === 0) {
      form.value.adultCounts = res.data.rooms.map(r => 1)
      form.value.childrenCounts = res.data.rooms.map(r => 0)
    }
    
  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Lỗi mạng khi tính toán chi phí đặt phòng.'
  } finally {
    isLoading.value = false
  }
}

const submitBooking = async () => {
  if (!bookingData.value.bookingAvailable) {
    errorMessage.value = 'Phòng đang bị chắn trong khung giờ này, vui lòng chọn thời gian khác!'
    errorTitle.value = 'Xung Đột Lịch'
    showErrorModal.value = true
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      ...form.value,
      checkIn: form.value.checkIn.length === 16 ? form.value.checkIn + ':00' : form.value.checkIn,
      checkOut: form.value.checkOut.length === 16 ? form.value.checkOut + ':00' : form.value.checkOut
    }
    const res = await api.post('/api/customer/booking/confirm', payload)
    router.push({ path: '/customer/booking/payment', query: { rentalId: res.data.rentalId } })
  } catch (error) {
    const errText = error.response?.data?.error || 'Lỗi xác nhận đặt phòng.'
    
    if (errText.includes('|')) {
        errorTitle.value = 'Tài Khoản Bị Hạn Chế'
    } else {
        errorTitle.value = 'Không Thể Đặt Phòng'
    }
    
    errorMessage.value = errText
    showErrorModal.value = true
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => fetchCalculation())
</script>

<style scoped>
.object-fit-cover { object-fit: cover; }
.btn-group .btn {
  border-radius: 0.5rem;
}

/* GIAO DIỆN TAB HÌNH THỨC THUÊ */
.rental-tab {
  font-size: 1.15rem;
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
.cursor-pointer {
  cursor: pointer;
}
</style>