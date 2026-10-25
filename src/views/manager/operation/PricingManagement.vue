<template>
  <div class="position-relative">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Quản lý Chiến lược Giá</h3>
        <p class="text-muted small mb-0">Thiết lập các chương trình Giảm giá/Phụ thu và thời gian áp dụng.</p>
      </div>
    </div>

    <!-- Thông báo Alert -->
    <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
      {{ notification.message }}
      <button type="button" class="btn-close" @click="notification.message = ''"></button>
    </div>

    <!-- Điều hướng Tabs -->
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
      
      <!-- TAB 1: SỰ KIỆN GIÁ -->
      <div class="tab-pane fade show active" id="events" role="tabpanel">
        <div class="row g-4">
          <!-- Form tạo/sửa sự kiện -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold text-primary mb-0">
                  <i :class="isEditModePR ? 'fas fa-edit' : 'fas fa-plus-circle'" class="me-2"></i>
                  {{ isEditModePR ? 'Cập nhật Chương trình' : 'Tạo Chương trình mới' }}
                </h5>
                <button v-if="isEditModePR" @click="cancelEditPR" class="btn btn-sm btn-outline-secondary rounded-circle" title="Hủy sửa"><i class="fas fa-times"></i></button>
              </div>
              <div class="card-body p-4">
                <form @submit.prevent="submitPriceRate">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Tên sự kiện / Chiến dịch <span class="text-danger">*</span></label>
                    <input v-model="prForm.eventName" type="text" class="form-control" required placeholder="VD: Ưu đãi Lễ 30/4, Flash Sale...">
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Hình thức <span class="text-danger">*</span></label>
                    <select v-model="prForm.type" class="form-select border-primary text-primary fw-bold" required>
                      <option value="DISCOUNT">Giảm giá (Khuyến mãi)</option>
                      <option value="SURCHARGE">Tăng giá (Phụ thu)</option>
                    </select>
                  </div>
                  <div class="mb-4">
                    <label class="form-label fw-semibold">Mức điều chỉnh (%) <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <input v-model="prForm.amount" type="number" min="0" max="100" step="0.1" class="form-control fw-bold text-end" required placeholder="VD: 15">
                      <span class="input-group-text fw-bold">%</span>
                    </div>
                    <small class="text-muted" v-if="prForm.type === 'DISCOUNT'">Hệ thống sẽ giảm <b>{{ prForm.amount }}%</b> so với giá gốc.</small>
                    <small class="text-muted" v-else>Hệ thống sẽ tăng <b>{{ prForm.amount }}%</b> so với giá gốc.</small>
                  </div>
                  <button type="submit" class="btn w-100 fw-bold rounded-3" :class="isEditModePR ? 'btn-warning text-dark' : 'btn-primary'" :disabled="isProcessing">
                    <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> 
                    {{ isEditModePR ? 'Lưu Thay Đổi' : 'Xác nhận Tạo' }}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- Bảng danh sách sự kiện -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm rounded-4 h-100">
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr>
                        <th class="px-4 py-3">Tên chiến dịch</th>
                        <th class="py-3 text-end">Biến động (%)</th>
                        <th class="py-3 text-end px-4">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="priceRates.length === 0"><td colspan="3" class="text-center py-4 text-muted">Chưa có chương trình nào.</td></tr>
                      <tr v-else v-for="pr in priceRates" :key="pr.id" :class="{'bg-light': prForm.priceRateId === pr.id}">
                        <td class="px-4 fw-bold">{{ pr.eventName }}</td>
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
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
                <h5 class="fw-bold text-success"><i class="fas fa-clock me-2"></i>Áp dụng Chương trình</h5>
              </div>
              <div class="card-body p-4">
                <form @submit.prevent="submitAppliedPeriod">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Chương trình <span class="text-danger">*</span></label>
                    <select v-model="apForm.priceRateId" class="form-select" required>
                      <option value="" disabled>-- Chọn chương trình --</option>
                      <option v-for="pr in priceRates" :key="pr.id" :value="pr.id">{{ pr.eventName }} ({{ pr.surchargeAmount < 0 ? 'Giảm' : 'Tăng' }} {{ Math.abs(pr.surchargeAmount) }}%)</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Áp dụng cho Hạng phòng <span class="text-danger">*</span></label>
                    <select v-model="apForm.roomTypeId" class="form-select" required>
                      <option value="" disabled>-- Chọn hạng phòng --</option>
                      <option v-for="rt in roomTypes" :key="rt.id" :value="rt.id">{{ rt.name }} (Giá gốc: {{ formatPrice(rt.basePrice) }})</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Bắt đầu từ <span class="text-danger">*</span></label>
                    <input v-model="apForm.startDate" type="datetime-local" class="form-control" required>
                  </div>
                  <div class="mb-4">
                    <label class="form-label fw-semibold">Kết thúc vào <span class="text-danger">*</span></label>
                    <input v-model="apForm.endDate" type="datetime-local" class="form-control" required>
                  </div>
                  <button type="submit" class="btn btn-success w-100 fw-bold rounded-3" :disabled="isProcessing">
                    <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Kích hoạt
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- Bảng danh sách kỳ áp dụng -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm rounded-4 h-100">
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr>
                        <th class="px-4 py-3">Chương trình</th>
                        <th class="py-3">Hạng phòng</th>
                        <th class="py-3">Từ ngày</th>
                        <th class="py-3">Đến ngày</th>
                        <th class="py-3 text-end px-4">Hủy bỏ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="appliedPeriods.length === 0"><td colspan="5" class="text-center py-4 text-muted">Chưa có kỳ áp dụng nào.</td></tr>
                      <tr v-else v-for="ap in appliedPeriods" :key="ap.id">
                        <td class="px-4 fw-bold text-primary">{{ ap.priceRate?.eventName }}</td>
                        <td class="fw-semibold">{{ ap.roomType?.name }}</td>
                        <td>{{ formatDate(ap.startDate) }}</td>
                        <td>{{ formatDate(ap.endDate) }}</td>
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

    <!-- HỘP THOẠI XÁC NHẬN CUSTOM (Giao diện đẹp hơn) -->
    <div v-if="showConfirmModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header border-0 pb-0 justify-content-center mt-3">
            <div :class="'text-' + confirmConfig.type" style="font-size: 3rem;">
              <i :class="confirmConfig.icon"></i>
            </div>
          </div>
          <div class="modal-body text-center pt-2 pb-4 px-4">
            <h5 class="fw-bold mb-3">{{ confirmConfig.title }}</h5>
            <p class="text-muted mb-0" style="font-size: 0.95rem;">{{ confirmConfig.message }}</p>
          </div>
          <div class="modal-footer bg-light border-0 d-flex justify-content-center rounded-bottom-4 py-3 gap-2">
            <button type="button" class="btn btn-light border px-4 fw-semibold" @click="closeConfirm">Hủy bỏ</button>
            <button type="button" class="btn px-4 fw-bold" :class="'btn-' + confirmConfig.type" @click="executeConfirm">Đồng ý</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../../utils/axios'

const priceRates = ref([])
const appliedPeriods = ref([])
const roomTypes = ref([])

const isLoading = ref(true)
const isProcessing = ref(false)
const notification = ref({ type: '', message: '' })

// Form 1: Tạo/Sửa sự kiện (Price Rate)
const isEditModePR = ref(false)
const prForm = ref({ priceRateId: '', eventName: '', type: 'DISCOUNT', amount: 0 })

// Form 2: Tạo kỳ áp dụng
const apForm = ref({ priceRateId: '', roomTypeId: '', startDate: '', endDate: '' })

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
    // Mở Custom Modal Cảnh Báo
    openConfirm(
      'Cảnh báo thay đổi', 
      'Chương trình này có thể đang được áp dụng. Việc thay đổi sẽ lập tức cập nhật giá mới cho các lượt book từ thời điểm này. Bạn có chắc chắn?', 
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
  // Mở Custom Modal Xóa
  openConfirm(
    'Xác nhận Xóa', 
    'Bạn có chắc chắn muốn xóa chương trình giá này? Hành động này không thể hoàn tác.', 
    'danger', 
    'fas fa-trash-alt',
    async () => {
      try {
        await api.delete(`/api/manager/operation/price-rates/${id}`)
        showNotification('success', 'Đã xóa chương trình giá thành công.')
        fetchData()
      } catch (error) {
        showNotification('danger', error.response?.data?.error || 'Không thể xóa chương trình này.')
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
    showNotification('success', 'Đã kích hoạt kỳ áp dụng thành công!')
    apForm.value = { priceRateId: '', roomTypeId: '', startDate: '', endDate: '' }
    fetchData()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Ngày kết thúc phải sau ngày bắt đầu.')
  } finally {
    isProcessing.value = false
  }
}

const deleteAppliedPeriod = (id) => {
  // Mở Custom Modal Hủy
  openConfirm(
    'Hủy Kỳ Áp Dụng', 
    'Hệ thống sẽ quay về giá gốc đối với các phòng chưa được book trong giai đoạn này. Bạn muốn tiếp tục?', 
    'danger', 
    'fas fa-calendar-times',
    async () => {
      try {
        await api.delete(`/api/manager/operation/applied-periods/${id}`)
        showNotification('success', 'Đã hủy kỳ áp dụng.')
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
  color: #6c757d;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease-in-out;
}
.nav-pills .nav-link.active {
  color: #fff;
  background-color: #0d6efd;
  border-color: #0d6efd;
  box-shadow: 0 4px 6px rgba(13, 110, 253, 0.2);
}
.nav-pills .nav-link:hover:not(.active) {
  background-color: #e9ecef;
}
</style>