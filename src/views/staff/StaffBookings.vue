<template>
  <div class="card border-0 shadow-sm rounded-4 mb-4">
    <div class="card-header bg-white border-0 pt-4 pb-0">
      <h5 class="fw-bold mb-1"><i class="fas fa-list-check me-2 text-primary"></i>Xử lý Booking & Khách đến</h5>
      <p class="small text-muted mb-0">Danh sách các đơn chờ thu cọc và khách đến nhận phòng hôm nay.</p>
    </div>
    
    <div class="card-body">
      <!-- Thông báo Toast (thay cho alert) -->
      <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
        <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
        {{ notification.message }}
        <button type="button" class="btn-close" @click="notification.message = ''"></button>
      </div>

      <div v-if="isLoading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
      
      <!-- Bảng gộp chung 2 danh sách -->
      <div v-else class="table-responsive border rounded bg-white">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Mã Booking / Khách hàng</th>
              <th>Phòng (SL)</th>
              <th>Giờ nhận phòng</th>
              <th class="text-center">Trạng thái</th>
              <th class="text-end">Tiền cọc</th>
              <th class="text-end px-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="allBookings.length === 0">
              <td colspan="6" class="text-center text-muted py-4">Hôm nay không có booking chờ xử lý.</td>
            </tr>
            <tr v-else v-for="b in allBookings" :key="b.id">
              <td>
                <div class="fw-bold text-dark">{{ b.id }}</div>
                <div class="small text-muted">{{ b.customer?.user?.lastName }} {{ b.customer?.user?.firstName }}</div>
              </td>
              <td>
                <span class="badge bg-secondary me-1" v-for="(d, i) in b.rentalDetails" :key="i">
                  {{ d.room?.name || 'N/A' }}
                </span>
              </td>
              <td class="small fw-semibold" :class="b.status === 'CONFIRMED' ? 'text-primary' : ''">
                {{ formatDateTime(b.rentalDetails[0]?.checkinDate) }}
              </td>
              <td class="text-center">
                <span v-if="b.status === 'PENDING'" class="badge bg-warning text-dark">Chờ cọc</span>
                <span v-else class="badge bg-primary">Đã xác nhận</span>
              </td>
              <td class="text-end fw-bold text-danger">
                {{ b.depositAmount ? formatPrice(b.depositAmount) : (b.status === 'PENDING' ? 'Chưa tính' : 'Đã thu') }}
              </td>
              <td class="text-end px-3">
                <template v-if="b.status === 'PENDING'">
                  <button @click="payDeposit(b)" class="btn btn-sm btn-success py-1 px-2 me-2 shadow-sm" title="Thu tiền cọc">
                    <i class="fas fa-money-bill-wave me-1"></i> Thu cọc
                  </button>
                  <button @click="cancelBooking(b)" class="btn btn-sm btn-outline-danger py-1 px-2 shadow-sm" title="Hủy">
                    <i class="fas fa-times"></i>
                  </button>
                </template>
                <template v-else>
                  <button @click="checkIn(b)" class="btn btn-sm btn-primary shadow-sm py-1 px-3">
                    <i class="fas fa-sign-in-alt me-1"></i> Check-in
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL CONFIRM (Thay cho Window.confirm) -->
    <div v-if="showConfirmModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body">
          <div class="modal-header border-0 pb-0 justify-content-center mt-3">
            <div :class="'text-' + confirmConfig.type" style="font-size: 3rem;">
              <i :class="confirmConfig.icon"></i>
            </div>
          </div>
          <div class="modal-body text-center pt-2 pb-4 px-4">
            <h5 class="fw-bold mb-3 text-body-emphasis">{{ confirmConfig.title }}</h5>
            <p class="text-body-secondary mb-0" style="font-size: 0.95rem;" v-html="confirmConfig.message"></p>
          </div>
          <div class="modal-footer bg-light border-0 d-flex justify-content-center rounded-bottom-4 py-3 gap-2">
            <button type="button" class="btn btn-secondary px-4 fw-semibold" @click="closeConfirm" :disabled="isProcessing">Hủy</button>
            <button type="button" class="btn px-4 fw-bold" :class="'btn-' + confirmConfig.type" @click="executeConfirm" :disabled="isProcessing">
              <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../utils/axios'

const router = useRouter()
const pendingBookings = ref([])
const todayArrivals = ref([])
const isLoading = ref(true)
const isProcessing = ref(false)
const notification = ref({ type: '', message: '' })

// Quản lý Modal Confirm
const showConfirmModal = ref(false)
const confirmConfig = ref({ title: '', message: '', type: 'primary', icon: '', action: null })

// Gộp 2 danh sách và xếp theo thời gian Check-in
const allBookings = computed(() => {
  const combined = [...pendingBookings.value, ...todayArrivals.value]
  return combined.sort((a, b) => {
    const dateA = new Date(a.rentalDetails[0]?.checkinDate || 0)
    const dateB = new Date(b.rentalDetails[0]?.checkinDate || 0)
    return dateA - dateB
  })
})

const showNotification = (type, message) => {
  notification.value = { type, message }
  setTimeout(() => notification.value.message = '', 5000)
}

const openConfirm = (title, message, type, icon, actionCallback) => {
  confirmConfig.value = { title, message, type, icon, action: actionCallback }
  showConfirmModal.value = true
}

const closeConfirm = () => {
  showConfirmModal.value = false
  confirmConfig.value.action = null
}

const executeConfirm = async () => {
  if (confirmConfig.value.action) {
    isProcessing.value = true
    await confirmConfig.value.action()
    isProcessing.value = false
  }
  closeConfirm()
}

const formatDateTime = (val) => {
  if (!val) return ''
  return new Date(val).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
}

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ'

const fetchBookings = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/staff/bookings')
    pendingBookings.value = res.data.pendingBookings || []
    todayArrivals.value = res.data.todayArrivals || []
  } catch (error) { 
    showNotification('danger', 'Lỗi khi tải danh sách booking.') 
  } finally { 
    isLoading.value = false 
  }
}

const payDeposit = (booking) => {
  const amountText = booking.depositAmount ? `<strong class='text-danger fs-5'>${formatPrice(booking.depositAmount)}</strong>` : 'tiền mặt'
  openConfirm(
    'Thu tiền cọc', 
    `Xác nhận thu ${amountText} từ khách hàng <b>${booking.customer?.user?.lastName} ${booking.customer?.user?.firstName}</b>?`, 
    'success', 
    'fas fa-money-bill-wave', 
    async () => {
      try {
        const res = await api.post(`/api/staff/bookings/${booking.id}/pay-deposit`)
        showNotification('success', res.data.message || 'Thu cọc thành công.')
        await fetchBookings()
      } catch (error) {
        showNotification('danger', error.response?.data?.error || 'Lỗi khi thu tiền cọc.')
      }
    }
  )
}

const cancelBooking = (booking) => {
  openConfirm(
    'Hủy Booking', 
    `Bạn có chắc chắn muốn hủy đơn <b>${booking.id}</b>? Thao tác này không thể hoàn tác.`, 
    'danger', 
    'fas fa-trash-alt', 
    async () => {
      try {
        await api.post(`/api/staff/bookings/${booking.id}/cancel`)
        showNotification('success', 'Đã hủy booking thành công.')
        await fetchBookings()
      } catch (error) {
        showNotification('danger', error.response?.data?.error || 'Lỗi khi hủy booking.')
      }
    }
  )
}

const checkIn = (booking) => {
  openConfirm(
    'Check-in nhận phòng', 
    `Xác nhận giao phòng cho khách <b>${booking.customer?.user?.lastName} ${booking.customer?.user?.firstName}</b>?`, 
    'primary', 
    'fas fa-sign-in-alt', 
    async () => {
      try {
        await api.post(`/api/staff/rentals/${booking.id}/check-in`)
        showNotification('success', 'Check-in thành công!')
        await fetchBookings()
        router.push('/employee/staff/stay')
      } catch (error) {
        showNotification('danger', error.response?.data?.error || 'Phòng hiện tại chưa dọn dẹp xong.')
      }
    }
  )
}

onMounted(() => fetchBookings())
</script>