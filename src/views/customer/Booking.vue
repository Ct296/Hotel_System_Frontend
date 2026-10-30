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
        <p class="text-body-secondary mb-0">Hệ thống tính tiền theo giờ (tối thiểu 1 giờ).</p>
      </div>

      <!-- CỘT TRÁI: DANH SÁCH PHÒNG ĐÃ CHỌN -->
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
                  <div class="text-danger fw-bold small">Cọc: {{ room.roomType?.depositPercent }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="alert alert-warning small shadow-sm text-dark">
          <i class="fas fa-clock me-2"></i> Hệ thống sẽ giữ phòng trong <strong>30 phút</strong> để bạn thanh toán tiền cọc.
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
            <div class="row mb-3 g-3">
              <div class="col-md-6">
                <label class="form-label fw-bold small text-body-secondary">Giờ nhận phòng</label>
                <input type="datetime-local" class="form-control bg-body" :value="formatForInput(bookingData.checkIn)" readonly>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold small text-body-secondary">Giờ trả phòng</label>
                <input type="datetime-local" class="form-control bg-body" :value="formatForInput(bookingData.checkOut)" readonly>
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

            <div class="alert alert-info d-flex align-items-center mb-4">
              <i class="fas fa-clock fs-4 me-3"></i>
              <div>
                Tổng thời gian lưu trú: <strong>{{ bookingData.stayHours }}</strong> giờ
                <span v-if="(bookingData.totalPrice - bookingData.depositAmount) > 0 && bookingData.stayHours < 6" class="d-block small mt-1 text-danger">
                  * Thuê dưới 6 giờ sẽ cộng thêm phụ thu ngắn hạn.
                </span>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold small text-body-secondary">Ghi chú thêm (Không bắt buộc)</label>
              <textarea v-model="form.note" class="form-control bg-body" rows="2" maxlength="255" placeholder="Ví dụ: Cần check-in sớm..."></textarea>
            </div>

            <hr class="my-4">

            <!-- TỔNG KẾT TIỀN -->
            <div class="d-flex justify-content-between align-items-center mb-2 text-body-emphasis">
              <span class="fw-bold">Tổng tiền dự kiến:</span>
              <span class="fw-bold text-danger fs-5">{{ formatPrice(bookingData.totalPrice) }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-2 text-body-emphasis">
              <span>Tiền cọc cần thanh toán trước:</span>
              <span class="fw-bold text-primary fs-5">{{ formatPrice(bookingData.depositAmount) }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-4">
              <span class="text-body-secondary small">Thanh toán tại khách sạn:</span>
              <span class="fw-bold text-body-secondary">{{ formatPrice(bookingData.remainingAmount) }}</span>
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

const form = ref({
  roomId: [],
  checkIn: '',
  checkOut: '',
  adultCounts: [],
  childrenCounts: [],
  note: ''
})

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0) + ' đ'
const formatForInput = (isoString) => isoString ? isoString.substring(0, 16) : ''
const getRoomImage = (room) => (room.images && room.images.length > 0) ? `https://api.ct296.id.vn${room.images[0].imagePath}` : 'https://placehold.co/100x100?text=No+Image'
const handleImageError = (e) => { e.target.src = 'https://placehold.co/100x100?text=Error' }

const fetchCalculation = async () => {
  isLoading.value = true
  errorMsg.value = ''
  
  let roomIds = route.query.roomId
  if (!roomIds) {
    errorMsg.value = 'Chưa chọn phòng nào!'
    isLoading.value = false
    return
  }
  if (!Array.isArray(roomIds)) roomIds = [roomIds] 

  form.value.roomId = roomIds
  form.value.checkIn = route.query.checkIn || ''
  form.value.checkOut = route.query.checkOut || ''

  try {
    const res = await api.post('/api/customer/booking/calculate', {
      roomId: form.value.roomId,
      checkIn: form.value.checkIn,
      checkOut: form.value.checkOut
    })
    
    bookingData.value = res.data
    form.value.checkIn = res.data.checkIn
    form.value.checkOut = res.data.checkOut
    
    form.value.adultCounts = res.data.rooms.map(r => 1)
    form.value.childrenCounts = res.data.rooms.map(r => 0)
    
  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Lỗi hệ thống khi tính toán đặt phòng.'
  } finally {
    isLoading.value = false
  }
}

const submitBooking = async () => {
  if (!bookingData.value.bookingAvailable) return alert('Phòng đang bị trùng lịch!')
  
  isSubmitting.value = true
  try {
    const res = await api.post('/api/customer/booking/confirm', form.value)
    router.push({ path: '/customer/booking/payment', query: { rentalId: res.data.rentalId } })
  } catch (error) {
    alert(error.response?.data?.error || 'Lỗi xác nhận đặt phòng.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => fetchCalculation())
</script>

<style scoped>
.object-fit-cover { object-fit: cover; }
</style>