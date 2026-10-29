<template>
  <div class="card border-0 shadow-sm rounded-4 mb-4">
    <div class="card-header bg-white border-0 pt-4 pb-0">
      <h5 class="fw-bold mb-1"><i class="fas fa-list-check me-2 text-primary"></i>Xử lý Booking Online</h5>
      <p class="small text-muted mb-0">Quản lý booking chờ cọc và danh sách khách đến nhận phòng hôm nay.</p>
    </div>
    
    <div class="card-body">
      <!-- Tabs nội dung -->
      <ul class="nav nav-tabs mb-3" id="bookingTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active fw-bold" data-bs-toggle="tab" data-bs-target="#pending">
            Chờ cọc <span class="badge bg-warning text-dark ms-1">{{ pendingBookings.length }}</span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link fw-bold" data-bs-toggle="tab" data-bs-target="#arrival">
            Khách đến hôm nay <span class="badge bg-primary ms-1">{{ todayArrivals.length }}</span>
          </button>
        </li>
      </ul>

      <div v-if="isLoading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
      
      <div v-else class="tab-content">
        <!-- TAB CHỜ CỌC -->
        <div class="tab-pane fade show active" id="pending">
          <div class="table-responsive border rounded">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr><th>Mã Booking / Khách hàng</th><th>Phòng (SL)</th><th>Thời gian nhận</th><th>Trạng thái</th><th class="text-end px-3">Thao tác</th></tr>
              </thead>
              <tbody>
                <tr v-if="pendingBookings.length === 0"><td colspan="5" class="text-center text-muted py-4">Không có booking chờ cọc.</td></tr>
                <tr v-else v-for="b in pendingBookings" :key="b.id">
                  <td>
                    <div class="fw-bold text-dark">{{ b.id }}</div>
                    <div class="small text-muted">{{ b.customer?.user?.lastName }} {{ b.customer?.user?.firstName }}</div>
                  </td>
                  <td>
                    <span class="badge bg-secondary me-1" v-for="(d, i) in b.rentalDetails" :key="i">{{ d.room?.name }}</span>
                  </td>
                  <td class="small">{{ formatDateTime(b.rentalDetails[0]?.checkinDate) }}</td>
                  <td><span class="badge bg-warning text-dark">Chờ cọc (Hủy sau 30p)</span></td>
                  <td class="text-end px-3">
                    <!-- BỔ SUNG NÚT THU TIỀN MẶT -->
                    <button @click="payDeposit(b.id)" class="btn btn-sm btn-success py-0 px-2 me-2" title="Thu tiền mặt">
                      <i class="fas fa-money-bill-wave me-1"></i>Thu cọc
                    </button>
                    <button @click="cancelBooking(b.id)" class="btn btn-sm btn-outline-danger py-0 px-2" title="Hủy">
                      <i class="fas fa-times me-1"></i>Hủy
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB KHÁCH ĐẾN HÔM NAY -->
        <div class="tab-pane fade" id="arrival">
          <div class="table-responsive border rounded">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr><th>Khách hàng</th><th>Phòng (SL)</th><th>Giờ nhận</th><th>Trạng thái</th><th class="text-end px-3">Check-in</th></tr>
              </thead>
              <tbody>
                <tr v-if="todayArrivals.length === 0"><td colspan="5" class="text-center text-muted py-4">Hôm nay không có khách đặt trước đến.</td></tr>
                <tr v-else v-for="a in todayArrivals" :key="a.id">
                  <td>
                    <div class="fw-bold text-dark">{{ a.customer?.user?.lastName }} {{ a.customer?.user?.firstName }}</div>
                    <div class="small text-muted">{{ a.id }}</div>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark border me-1" v-for="(d, i) in a.rentalDetails" :key="i">{{ d.room?.name }}</span>
                  </td>
                  <td class="small fw-bold text-primary">{{ formatTimeOnly(a.rentalDetails[0]?.checkinDate) }}</td>
                  <td><span class="badge bg-primary">Đã cọc xác nhận</span></td>
                  <td class="text-end px-3">
                    <button @click="checkIn(a.id)" class="btn btn-sm btn-success shadow-sm">
                      <i class="fas fa-sign-in-alt me-1"></i> Check-in nhận phòng
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
const pendingBookings = ref([])
const todayArrivals = ref([])
const isLoading = ref(true)

const formatDateTime = (val) => {
  if (!val) return ''
  return new Date(val).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}
const formatTimeOnly = (val) => {
  if (!val) return ''
  return new Date(val).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const fetchBookings = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/staff/bookings')
    pendingBookings.value = res.data.pendingBookings || []
    todayArrivals.value = res.data.todayArrivals || []
  } catch (error) { console.error('Lỗi bookings', error) } 
  finally { isLoading.value = false }
}

// BỔ SUNG HÀM GỌI API THU TIỀN CỌC
const payDeposit = async (rentalId) => {
  if (!confirm('Xác nhận thu tiền cọc bằng TIỀN MẶT cho đơn này?')) return
  try {
    const res = await api.post(`/api/staff/bookings/${rentalId}/pay-deposit`)
    alert(res.data.message)
    fetchBookings() // Render lại list
  } catch (error) { 
    alert(error.response?.data?.error || 'Lỗi khi thu tiền cọc') 
  }
}

const cancelBooking = async (rentalId) => {
  if (!confirm('Bạn chắc chắn muốn hủy booking này?')) return
  try {
    await api.post(`/api/staff/bookings/${rentalId}/cancel`)
    alert('Hủy thành công')
    fetchBookings()
  } catch (error) { alert(error.response?.data?.error || 'Lỗi khi hủy booking') }
}

const checkIn = async (rentalId) => {
  if (!confirm('Check-in giao phòng cho khách?')) return
  try {
    await api.post(`/api/staff/rentals/${rentalId}/check-in`)
    alert('Check-in thành công!')
    fetchBookings()
    // Chuyển sang tab quản lý Khách đang ở
    router.push('/employee/staff/stay')
  } catch (error) { alert(error.response?.data?.error || 'Phòng hiện tại chưa dọn dẹp xong.') }
}

onMounted(() => fetchBookings())
</script>