<template>
  <div class="customer-profile-page min-vh-100">
    <div class="customer-profile-mobile-backdrop" :class="{ 'is-open': mobileMenuOpen }" @click="mobileMenuOpen = false"></div>

    <div class="customer-profile-layout">
      <!-- SIDEBAR -->
      <aside class="customer-profile-sidebar" :class="{ 'is-open': mobileMenuOpen }">
        <div class="customer-profile-brand">
          <span class="customer-profile-brand-icon"><i class="fas fa-hotel"></i></span>
          <div>
            <h2 class="customer-profile-brand-title">ITHotel</h2>
            <p class="customer-profile-brand-subtitle">Khách hàng</p>
          </div>
        </div>

        <div class="customer-profile-user-card">
          <img :src="getImageUrl(currentUser.avatar)" @error="handleImageError" alt="Avatar" class="customer-profile-user-avatar">
          <h3 class="customer-profile-user-name">{{ currentUser.lastName }} {{ currentUser.firstName }}</h3>
          <p class="customer-profile-user-email">{{ currentUser.email }}</p>
          <div class="customer-profile-user-tier">
            <i class="fas fa-crown"></i>
            <span>Hạng: {{ nextTierProgress.currentTierName }}</span>
          </div>
        </div>

        <nav class="customer-profile-nav">
          <button type="button" class="customer-profile-nav-btn" :class="{ 'is-active': activeTab === 'membership' }" @click="switchTab('membership')">
            <i class="fas fa-medal"></i><span>Hạng thành viên</span>
          </button>
          
          <button type="button" class="customer-profile-nav-btn" :class="{ 'is-active': activeTab === 'overview' }" @click="switchTab('overview')">
            <i class="fas fa-id-card"></i><span>Thông tin cá nhân</span>
          </button>

          <button type="button" class="customer-profile-nav-btn" :class="{ 'is-active': activeTab === 'bookings' }" @click="switchTab('bookings')">
            <i class="fas fa-calendar-check"></i><span>Booking / Thuê phòng</span>
          </button>

          <button type="button" class="customer-profile-nav-btn" :class="{ 'is-active': activeTab === 'billing' }" @click="switchTab('billing')">
            <i class="fas fa-file-invoice-dollar"></i><span>Thanh toán / Hóa đơn</span>
          </button>

          <router-link to="/customer/settings" class="customer-profile-nav-link border-top border-light border-opacity-10 mt-2 pt-3">
            <i class="fas fa-cog"></i><span>Cài đặt hệ thống</span>
          </router-link>

          <router-link to="/home" class="customer-profile-nav-link">
            <i class="fas fa-house"></i><span>Về trang chủ</span>
          </router-link>

          <div class="customer-profile-logout-form">
            <button @click.prevent="logout">
              <i class="fas fa-right-from-bracket"></i><span>Đăng xuất</span>
            </button>
          </div>
        </nav>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="customer-profile-main">
        <div class="customer-profile-mobile-topbar">
          <button type="button" class="customer-profile-mobile-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
            <i class="fas fa-bars"></i>
          </button>
          <router-link class="customer-profile-mobile-home" to="/home"><i class="fas fa-house me-1"></i>Trang chủ</router-link>
        </div>

        <div v-if="isLoading" class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>

        <div v-else class="customer-profile-content-wrapper">
          <!-- Alerts -->
          <div class="customer-profile-alerts">
            <div v-if="notification.message" :class="`alert alert-${notification.type} shadow-sm fw-bold alert-dismissible fade show`">
              <i :class="notification.type === 'success' ? 'fas fa-check-circle me-1' : 'fas fa-exclamation-triangle me-1'"></i>
              {{ notification.message }}
              <button type="button" class="btn-close" @click="notification.message = ''"></button>
            </div>
          </div>

          <!-- TAB 0: HẠNG THÀNH VIÊN -->
          <section v-if="activeTab === 'membership'" class="customer-profile-pane is-active">
            <!-- Thẻ VIP Banner -->
            <div class="tier-banner rounded-4 shadow-sm text-white p-4 mb-4 position-relative overflow-hidden">
              <div class="position-relative z-1">
                <div class="d-flex align-items-center mb-2">
                  <i class="fas fa-user-shield me-2 opacity-75"></i> 
                  <span class="small fw-semibold text-uppercase tracking-wider opacity-75">Thành viên ITHotel</span>
                </div>
                <h2 class="fw-bold mb-3">{{ nextTierProgress.currentTierName }}</h2>
                <p class="mb-3 opacity-75 small">Chu kỳ tính điểm tự động bắt đầu từ hóa đơn đầu tiên.</p>
                
                <div class="d-flex justify-content-between border-top border-light border-opacity-25 pt-3">
                  <div>
                    <div class="small opacity-75 mb-1">Chi tiêu tích lũy</div>
                    <h5 class="fw-bold mb-0">{{ formatPrice(nextTierProgress.totalSpending) }}</h5>
                  </div>
                  <div class="text-end">
                    <div class="small opacity-75 mb-1">Trạng thái</div>
                    <h6 class="fw-bold mb-0 text-uppercase text-warning">Active</h6>
                  </div>
                </div>
              </div>
              <i class="fas fa-gem position-absolute text-white opacity-10 tier-bg-icon"></i>
            </div>

            <!-- Thanh tiến trình -->
            <div class="card border-0 shadow-sm rounded-4 mb-4 bg-body-tertiary">
              <div class="card-body p-3">
                <div class="d-flex justify-content-between mb-2">
                  <span class="fw-bold text-body-emphasis small">Hành trình đến hạng <span class="text-primary">{{ nextTierProgress.nextTierName || 'Tối đa' }}</span></span>
                  <span class="fw-bold text-primary small">{{ nextTierProgress.percent }}%</span>
                </div>
                <div class="progress mb-2 bg-secondary-subtle" style="height: 10px;">
                  <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary rounded-pill" role="progressbar" :style="{ width: nextTierProgress.percent + '%' }"></div>
                </div>
                <p v-if="nextTierProgress.nextTier" class="text-body-secondary small mb-0" style="font-size: 0.8rem;">
                  Cần tích lũy thêm <strong>{{ formatPrice(nextTierProgress.neededAmount) }}</strong> để thăng hạng <strong>{{ nextTierProgress.nextTierName }}</strong>.
                </p>
                <p v-else class="text-success fw-bold small mb-0"><i class="fas fa-medal me-1"></i> Đã đạt hạng cao nhất!</p>
              </div>
            </div>

            <!-- Khám phá hạng thẻ -->
            <h6 class="fw-bold text-body-emphasis mb-3 mt-4">Khám phá các hạng thành viên</h6>
            <div class="row g-3">
              <div v-for="tier in allTiers" :key="tier.id" class="col-md-6 col-xl-4">
                <div class="card border-0 shadow-sm rounded-4 h-100 tier-info-card bg-body-tertiary" :class="{'border-primary border-2 shadow': nextTierProgress.currentTierName === tier.name}">
                  <div class="card-body p-3">
                    <i class="fas fa-gem fs-4 mb-2" :class="getTierColor(tier.name)"></i>
                    <h6 class="fw-bold mb-1 text-body-emphasis">{{ tier.name }}</h6>
                    <p class="small text-body-secondary mb-2" style="font-size: 0.8rem;">{{ tier.condition === 0 ? 'Mặc định' : 'Từ ' + formatPrice(tier.condition) }}</p>
                    <ul class="list-unstyled mb-0 text-body-secondary" style="font-size: 0.8rem;">
                      <li class="mb-1"><i class="fas fa-check text-success me-1"></i> {{ tier.benefit }}</li>
                      <li v-if="tier.discount > 0"><i class="fas fa-check text-success me-1"></i> Giảm {{ tier.discount }}% giá phòng</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- TAB 1: THÔNG TIN CÁ NHÂN -->
          <section v-if="activeTab === 'overview'" class="customer-profile-pane is-active">
            <div class="card border-0 shadow-sm rounded-4 bg-body-tertiary p-3 p-md-4">
              <h5 class="fw-bold mb-4 text-body-emphasis border-bottom pb-2">Thông tin cá nhân</h5>
              <div class="row g-3">
                <div class="col-md-6"><label class="customer-profile-field-label">Họ và tên</label><div class="customer-profile-readonly">{{ currentUser.lastName }} {{ currentUser.firstName }}</div></div>
                <div class="col-md-6"><label class="customer-profile-field-label">Email</label><div class="customer-profile-readonly">{{ currentUser.email }}</div></div>
                <div class="col-md-6"><label class="customer-profile-field-label">Số điện thoại</label><div class="customer-profile-readonly">{{ currentUser.phoneNumber || 'Chưa cập nhật' }}</div></div>
                <div class="col-md-6"><label class="customer-profile-field-label">CCCD / Hộ chiếu</label><div class="customer-profile-readonly">{{ currentUser.pid || 'Chưa cập nhật' }}</div></div>
                <div class="col-md-6"><label class="customer-profile-field-label">Quốc tịch</label><div class="customer-profile-readonly">{{ currentUser.nationality || 'Chưa cập nhật' }}</div></div>
                <div class="col-md-6"><label class="customer-profile-field-label">Giới tính</label><div class="customer-profile-readonly">{{ getGenderLabel(currentUser.sex) }}</div></div>
                <div class="col-md-6"><label class="customer-profile-field-label">Ngày sinh</label><div class="customer-profile-readonly">{{ formatDateOnly(currentUser.dateOfBirth) }}</div></div>
              </div>
            </div>
          </section>

          <!-- TAB 2: BOOKING -->
          <section v-if="activeTab === 'bookings'" class="customer-profile-pane is-active">
            <div class="card border-0 shadow-sm rounded-4 bg-body-tertiary p-3 p-md-4">
              <h5 class="fw-bold mb-4 text-body-emphasis border-bottom pb-2">Booking / Thuê phòng</h5>
              <div v-if="rentals.length === 0" class="customer-profile-empty text-center py-4">Chưa có lượt đặt phòng hoặc thuê phòng nào.</div>
              <div v-else class="customer-profile-table-wrap">
                <table class="table table-bordered table-hover align-middle customer-profile-table mb-0">
                  <thead class="table-secondary"><tr><th>Mã đơn</th><th>Phòng</th><th>Thời gian</th><th>Khách</th><th>Hình thức</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                  <tbody class="small">
                    <tr v-for="r in rentals" :key="r.id">
                      <td class="fw-bold">{{ r.id }}</td>
                      <td>
                        <div v-if="r.rentalDetails && r.rentalDetails.length > 0">
                          <span class="badge bg-secondary me-1" v-for="(d, i) in r.rentalDetails" :key="i">P.{{ d.room?.name || 'N/A' }}</span>
                          <div class="text-body-secondary mt-1" style="font-size: 0.75rem;">{{ r.rentalDetails[0]?.room?.roomType?.name }}</div>
                        </div>
                      </td>
                      <td>
                        <div v-if="r.rentalDetails && r.rentalDetails.length > 0">
                          <div class="mb-1"><i class="fas fa-sign-in-alt text-success me-1"></i> {{ formatDateTime(r.rentalDetails[0]?.checkinDate) }}</div>
                          <div class="badge bg-body-secondary text-body-emphasis border mt-1"><i class="fas fa-clock me-1"></i> {{ r.rentalDetails[0]?.lengthOfStay || 0 }} giờ</div>
                        </div>
                      </td>
                      <td class="fw-bold text-center">{{ r.rentalDetails[0]?.adultCount || 0 }} NL, {{ r.rentalDetails[0]?.childrenCount || 0 }} TE</td>
                      <td><span class="badge" :class="r.isBooking ? 'text-bg-info' : 'text-bg-secondary'">{{ r.isBooking ? 'Đặt trước' : 'Thuê tại quầy' }}</span></td>
                      <td><span class="badge" :class="getRentalStatusClass(r)">{{ getRentalStatusText(r) }}</span></td>
                      <td class="text-end">
                        <div v-if="r.isBooking && (r.status === 'PENDING' || r.status === 'CONFIRMED')">
                          <button v-if="r.status === 'PENDING'" @click="payVnPay(r.id)" class="btn btn-sm btn-primary mb-1 w-100 fw-bold" :disabled="isProcessing">Thanh toán cọc</button>
                          <button @click="confirmCancelBooking(r.id, r.status)" class="btn btn-sm btn-danger w-100 fw-bold" :disabled="isProcessing">Hủy</button>
                        </div>
                        <span v-else class="text-body-secondary" style="font-size: 0.75rem;">Không khả dụng</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- TAB 3: BILLING -->
          <section v-if="activeTab === 'billing'" class="customer-profile-pane is-active">
            <div class="card border-0 shadow-sm rounded-4 bg-body-tertiary p-3 p-md-4">
              <h5 class="fw-bold mb-4 text-body-emphasis border-bottom pb-2">Thanh toán / Hóa đơn</h5>
              <div class="mb-4">
                <h6 class="text-primary fw-bold mb-3">Danh sách hóa đơn</h6>
                <div v-if="bills.length === 0" class="customer-profile-empty py-3">Chưa có hóa đơn nào.</div>
                <div v-else class="customer-profile-table-wrap">
                  <table class="table table-bordered table-hover align-middle customer-profile-table mb-0">
                    <thead class="table-secondary"><tr><th>Mã HĐ</th><th>Mã Thuê</th><th>Loại</th><th>Ngày tạo</th><th class="text-end">Tổng tiền</th></tr></thead>
                    <tbody class="small">
                      <tr v-for="b in bills" :key="b.id">
                        <td class="fw-bold">{{ b.id }}</td>
                        <td class="text-body-secondary">{{ b.rental?.id }}</td>
                        <td><span class="badge" :class="b.type === 'DEPOSIT' ? 'text-bg-primary' : 'text-bg-danger'">{{ b.type === 'DEPOSIT' ? 'Tiền cọc' : 'Thanh toán' }}</span></td>
                        <td>{{ formatDateTime(b.createDate) }}</td>
                        <td class="text-end fw-bold text-danger">{{ formatPrice(b.totalAmount) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h6 class="text-success fw-bold mb-3">Danh sách thanh toán</h6>
                <div v-if="payments.length === 0" class="customer-profile-empty py-3">Chưa có thanh toán nào.</div>
                <div v-else class="customer-profile-table-wrap">
                  <table class="table table-bordered table-hover align-middle customer-profile-table mb-0">
                    <thead class="table-secondary"><tr><th>Mã giao dịch</th><th>Mã HĐ</th><th>Phương thức</th><th>Ngày thanh toán</th></tr></thead>
                    <tbody class="small">
                      <tr v-for="p in payments" :key="p.id">
                        <td class="fw-bold text-success">{{ p.transaction }}</td>
                        <td>{{ p.bill?.id }}</td>
                        <td><span class="badge bg-success-subtle text-success border border-success">{{ p.method }}</span></td>
                        <td>{{ formatDateTime(p.date) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>

    <!-- CUSTOM CONFIRM MODAL CHO HỦY BOOKING -->
    <div class="customer-profile-confirm-modal" :class="{ 'show': showConfirmModal }" :aria-hidden="!showConfirmModal">
      <div class="customer-profile-confirm-backdrop" @click="showConfirmModal = false"></div>
      <div class="customer-profile-confirm-dialog bg-body-tertiary">
        <button type="button" class="customer-profile-confirm-close bg-body" @click="showConfirmModal = false"><i class="fas fa-xmark text-body-emphasis"></i></button>
        <div class="customer-profile-confirm-icon"><i class="fas fa-triangle-exclamation"></i></div>
        <h4 class="customer-profile-confirm-title text-body-emphasis">{{ confirmConfig.title }}</h4>
        <p class="customer-profile-confirm-text text-body-secondary small">{{ confirmConfig.message }}</p>
        <div class="customer-profile-confirm-note small">
          <i class="fas fa-circle-info"></i> {{ confirmConfig.note }}
        </div>
        <div class="customer-profile-confirm-actions mt-3">
          <button type="button" class="btn btn-secondary customer-profile-confirm-cancel py-2" @click="showConfirmModal = false">Đóng</button>
          <button type="button" class="btn btn-danger customer-profile-confirm-ok py-2" @click="executeCancelBooking"><i class="fas fa-check me-2"></i>Xác nhận Hủy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import api from '../../utils/axios'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeTab = ref('membership')
const mobileMenuOpen = ref(false)
const isLoading = ref(true)
const isProcessing = ref(false)

const currentUser = ref({})
const currentTier = ref({})
const rentals = ref([])
const bills = ref([])
const payments = ref([])

const notification = ref({ type: '', message: '' })
const urlError = ref(route.query.error || '')
const urlSuccess = ref(route.query.status === 'success')

const showConfirmModal = ref(false)
const confirmConfig = ref({ rentalId: null, title: '', message: '', note: '' })

const allTiers = ref([
  { id: 1, name: 'Đồng', condition: 0, discount: 0, benefit: 'Tích lũy chi tiêu, hỗ trợ cơ bản' },
  { id: 2, name: 'Bạc', condition: 5000000, discount: 5, benefit: 'Ưu đãi dành cho thành viên' },
  { id: 3, name: 'Vàng', condition: 15000000, discount: 10, benefit: 'Ưu tiên hỗ trợ khách hàng' },
  { id: 4, name: 'Bạch kim', condition: 30000000, discount: 15, benefit: 'Ưu tiên hỗ trợ đặc quyền VIP' },
  { id: 5, name: 'Kim cương', condition: 60000000, discount: 20, benefit: 'Đặc quyền thượng lưu, hỗ trợ VIP riêng biệt' }
])

const nextTierProgress = computed(() => {
  const total = bills.value.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
  const currentName = currentTier.value?.name || 'Đồng'
  
  const nextT = allTiers.value.find(t => t.condition > total) || null
  const percent = nextT ? Math.min(100, Math.round((total / nextT.condition) * 100)) : 100
  const neededAmount = nextT ? nextT.condition - total : 0

  return {
    totalSpending: total,
    currentTierName: currentName,
    nextTier: nextT,
    nextTierName: nextT?.name || '',
    percent: percent,
    neededAmount: neededAmount
  }
})

const getTierColor = (tierName) => {
  if (tierName === 'Đồng') return 'text-secondary'
  if (tierName === 'Bạc') return 'text-secondary opacity-75'
  if (tierName === 'Vàng') return 'text-warning'
  if (tierName === 'Bạch kim') return 'text-info'
  if (tierName === 'Kim cương') return 'text-primary'
  return 'text-muted'
}

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0) + ' đ'
const formatDateTime = (val) => val ? new Date(val).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'
const formatDateOnly = (val) => val ? new Date(val).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chưa cập nhật'
const getGenderLabel = (val) => val === 'MALE' ? 'Nam' : (val === 'FEMALE' ? 'Nữ' : 'Không xác định')

const backendBaseUrl = 'https://api.ct296.id.vn'
const defaultAvatar = `${backendBaseUrl}/image/default_avatar_customer.jpg`
const getImageUrl = (path) => {
  if (!path || path.trim() === '') return defaultAvatar
  return path.startsWith('http') ? path : `${backendBaseUrl}${path}`
}
const handleImageError = (e) => { e.target.src = defaultAvatar }

const showNotification = (type, message) => {
  notification.value = { type, message }
  setTimeout(() => notification.value.message = '', 5000)
}

const switchTab = (tab) => {
  activeTab.value = tab
  mobileMenuOpen.value = false
  notification.value.message = ''
  if (Object.keys(route.query).length > 0) {
    router.replace({ path: route.path })
    urlError.value = ''
    urlSuccess.value = false
  }
}

const getRentalStatusClass = (r) => {
  if (r.status === 'PENDING') return 'text-bg-warning'
  if (r.status === 'COMPLETED') return 'text-bg-dark'
  if (r.status === 'CANCELLED') return 'text-bg-danger'
  const detailStatus = r.rentalDetails[0]?.status
  if (detailStatus === 'CHECKED_IN') return 'text-bg-success'
  if (detailStatus === 'OVERDUE') return 'text-bg-danger'
  return 'text-bg-primary' 
}

const getRentalStatusText = (r) => {
  if (r.status === 'PENDING') return 'Chờ cọc'
  if (r.status === 'COMPLETED') return 'Đã hoàn tất'
  if (r.status === 'CANCELLED') return 'Đã Hủy'
  const detailStatus = r.rentalDetails[0]?.status
  if (detailStatus === 'CHECKED_IN') return 'Đang ở'
  if (detailStatus === 'OVERDUE') return 'Quá hạn trả'
  return 'Đã chốt cọc'
}

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/customer/profile')
    currentUser.value = res.data.currentUser || {}
    currentTier.value = res.data.currentTier || {}
    rentals.value = res.data.rentals || []
    bills.value = res.data.bills || []
    payments.value = res.data.payments || []
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const confirmCancelBooking = (rentalId, status) => {
  const isConfirmed = status === 'CONFIRMED'
  confirmConfig.value = {
    rentalId,
    title: isConfirmed ? 'Hủy booking đã xác nhận' : 'Hủy booking',
    message: 'Bạn có chắc muốn hủy booking này?',
    note: isConfirmed ? 'Booking đã xác nhận khi hủy sẽ MẤT TOÀN BỘ TIỀN CỌC.' : 'Booking này sẽ được hủy ngay.'
  }
  showConfirmModal.value = true
}

const executeCancelBooking = async () => {
  showConfirmModal.value = false
  isProcessing.value = true
  try {
    const res = await api.post('/api/customer/rentals/cancel', { rentalId: confirmConfig.value.rentalId })
    showNotification('success', res.data.message)
    fetchData()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Không thể hủy.')
  } finally {
    isProcessing.value = false
  }
}

const payVnPay = async (rentalId) => {
  isProcessing.value = true
  try {
    const res = await api.post('/api/customer/booking/payment/vnpay', { rentalId })
    window.location.href = res.data.paymentUrl
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi tạo liên kết thanh toán.')
  } finally {
    isProcessing.value = false
  }
}

const logout = async () => {
  try { await api.post('/api/auth/logout') } catch (e) {}
  authStore.clearAuth()
  router.push('/login')
}

onMounted(() => {
  fetchData()
  if (urlError.value || urlSuccess.value) activeTab.value = 'bookings'
})
</script>

<style scoped>
/* Đồng bộ biến nền theo hệ thống Dark Mode của Bootstrap */
.customer-profile-page {
  --cp-bg: var(--bs-body-bg);
  --cp-text: var(--bs-body-color);
  --cp-border: var(--bs-border-color);
  --cp-primary: #0d6efd;
  /* Đổi sidebar sang xanh biển/đen gradient đồng bộ */
  --cp-sidebar-bg: linear-gradient(180deg, #0a1128 0%, #001f54 100%);
  --cp-sidebar-item-hover: rgba(255,255,255,0.16);
  background: var(--cp-bg); 
  color: var(--cp-text); 
}

/* Đổi nền sidebar thành đen/xám khi bật Dark Mode */
[data-bs-theme="dark"] .customer-profile-page {
  --cp-sidebar-bg: linear-gradient(180deg, #000000 0%, #121212 100%);
}

/* KHÓA SIDEBAR (BẢN FIX CỨNG) */
.customer-profile-layout { 
  display: flex; 
  min-height: 100vh; 
}
.customer-profile-sidebar { 
  width: 250px; 
  min-width: 250px;
  position: fixed; /* Khóa đứng yên không cho trôi */
  top: 0; 
  left: 0;
  height: 100vh; 
  background: var(--cp-sidebar-bg) !important; 
  color: #fff; 
  padding: 20px 14px; 
  box-shadow: 4px 0 20px rgba(10, 10, 35, 0.15); 
  overflow-y: auto; 
  z-index: 1000;
}
.customer-profile-main { 
  flex-grow: 1;
  margin-left: 250px; /* Bù khoảng trống do sidebar bị khóa (fixed) */
  padding: 20px; 
  min-width: 0; 
  background-color: var(--cp-bg);
}

.customer-profile-brand { display: flex; align-items: center; gap: 10px; padding: 4px 8px 12px; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.12); }
.customer-profile-brand-icon { width: 36px; height: 36px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; background: rgba(13, 110, 253, 0.4); font-size: 1rem; color: #fff;}
.customer-profile-brand-title { font-size: 1.4rem; font-weight: 800; line-height: 1.1; margin: 0; color: #fff;}
.customer-profile-brand-subtitle { margin: 0; color: rgba(255,255,255,0.72); font-size: 0.85rem; font-weight: 500; }
.customer-profile-user-card { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.10); border-radius: 16px; padding: 16px 12px; text-align: center; margin: 12px 0; color: #fff;}
.customer-profile-user-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin: 0 auto 10px; border: 3px solid rgba(255,255,255,0.20); display: block; background: #fff;}
.customer-profile-user-name { font-size: 1rem; font-weight: 800; margin: 0 0 4px; color: #fff;}
.customer-profile-user-email { font-size: 0.85rem; color: rgba(255,255,255,0.78); margin: 0; }
.customer-profile-user-tier { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; padding: 6px 12px; border-radius: 50px; background: rgba(255, 199, 0, 0.12); border: 1px solid rgba(255, 199, 0, 0.25); color: #ffd24d; font-weight: 800; font-size: 0.85rem;}
.customer-profile-nav { display: flex; flex-direction: column; gap: 6px; }
.customer-profile-nav-btn, .customer-profile-nav-link, .customer-profile-logout-form button { width: 100%; border: 0; text-decoration: none; display: flex; align-items: center; gap: 10px; border-radius: 14px; padding: 12px 14px; font-weight: 700; transition: all 0.2s; background: transparent; color: rgba(255,255,255,0.92); text-align: left; cursor: pointer; font-size: 0.9rem;}
.customer-profile-nav-btn:hover, .customer-profile-nav-link:hover, .customer-profile-logout-form button:hover { background: var(--cp-sidebar-item-hover); color: #fff; }
.customer-profile-nav-btn.is-active { background: rgba(255,255,255,0.16); color: #fff; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08); }
.customer-profile-nav-btn i, .customer-profile-nav-link i, .customer-profile-logout-form button i { width: 20px; text-align: center; font-size: 1rem; }
.customer-profile-logout-form button { color: #ffab9c; }

/* THU NHỎ CÁC THẺ GIAO DIỆN PHẢI (CARDS) */
.customer-profile-content-wrapper { max-width: 1100px; margin: 0 auto; }
.customer-profile-mobile-topbar { display: none; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.customer-profile-mobile-toggle { border: 0; background: var(--cp-primary); color: #fff; width: 40px; height: 40px; border-radius: 10px; }
.customer-profile-mobile-home { text-decoration: none; color: var(--cp-primary); font-weight: 800; }
.customer-profile-field-label { display: block; margin-bottom: 6px; font-weight: 700; color: var(--bs-secondary-color); font-size: 0.85rem;}
.customer-profile-readonly { min-height: 42px; border-radius: 12px; border: 1px solid var(--cp-border); display: flex; align-items: center; padding: 0 14px; background: var(--bs-secondary-bg); color: var(--bs-body-color); font-size: 0.9rem;}
.customer-profile-table-wrap { overflow-x: auto; border: 1px solid var(--cp-border); border-radius: 14px; }
.customer-profile-table { margin: 0; min-width: 800px; }
.customer-profile-table thead th { font-weight: 700; white-space: nowrap; font-size: 0.85rem;}
.customer-profile-empty { border: 1px dashed var(--cp-border); border-radius: 14px; background: var(--bs-secondary-bg); color: var(--bs-secondary-color); padding: 12px 14px; margin: 0; font-size: 0.9rem;}

/* Modal Hủy Booking Thu nhỏ */
.customer-profile-confirm-modal { position: fixed; inset: 0; z-index: 2000; display: none; align-items: center; justify-content: center; padding: 16px; }
.customer-profile-confirm-modal.show { display: flex; animation: fadein 0.2s; }
.customer-profile-confirm-backdrop { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(3px); }
.customer-profile-confirm-dialog { position: relative; z-index: 1; width: 100%; max-width: 420px; border-radius: 20px; padding: 24px 20px 20px; text-align: center; animation: zoomin 0.22s; }
.customer-profile-confirm-close { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.customer-profile-confirm-icon { width: 60px; height: 60px; margin: 0 auto 12px; border-radius: 16px; background: linear-gradient(135deg, #fee2e2, #ffedd5); color: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.customer-profile-confirm-title { font-weight: 800; margin-bottom: 8px; font-size: 1.25rem;}
.customer-profile-confirm-note { background: #fff7ed; border: 1px solid #fed7aa; color: #7c2d12; border-radius: 12px; padding: 10px; margin-bottom: 16px; }
.customer-profile-confirm-actions { display: flex; gap: 10px; }
.customer-profile-confirm-actions button { flex: 1; border-radius: 12px; font-weight: 700; }

/* CSS Mới Cho Hạng thẻ - Đổi sang dải Xanh Biển */
.tier-banner { background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); }
.tier-bg-icon { font-size: 10rem; right: -1rem; bottom: -2rem; transform: rotate(15deg); }
.tracking-wider { letter-spacing: 2px; }
.tier-info-card { transition: transform 0.2s; }
.tier-info-card:hover { transform: translateY(-4px); }

@keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoomin { from { opacity: 0; transform: translateY(10px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

@media (max-width: 991.98px) {
  .customer-profile-layout { display: block; }
  .customer-profile-sidebar { position: fixed; top: 0; left: 0; width: min(280px, calc(100vw - 36px)); transform: translateX(-100%); transition: transform 0.25s ease; z-index: 1045; }
  .customer-profile-sidebar.is-open { transform: translateX(0); }
  .customer-profile-mobile-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.38); z-index: 1040; display: none; }
  .customer-profile-mobile-backdrop.is-open { display: block; }
  .customer-profile-main { margin-left: 0; width: 100%; padding: 16px; }
  .customer-profile-mobile-topbar { display: flex; }
}
</style>