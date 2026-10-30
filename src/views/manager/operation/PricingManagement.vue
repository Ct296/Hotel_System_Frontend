<template>
  <div class="position-relative">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-body-emphasis mb-1">Quản lý Chiến lược Giá</h3>
        <p class="text-body-secondary small mb-0">Thiết lập các chương trình Giảm giá/Phụ thu và thời gian áp dụng.</p>
      </div>
    </div>

    <!-- Thông báo Alert -->
    <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
      {{ notification.message }}
      <button type="button" class="btn-close" @click="notification.message = ''"></button>
    </div>

    <!-- Bảng Tabs -->
    <ul class="nav nav-pills mb-4 gap-2" id="pricing-tab" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active fw-bold px-4 rounded-pill" id="events-tab" data-bs-toggle="pill" data-bs-target="#events" type="button" role="tab">
          <i class="fas fa-tags me-2"></i>1. Sự kiện / Chương trình
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link fw-bold px-4 rounded-pill" id="periods-tab" data-bs-toggle="pill" data-bs-target="#periods" type="button" role="tab">
          <i class="fas fa-calendar-alt me-2"></i>2. Kỳ áp dụng
        </button>
      </li>
    </ul>

    <div class="tab-content" id="pricing-tabContent">
      
      <!-- TAB 1: SỰ KIỆN / CHƯƠNG TRÌNH -->
      <div class="tab-pane fade show active" id="events" role="tabpanel">
        <div class="row g-4">
          <!-- Form tạo sự kiện -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm rounded-4 bg-body-tertiary">
              <div class="card-header bg-transparent border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold text-primary mb-0">
                  <i :class="isEditModePR ? 'fas fa-edit' : 'fas fa-plus-circle'" class="me-2"></i>
                  {{ isEditModePR ? 'Cập nhật Chương trình' : 'Tạo Chương trình mới' }}
                </h5>
                <button v-if="isEditModePR" @click="cancelEditPR" class="btn btn-sm btn-outline-secondary rounded-circle" title="Hủy sửa"><i class="fas fa-times"></i></button>
              </div>
              <div class="card-body p-4">
                <form @submit.prevent="submitPriceRate">
                  <div class="mb-3">
                    <label class="form-label fw-semibold text-body-secondary">Tên / Chiến dịch <span class="text-danger">*</span></label>
                    <input v-model="prForm.eventName" type="text" class="form-control bg-body" required placeholder="VD: Lễ 30/4, Flash Sale...">
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold text-body-secondary">Hình thức <span class="text-danger">*</span></label>
                    <select v-model="prForm.type" class="form-select bg-body border-primary text-primary fw-bold" required>
                      <option value="DISCOUNT">Giảm giá (Khuyến mãi)</option>
                      <option value="SURCHARGE">Tăng giá (Phụ thu)</option>
                    </select>
                  </div>
                  <div class="mb-4">
                    <label class="form-label fw-semibold text-body-secondary">Mức điều chỉnh (%) <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <input v-model="prForm.amount" type="number" min="0" max="100" step="0.1" class="form-control bg-body fw-bold text-end" required placeholder="VD: 15">
                      <span class="input-group-text bg-body-secondary fw-bold">%</span>
                    </div>
                    <small class="text-body-secondary" v-if="prForm.type === 'DISCOUNT'">Hệ thống sẽ giảm <b>{{ prForm.amount }}%</b> so với giá gốc.</small>
                    <small class="text-body-secondary" v-else>Hệ thống sẽ tăng <b>{{ prForm.amount }}%</b> so với giá gốc.</small>
                  </div>
                  <button type="submit" class="btn w-100 fw-bold rounded-3 shadow-sm" :class="isEditModePR ? 'btn-primary' : 'btn-success'" :disabled="isProcessing">
                    <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> 
                    <i v-else :class="isEditModePR ? 'fas fa-save me-1' : 'fas fa-check me-1'"></i> 
                    {{ isEditModePR ? 'Lưu Thay Đổi' : 'Xác nhận Tạo' }}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- Bảng danh sách sự kiện -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-secondary">
                      <tr>
                        <th class="px-4 py-3">Tên chiến dịch</th>
                        <th class="py-3 text-end">Biến động (%)</th>
                        <th class="py-3 text-end px-4">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="priceRates.length === 0"><td colspan="3" class="text-center py-4 text-body-secondary">Chưa có chương trình nào.</td></tr>
                      <tr v-else v-for="pr in priceRates" :key="pr.id" :class="{'table-active': prForm.priceRateId === pr.id}">
                        <td class="px-4 fw-bold text-body-emphasis">{{ pr.eventName }}</td>
                        <td class="text-end fw-bold" :class="pr.surchargeAmount < 0 ? 'text-danger' : 'text-success'">
                          <i :class="pr.surchargeAmount < 0 ? 'fas fa-arrow-down' : 'fas fa-arrow-up'" class="me-1"></i>
                          {{ Math.abs(pr.surchargeAmount) }} %
                        </td>
                        <td class="text-end px-4">
                          <button @click="editPriceRate(pr)" class="btn btn-sm btn-outline-primary shadow-sm me-2" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button @click="deletePriceRate(pr.id)" class="btn btn-sm btn-outline-danger shadow-sm" title="Xóa">
                            <i class="fas fa-trash"></i>
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
      </div>

      <!-- TAB 2: KỲ ÁP DỤNG -->
      <div class="tab-pane fade" id="periods" role="tabpanel">
        <div class="row g-4">
          <!-- Form tạo kỳ áp dụng -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm rounded-4 bg-body-tertiary">
              <div class="card-header bg-transparent border-bottom-0 pt-4 pb-0">
                <h5 class="fw-bold text-success"><i class="fas fa-clock me-2"></i> Áp dụng Chương trình</h5>
              </div>
              <div class="card-body p-4">
                <form @submit.prevent="submitAppliedPeriod">
                  <div class="mb-3">
                    <label class="form-label fw-semibold text-body-secondary">Chương trình <span class="text-danger">*</span></label>
                    <select v-model="apForm.priceRateId" class="form-select bg-body" required>
                      <option value="" disabled>-- Chọn chương trình --</option>
                      <option v-for="pr in priceRates" :key="pr.id" :value="pr.id">{{ pr.eventName }} ({{ pr.surchargeAmount < 0 ? 'Giảm' : 'Tăng' }} {{ Math.abs(pr.surchargeAmount) }}%)</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold text-body-secondary">Áp dụng cho Hạng phòng <span class="text-danger">*</span></label>
                    <select v-model="apForm.roomTypeId" class="form-select bg-body" required>
                      <option value="" disabled>-- Chọn hạng phòng --</option>
                      <option v-for="rt in roomTypes" :key="rt.id" :value="rt.id">{{ rt.name }} (Giá gốc: {{ formatPrice(rt.basePrice) }})</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold text-body-secondary">Bắt đầu từ <span class="text-danger">*</span></label>
                    <input v-model="apForm.startDate" type="datetime-local" class="form-control bg-body" required>
                  </div>
                  <div class="mb-4">
                    <label class="form-label fw-semibold text-body-secondary">Kết thúc vào <span class="text-danger">*</span></label>
                    <input v-model="apForm.endDate" type="datetime-local" class="form-control bg-body" required>
                  </div>
                  <button type="submit" class="btn btn-success w-100 fw-bold rounded-3 shadow-sm" :disabled="isProcessing">
                    <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Kích hoạt
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- Bảng danh sách kỳ áp dụng -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
              <div class="card-header bg-transparent border-bottom-0 pt-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <!-- NAV NGANG NHỎ -->
                <ul class="nav nav-pills custom-nav-pills small" id="period-filter-tabs">
                  <li class="nav-item">
                    <button class="nav-link rounded-pill py-1 px-3 fw-bold" :class="{ 'active': periodFilter === 'ACTIVE' }" @click="periodFilter = 'ACTIVE'">Đang áp dụng</button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link rounded-pill py-1 px-3 fw-bold" :class="{ 'active': periodFilter === 'UPCOMING' }" @click="periodFilter = 'UPCOMING'">Sắp diễn ra</button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link rounded-pill py-1 px-3 fw-bold" :class="{ 'active': periodFilter === 'EXPIRED' }" @click="periodFilter = 'EXPIRED'">Đã kết thúc</button>
                  </li>
                </ul>
                <!-- THANH TÌM KIẾM -->
                <div class="input-group input-group-sm" style="width: 250px;">
                  <span class="input-group-text bg-body border-secondary-subtle"><i class="fas fa-search text-body-secondary"></i></span>
                  <input type="text" v-model="periodSearchQuery" class="form-control bg-body border-secondary-subtle" placeholder="Tìm tên CT hoặc Hạng phòng...">
                </div>
              </div>
              <div class="card-body p-0 mt-2">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-secondary">
                      <tr>
                        <th class="px-4 py-3">Chương trình</th>
                        <th class="py-3">Hạng phòng</th>
                        <th class="py-3">Từ ngày</th>
                        <th class="py-3">Đến ngày</th>
                        <th class="py-3 text-end px-4">Hủy bỏ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="filteredAppliedPeriods.length === 0"><td colspan="5" class="text-center py-5 text-body-secondary">Không có dữ liệu phù hợp.</td></tr>
                      <tr v-else v-for="ap in filteredAppliedPeriods" :key="ap.id">
                        <td class="px-4 fw-bold text-primary">{{ ap.priceRate?.eventName }}</td>
                        <td class="fw-semibold text-body-emphasis">{{ ap.roomType?.name }}</td>
                        <td class="text-body-secondary small">{{ formatDate(ap.startDate) }}</td>
                        <td class="text-body-secondary small">{{ formatDate(ap.endDate) }}</td>
                        <td class="text-end px-4">
                          <button @click="deleteAppliedPeriod(ap.id)" class="btn btn-sm btn-outline-danger shadow-sm">
                            <i class="fas fa-times"></i>
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
      </div>
    </div>

    <!-- HỘP THOẠI XÁC NHẬN CUSTOM (Giao diện) -->
    <div v-if="showConfirmModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header border-0 pb-0 justify-content-center mt-3">
            <div :class="'text-' + confirmConfig.type" style="font-size: 3rem;">
              <i :class="confirmConfig.icon"></i>
            </div>
          </div>
          <div class="modal-body text-center pt-2 pb-4 px-4">
            <h5 class="fw-bold mb-3 text-body-emphasis">{{ confirmConfig.title }}</h5>
            <p class="text-body-secondary mb-0" style="font-size: 0.95rem;">{{ confirmConfig.message }}</p>
          </div>
          <div class="modal-footer bg-body border-0 d-flex justify-content-center rounded-bottom-4 py-3 gap-2">
            <button type="button" class="btn btn-secondary px-4 fw-semibold" @click="closeConfirm">Hủy</button>
            <button type="button" class="btn px-4 fw-bold" :class="'btn-' + confirmConfig.type" @click="executeConfirm">Đồng ý</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../../utils/axios'

const priceRates = ref([])
const appliedPeriods = ref([])
const roomTypes = ref([])
const isLoading = ref(true)
const isProcessing = ref(false)
const notification = ref({ type: '', message: '' })

// Form 1: Tạo sự kiện (Price Rate)
const isEditModePR = ref(false)
const prForm = ref({ priceRateId: '', eventName: '', type: 'DISCOUNT', amount: 0 })

// Form 2: Tạo kỳ áp dụng
const apForm = ref({ priceRateId: '', roomTypeId: '', startDate: '', endDate: '' })

// Tính năng Filter cho Kỳ áp dụng
const periodFilter = ref('ACTIVE') // ACTIVE, UPCOMING, EXPIRED
const periodSearchQuery = ref('')

const filteredAppliedPeriods = computed(() => {
  const now = new Date().getTime()
  const q = periodSearchQuery.value.toLowerCase().trim()
  
  return appliedPeriods.value.filter(ap => {
    // Tìm kiếm theo tên chiến dịch hoặc tên hạng phòng
    const eventName = ap.priceRate?.eventName || ''
    const roomName = ap.roomType?.name || ''
    const matchSearch = eventName.toLowerCase().includes(q) || roomName.toLowerCase().includes(q)
    
    if (!matchSearch) return false

    // Lọc theo trạng thái thời gian
    const start = new Date(ap.startDate).getTime()
    const end = new Date(ap.endDate).getTime()

    if (periodFilter.value === 'ACTIVE') {
      return start <= now && end >= now
    } else if (periodFilter.value === 'UPCOMING') {
      return start > now
    } else if (periodFilter.value === 'EXPIRED') {
      return end < now
    }
    
    return true
  })
})

// Biến quản lý Custom Confirm Modal
const showConfirmModal = ref(false)
const confirmConfig = ref({ title: '', message: '', type: 'danger', icon: 'fas fa-exclamation-circle', action: null })

const showNotification = (type, message) => {
  notification.value = { type, message }
  setTimeout(() => notification.value.message = '', 5000)
}

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price)
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// --- LOGIC CUSTOM CONFIRM MODAL ---
const openConfirm = (title, message, type, icon, actionCallback) => {
  confirmConfig.value = { title, message, type, icon, action: actionCallback }
  showConfirmModal.value = true
}

const closeConfirm = () => {
  showConfirmModal.value = false
  confirmConfig.value.action = null
}

const executeConfirm = () => {
  if (confirmConfig.value.action) confirmConfig.value.action()
  closeConfirm()
}

// ----------------------------------
const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/manager/operation/dashboard')
    priceRates.value = res.data.priceRates || []
    appliedPeriods.value = res.data.appliedPeriods || []
    roomTypes.value = res.data.roomTypes || []
  } catch (error) {
    showNotification('danger', 'Không thể tải dữ liệu.')
  } finally {
    isLoading.value = false
  }
}

// --- LOGIC TAB 1: SỰ KIỆN GIÁ ---
const editPriceRate = (pr) => {
  isEditModePR.value = true
  prForm.value = {
    priceRateId: pr.id,
    eventName: pr.eventName,
    type: pr.surchargeAmount < 0 ? 'DISCOUNT' : 'SURCHARGE',
    amount: Math.abs(pr.surchargeAmount)
  }
}

const cancelEditPR = () => {
  isEditModePR.value = false
  prForm.value = { priceRateId: '', eventName: '', type: 'DISCOUNT', amount: 0 }
}

const submitPriceRate = () => {
  if (isEditModePR.value) {
    openConfirm(
      'Cảnh báo thay đổi', 
      'Chương trình này có thể đang được áp dụng. Việc thay đổi sẽ cập nhật giá mới cho các lượt book tương lai. Bạn chắc chắn?', 
      'warning', 
      'fas fa-exclamation-triangle',
      executeSubmitPriceRate
    )
  } else {
    executeSubmitPriceRate()
  }
}

const executeSubmitPriceRate = async () => {
  isProcessing.value = true
  try {
    const finalAmount = prForm.value.type === 'DISCOUNT' ? -Math.abs(prForm.value.amount) : Math.abs(prForm.value.amount)
    
    await api.post('/api/manager/operation/price-rates', {
      priceRateId: prForm.value.priceRateId,
      eventName: prForm.value.eventName,
      surchargeAmount: finalAmount
    })
    showNotification('success', isEditModePR.value ? 'Cập nhật chương trình giá thành công!' : 'Tạo chương trình giá thành công!')
    cancelEditPR()
    fetchData()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Có lỗi xảy ra.')
  } finally {
    isProcessing.value = false
  }
}

const deletePriceRate = (id) => {
  openConfirm(
    'Xác nhận xóa', 
    'Bạn chắc chắn muốn xóa chương trình giá này? Hành động này không thể hoàn tác.', 
    'danger', 
    'fas fa-trash-alt',
    async () => {
      try {
        await api.delete(`/api/manager/operation/price-rates/${id}`)
        showNotification('success', 'Đã xóa chương trình giá thành công.')
        fetchData()
      } catch (error) {
        showNotification('danger', error.response?.data?.error || 'Không thể xóa chương trình giá này.')
      }
    }
  )
}

// --- LOGIC TAB 2: KỲ ÁP DỤNG ---
const submitAppliedPeriod = async () => {
  isProcessing.value = true
  try {
    const payload = {
      priceRateId: apForm.value.priceRateId,
      roomTypeId: apForm.value.roomTypeId,
      startDate: apForm.value.startDate + ':00',
      endDate: apForm.value.endDate + ':00'
    }
    
    await api.post('/api/manager/operation/applied-periods', payload)
    showNotification('success', 'Đã kích hoạt áp dụng thành công!')
    apForm.value = { priceRateId: '', roomTypeId: '', startDate: '', endDate: '' }
    fetchData()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Ngày kết thúc phải sau ngày bắt đầu.')
  } finally {
    isProcessing.value = false
  }
}

const deleteAppliedPeriod = (id) => {
  openConfirm(
    'Hủy áp dụng', 
    'Hành động này sẽ mang giá phòng về mức gốc cho các lượt book trong thời gian tới. Bạn muốn tiếp tục?', 
    'danger', 
    'fas fa-calendar-times',
    async () => {
      try {
        await api.delete(`/api/manager/operation/applied-periods/${id}`)
        showNotification('success', 'Đã hủy áp dụng.')
        fetchData()
      } catch (error) {
        showNotification('danger', 'Có lỗi xảy ra khi hủy.')
      }
    }
  )
}

onMounted(() => fetchData())
</script>

<style scoped>
.nav-pills .nav-link {
  color: var(--bs-body-color);
  background-color: transparent;
  border: 1px solid transparent;
  transition: all 0.2s ease-in-out;
}
.nav-pills .nav-link.active {
  color: #fff;
  background-color: #0d6efd;
  box-shadow: 0 4px 6px rgba(13, 110, 253, 0.2);
}
.nav-pills .nav-link:hover:not(.active) {
  background-color: var(--bs-secondary-bg);
}

/* Nav ngang nhỏ tùy chỉnh */
.custom-nav-pills .nav-link {
  color: var(--bs-body-color);
  border: 1px solid var(--bs-border-color);
  background-color: var(--bs-body-bg);
  margin-right: 5px;
}
.custom-nav-pills .nav-link.active {
  color: #fff;
  background-color: #0d6efd;
  border-color: #0d6efd;
}
.custom-nav-pills .nav-link:hover:not(.active) {
  background-color: var(--bs-secondary-bg);
}

/* Dark Mode Hover Fix */
[data-bs-theme="dark"] .nav-pills .nav-link:hover:not(.active) {
  background-color: rgba(255,255,255,0.05);
}
</style>