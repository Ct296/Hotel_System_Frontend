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
      <main class="customer-profile-main bg-light">
        <div class="customer-profile-mobile-topbar">
          <button type="button" class="customer-profile-mobile-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
            <i class="fas fa-bars"></i>
          </button>
          <router-link class="customer-profile-mobile-home" to="/home"><i class="fas fa-house me-1"></i>Trang chủ</router-link>
        </div>

        <section class="customer-profile-hero">
          <h1>Hồ sơ khách hàng</h1>
          <p>Quản lý tiến trình thành viên, lịch sử booking, và hóa đơn của bạn.</p>
        </section>

        <div v-if="isLoading" class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>

        <div v-else>
          <!-- Alerts -->
          <div class="customer-profile-alerts">
            <div v-if="notification.message" :class="`alert alert-${notification.type} shadow-sm fw-bold alert-dismissible fade show`">
              <i :class="notification.type === 'success' ? 'fas fa-check-circle me-1' : 'fas fa-exclamation-triangle me-1'"></i>
              {{ notification.message }}
              <button type="button" class="btn-close" @click="notification.message = ''"></button>
            </div>
          </div>

          <!-- TAB 0: HẠNG THÀNH VIÊN (TIẾN TRÌNH) -->
          <section v-if="activeTab === 'membership'" class="customer-profile-pane is-active">
            <!-- Thẻ VIP Banner -->
            <div class="tier-banner rounded-4 shadow-sm text-white p-4 p-lg-5 mb-4 position-relative overflow-hidden">
              <div class="position-relative z-1">
                <div class="d-flex align-items-center mb-3">
                  <i class="fas fa-user-shield me-2 opacity-75"></i> 
                  <span class="small fw-semibold text-uppercase tracking-wider opacity-75">Thành viên ITHotel</span>
                </div>
                <h1 class="display-4 fw-bold mb-4">{{ nextTierProgress.currentTierName }}</h1>
                <p class="mb-4 opacity-75">Chu kỳ tính điểm tự động bắt đầu từ hóa đơn đầu tiên của bạn.</p>
                
                <div class="d-flex justify-content-between border-top border-light border-opacity-25 pt-4">
                  <div>
                    <div class="small opacity-75 mb-1">Chi tiêu tích lũy hiện tại</div>
                    <h3 class="fw-bold mb-0">{{ formatPrice(nextTierProgress.totalSpending) }}</h3>
                  </div>
                  <div class="text-end">
                    <div class="small opacity-75 mb-1">Trạng thái</div>
                    <h5 class="fw-bold mb-0 text-uppercase text-warning">Active</h5>
                  </div>
                </div>
              </div>
              <i class="fas fa-gem position-absolute text-white opacity-10 tier-bg-icon"></i>
            </div>

            <!-- Thanh tiến trình -->
            <div class="card border-0 shadow-sm rounded-4 mb-4">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between mb-2">
                  <h6 class="fw-bold text-dark mb-0">Hành trình đến hạng <span class="text-primary">{{ nextTierProgress.nextTierName || 'Tối đa' }}</span></h6>
                  <span class="fw-bold text-primary">{{ nextTierProgress.percent }}%</span>
                </div>
                <div class="progress mb-3" style="height: 12px; background-color: #f1f5f9;">
                  <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary rounded-pill" role="progressbar" :style="{ width: nextTierProgress.percent + '%' }"></div>
                </div>
                <p v-if="nextTierProgress.nextTier" class="text-muted small mb-0">
                  Cần tích lũy thêm <strong>{{ formatPrice(nextTierProgress.neededAmount) }}</strong> để thăng hạng <strong>{{ nextTierProgress.nextTierName }}</strong>.
                </p>
                <p v-else class="text-success fw-bold small mb-0"><i class="fas fa-medal me-1"></i> Bạn đã đạt mức hạng thẻ cao nhất!</p>
              </div>
            </div>

            <!-- Khám phá hạng thẻ -->
            <h4 class="fw-bold text-dark mb-3 mt-5">Khám phá các hạng thành viên</h4>
            <div class="row g-3">
              <div v-for="tier in allTiers" :key="tier.id" class="col-md-6 col-xl-4">
                <div class="card border-0 shadow-sm rounded-4 h-100 tier-info-card" :class="{'border-primary border-2 shadow': nextTierProgress.currentTierName === tier.name}">
                  <div class="card-body p-4">
                    <i class="fas fa-gem fs-3 mb-3" :class="getTierColor(tier.name)"></i>
                    <h5 class="fw-bold mb-1">{{ tier.name }}</h5>
                    <p class="small text-muted mb-3">{{ tier.condition === 0 ? 'Khi đăng ký tài khoản' : 'Từ ' + formatPrice(tier.condition) }}</p>
                    <ul class="list-unstyled small mb-0">
                      <li class="mb-2"><i class="fas fa-check text-success me-2"></i> {{ tier.benefit }}</li>
                      <li class="mb-2" v-if="tier.discount > 0"><i class="fas fa-check text-success me-2"></i> Giảm {{ tier.discount }}% giá phòng</li>
                    </ul>
                    <div v-if="nextTierProgress.currentTierName === tier.name" class="mt-3 text-primary fw-bold small">
                      <i class="fas fa-arrow-right me-1"></i> Hạng hiện tại
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- TAB 1: THÔNG TIN TÀI KHOẢN -->
          <section v-if="activeTab === 'overview'" class="customer-profile-pane is-active">
            <div class="customer-profile-card">
              <h2 class="customer-profile-card-title">Thông tin cá nhân</h2>
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

          <!-- TAB 3: BOOKING -->
          <section v-if="activeTab === 'bookings'" class="customer-profile-pane is-active">
            <div class="customer-profile-card">
              <h2 class="customer-profile-card-title">Booking / Thuê phòng</h2>
              <div v-if="rentals.length === 0" class="customer-profile-empty text-center py-4">Bạn chưa có lượt đặt phòng hoặc thuê phòng nào.</div>
              <div v-else class="customer-profile-table-wrap">
                <table class="table table-bordered table-hover align-middle customer-profile-table">
                  <thead><tr><th>Mã đơn</th><th>Thông tin phòng</th><th>Thời gian nhận/trả</th><th>Số khách</th><th>Hình thức</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                  <tbody>
                    <tr v-for="r in rentals" :key="r.id">
                      <td class="fw-bold">{{ r.id }}</td>
                      <td>
                        <div v-if="r.rentalDetails && r.rentalDetails.length > 0">
                          <span class="badge bg-secondary me-1 mb-1" v-for="(d, i) in r.rentalDetails" :key="i">P.{{ d.room?.name || 'N/A' }}</span>
                          <div class="small text-muted mt-1">{{ r.rentalDetails[0]?.room?.roomType?.name }}</div>
                        </div>
                      </td>
                      <td>
                        <div v-if="r.rentalDetails && r.rentalDetails.length > 0">
                          <div class="small mb-1"><i class="fas fa-sign-in-alt text-success me-1"></i> {{ formatDateTime(r.rentalDetails[0]?.checkinDate) }}</div>
                          <div class="badge bg-light text-dark border mt-1"><i class="fas fa-clock me-1"></i> {{ r.rentalDetails[0]?.lengthOfStay || 0 }} giờ</div>
                        </div>
                      </td>
                      <td class="fw-bold text-center">{{ r.rentalDetails[0]?.adultCount || 0 }} NL, {{ r.rentalDetails[0]?.childrenCount || 0 }} TE</td>
                      <td><span class="badge" :class="r.isBooking ? 'text-bg-info' : 'text-bg-secondary'">{{ r.isBooking ? 'Đặt trước' : 'Thuê tại quầy' }}</span></td>
                      <td><span class="badge" :class="getRentalStatusClass(r)">{{ getRentalStatusText(r) }}</span></td>
                      <td class="text-end">
                        <div v-if="r.isBooking && (r.status === 'PENDING' || r.status === 'CONFIRMED')">
                          <button v-if="r.status === 'PENDING'" @click="payVnPay(r.id)" class="btn btn-sm btn-outline-primary mb-2 w-100 fw-bold" :disabled="isProcessing">Thanh toán cọc</button>
                          <button @click="confirmCancelBooking(r.id, r.status)" class="btn btn-sm btn-outline-danger w-100 fw-bold" :disabled="isProcessing">Hủy booking</button>
                        </div>
                        <span v-else class="text-muted small">Không khả dụng</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- TAB 4: BILLING -->
          <section v-if="activeTab === 'billing'" class="customer-profile-pane is-active">
            <div class="customer-profile-card">
              <h2 class="customer-profile-card-title">Thanh toán / Hóa đơn</h2>
              <div class="mb-4">
                <p class="customer-profile-section-subtitle text-primary">Danh sách hóa đơn</p>
                <div v-if="bills.length === 0" class="customer-profile-empty">Chưa có hóa đơn nào.</div>
                <div v-else class="customer-profile-table-wrap">
                  <table class="table table-bordered table-hover align-middle customer-profile-table">
                    <thead><tr><th>Mã hóa đơn</th><th>Mã thuê</th><th>Loại</th><th>Ngày tạo</th><th class="text-end">Tổng tiền</th></tr></thead>
                    <tbody>
                      <tr v-for="b in bills" :key="b.id">
                        <td class="fw-bold">{{ b.id }}</td>
                        <td class="text-muted">{{ b.rental?.id }}</td>
                        <td><span class="badge" :class="b.type === 'DEPOSIT' ? 'text-bg-primary' : 'text-bg-danger'">{{ b.type === 'DEPOSIT' ? 'Tiền cọc' : 'Thanh toán' }}</span></td>
                        <td>{{ formatDateTime(b.createDate) }}</td>
                        <td class="text-end fw-bold text-danger">{{ formatPrice(b.totalAmount) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <p class="customer-profile-section-subtitle text-success">Danh sách thanh toán</p>
                <div v-if="payments.length === 0" class="customer-profile-empty">Chưa có thanh toán nào.</div>
                <div v-else class="customer-profile-table-wrap">
                  <table class="table table-bordered table-hover align-middle customer-profile-table">
                    <thead><tr><th>Mã giao dịch</th><th>Mã hóa đơn</th><th>Phương thức</th><th>Ngày thanh toán</th></tr></thead>
                    <tbody>
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
      <div class="customer-profile-confirm-dialog">
        <button type="button" class="customer-profile-confirm-close" @click="showConfirmModal = false"><i class="fas fa-xmark"></i></button>
        <div class="customer-profile-confirm-icon"><i class="fas fa-triangle-exclamation"></i></div>
        <h3 class="customer-profile-confirm-title">{{ confirmConfig.title }}</h3>
        <p class="customer-profile-confirm-text">{{ confirmConfig.message }}</p>
        <div class="customer-profile-confirm-note">
          <i class="fas fa-circle-info"></i> {{ confirmConfig.note }}
        </div>
        <div class="customer-profile-confirm-actions">
          <button type="button" class="btn btn-light customer-profile-confirm-cancel" @click="showConfirmModal = false">Đóng</button>
          <button type="button" class="btn btn-danger customer-profile-confirm-ok" @click="executeCancelBooking"><i class="fas fa-check me-2"></i>Xác nhận Hủy</button>
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

// === LOGIC HẠNG THẺ THÀNH VIÊN ===
const allTiers = ref([
  { id: 1, name: 'Đồng', condition: 0, discount: 0, benefit: 'Tích lũy chi tiêu, hỗ trợ cơ bản' },
  { id: 2, name: 'Bạc', condition: 5000000, discount: 5, benefit: 'Ưu đãi dành cho thành viên' },
  { id: 3, name: 'Vàng', condition: 15000000, discount: 10, benefit: 'Ưu tiên hỗ trợ khách hàng' },
  { id: 4, name: 'Bạch kim', condition: 30000000, discount: 15, benefit: 'Ưu tiên hỗ trợ đặc quyền VIP' },
  { id: 5, name: 'Kim cương', condition: 60000000, discount: 20, benefit: 'Đặc quyền thượng lưu, hỗ trợ VIP riêng biệt' }
])

const nextTierProgress = computed(() => {
  // Lấy chi tiêu từ tổng các bill Final & Early_Checkout đã thanh toán (Tính toán giả lập nội bộ)
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
// ===============================

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
    note: isConfirmed ? 'Booking đã xác nhận khi hủy sẽ MẤT TOÀN BỘ TIỀN CỌC.' : 'Booking này sẽ được hủy ngay sau khi bạn xác nhận.'
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
.customer-profile-page {
  --cp-bg: #eef2f7;
  --cp-surface: #ffffff;
  --cp-text: #0f172a;
  --cp-muted: #64748b;
  --cp-border: rgba(15, 23, 42, 0.08);
  --cp-primary: #5b3df5;
  --cp-sidebar-bg: linear-gradient(180deg, #16043e 0%, #24005c 55%, #120033 100%);
  --cp-sidebar-item-hover: rgba(255,255,255,0.16);
  --cp-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  background: var(--cp-bg); 
  color: var(--cp-text); 
}

.customer-profile-layout { display: grid; grid-template-columns: 300px minmax(0, 1fr); min-height: 100vh; }
.customer-profile-sidebar { position: sticky; top: 0; height: 100vh; background: var(--cp-sidebar-bg) !important; color: #fff; padding: 22px 18px 24px; box-shadow: 8px 0 30px rgba(10, 10, 35, 0.18); overflow-y: auto; }
.customer-profile-brand { display: flex; align-items: center; gap: 12px; padding: 8px 8px 18px; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.12); }
.customer-profile-brand-icon { width: 44px; height: 44px; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; background: rgba(91, 61, 245, 0.22); font-size: 1.15rem; color: #fff;}
.customer-profile-brand-title { font-size: 1.65rem; font-weight: 800; line-height: 1.1; margin: 0; color: #fff;}
.customer-profile-brand-subtitle { margin: 2px 0 0; color: rgba(255,255,255,0.72); font-size: 0.92rem; font-weight: 500; }
.customer-profile-user-card { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.10); border-radius: 24px; padding: 22px 18px; text-align: center; margin: 18px 0 22px; color: #fff;}
.customer-profile-user-avatar { width: 104px; height: 104px; border-radius: 999px; object-fit: cover; margin: 0 auto 16px; border: 4px solid rgba(255,255,255,0.20); display: block; background: #fff;}
.customer-profile-user-name { font-size: 1.05rem; font-weight: 800; margin: 0 0 4px; color: #fff;}
.customer-profile-user-email { font-size: 0.94rem; color: rgba(255,255,255,0.78); margin: 0; }
.customer-profile-user-tier { display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; padding: 9px 16px; border-radius: 999px; background: rgba(255, 199, 0, 0.12); border: 1px solid rgba(255, 199, 0, 0.25); color: #ffd24d; font-weight: 800; }
.customer-profile-nav { display: flex; flex-direction: column; gap: 10px; }
.customer-profile-nav-btn, .customer-profile-nav-link, .customer-profile-logout-form button { width: 100%; border: 0; text-decoration: none; display: flex; align-items: center; gap: 14px; border-radius: 20px; padding: 16px 18px; font-weight: 800; transition: all 0.2s; background: transparent; color: rgba(255,255,255,0.92); text-align: left; cursor: pointer; }
.customer-profile-nav-btn:hover, .customer-profile-nav-link:hover, .customer-profile-logout-form button:hover { background: var(--cp-sidebar-item-hover); color: #fff; }
.customer-profile-nav-btn.is-active { background: rgba(255,255,255,0.16); color: #fff; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08); }
.customer-profile-nav-btn i, .customer-profile-nav-link i, .customer-profile-logout-form button i { width: 22px; text-align: center; font-size: 1.05rem; }
.customer-profile-logout-form button { color: #ffab9c; }
.customer-profile-main { padding: 32px; min-width: 0; background-color: var(--cp-bg);}
.customer-profile-mobile-topbar { display: none; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.customer-profile-mobile-toggle { border: 0; background: var(--cp-primary); color: #fff; width: 46px; height: 46px; border-radius: 14px; }
.customer-profile-mobile-home { text-decoration: none; color: var(--cp-primary); font-weight: 800; }
.customer-profile-hero { background: var(--cp-surface); border: 1px solid var(--cp-border); border-radius: 32px; padding: 28px 32px; box-shadow: var(--cp-shadow); margin-bottom: 24px; }
.customer-profile-hero h1 { margin: 0 0 8px; font-size: clamp(2rem, 3vw, 3.15rem); font-weight: 900; color: #12133f; }
.customer-profile-hero p { margin: 0; color: var(--cp-muted); }
.customer-profile-card { background: var(--cp-surface); border: 1px solid var(--cp-border); border-radius: 30px; box-shadow: var(--cp-shadow); padding: 28px; }
.customer-profile-card-title { margin: 0 0 26px; font-size: clamp(1.6rem, 2.5vw, 2.8rem); font-weight: 900; color: #12133f; }
.customer-profile-field-label { display: block; margin-bottom: 10px; font-weight: 800; color: #434b61; }
.customer-profile-readonly, .form-control, .form-select { min-height: 54px; border-radius: 16px; border: 1px solid rgba(15, 23, 42, 0.10); box-shadow: none; }
.customer-profile-readonly { display: flex; align-items: center; padding: 0 16px; background: #f8fafc; color: #1f2937; }
.customer-profile-table-wrap { overflow-x: auto; border: 1px solid rgba(15, 23, 42, 0.08); border-radius: 18px; }
.customer-profile-table { margin: 0; min-width: 980px; }
.customer-profile-table thead th { background: #f8fafc; color: #44506b; font-weight: 800; white-space: nowrap; }
.customer-profile-empty { border: 1px dashed rgba(15, 23, 42, 0.12); border-radius: 18px; background: #fbfcfe; color: #64748b; padding: 16px 18px; margin: 0; }
.customer-profile-section-subtitle { margin: 0 0 14px; font-size: 1.08rem; font-weight: 800; }

/* Modal Hủy Booking */
.customer-profile-confirm-modal { position: fixed; inset: 0; z-index: 2000; display: none; align-items: center; justify-content: center; padding: 20px; }
.customer-profile-confirm-modal.show { display: flex; animation: fadein 0.2s; }
.customer-profile-confirm-backdrop { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.55); backdrop-filter: blur(3px); }
.customer-profile-confirm-dialog { position: relative; z-index: 1; width: 100%; max-width: 480px; background: #fff; border-radius: 24px; padding: 28px 24px 22px; text-align: center; animation: zoomin 0.22s; }
.customer-profile-confirm-close { position: absolute; top: 14px; right: 14px; width: 38px; height: 38px; border: 0; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; }
.customer-profile-confirm-icon { width: 72px; height: 72px; margin: 0 auto 16px; border-radius: 20px; background: linear-gradient(135deg, #fee2e2, #ffedd5); color: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 30px; }
.customer-profile-confirm-title { font-weight: 900; margin-bottom: 10px; }
.customer-profile-confirm-note { background: #fff7ed; border: 1px solid #fed7aa; color: #7c2d12; border-radius: 16px; padding: 14px; margin-bottom: 22px; font-size: 0.95rem; }
.customer-profile-confirm-actions { display: flex; gap: 12px; }
.customer-profile-confirm-actions button { flex: 1; border-radius: 14px; padding: 12px 16px; font-weight: 800; }

/* CSS Mới Cho Hạng thẻ */
.tier-banner { background: linear-gradient(135deg, #ea580c 0%, #d97706 100%); }
.tier-bg-icon { font-size: 15rem; right: -2rem; bottom: -4rem; transform: rotate(15deg); }
.tracking-wider { letter-spacing: 2px; }
.tier-info-card { transition: transform 0.2s; }
.tier-info-card:hover { transform: translateY(-5px); }

@keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoomin { from { opacity: 0; transform: translateY(10px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

@media (max-width: 991.98px) {
  .customer-profile-layout { grid-template-columns: 1fr; }
  .customer-profile-sidebar { position: fixed; top: 0; left: 0; width: min(320px, calc(100vw - 36px)); transform: translateX(-100%); transition: transform 0.25s ease; z-index: 1045; }
  .customer-profile-sidebar.is-open { transform: translateX(0); }
  .customer-profile-mobile-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.38); z-index: 1040; display: none; }
  .customer-profile-mobile-backdrop.is-open { display: block; }
  .customer-profile-main { padding: 18px; }
  .customer-profile-mobile-topbar { display: flex; }
}
</style>