<template>
  <div class="position-relative">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-body-emphasis mb-1">Quản lý Dịch vụ</h3>
        <p class="text-body-secondary small mb-0">Thiết lập danh sách và theo dõi lịch sử sử dụng dịch vụ của khách hàng.</p>
      </div>
      <!-- Nút Thêm Dịch vụ chỉ hiện ở Tab Cấu hình -->
      <button v-if="activeTab === 'services'" @click="openCreateModal" class="btn btn-primary shadow-sm fw-bold">
        <i class="fas fa-plus me-2"></i> Thêm Dịch vụ
      </button>
    </div>

    <!-- Thông báo Alert -->
    <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
      {{ notification.message }}
      <button type="button" class="btn-close" @click="notification.message = ''"></button>
    </div>

    <!-- Thanh Điều Hướng Ngang (Nav Pills) -->
    <ul class="nav nav-pills mb-4 gap-2" role="tablist">
      <li class="nav-item">
        <button class="nav-link fw-bold px-4 rounded-pill" :class="{ active: activeTab === 'services' }" @click="activeTab = 'services'">
          <i class="fas fa-concierge-bell me-2"></i>Cấu hình Danh sách
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link fw-bold px-4 rounded-pill" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
          <i class="fas fa-history me-2"></i>Lịch sử Sử dụng
        </button>
      </li>
    </ul>

    <div class="tab-content">
      <!-- TAB 1: CẤU HÌNH DANH SÁCH DỊCH VỤ -->
      <div v-if="activeTab === 'services'" class="card border-0 shadow-sm rounded-4 overflow-hidden bg-body-tertiary">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-secondary">
                <tr>
                  <th class="px-4 py-3" style="width: 90px;">Ảnh</th>
                  <th class="py-3">Tên dịch vụ</th>
                  <th class="py-3 text-end">Đơn giá (VNĐ)</th>
                  <th class="py-3 text-center">Đơn vị tính</th>
                  <th class="py-3 text-center">Trạng thái</th>
                  <th class="py-3 text-end px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="6" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
                <tr v-else-if="services.length === 0">
                  <td colspan="6" class="text-center py-5 text-body-secondary">Chưa có dịch vụ nào.</td>
                </tr>
                <tr v-else v-for="s in services" :key="s.id">
                  <td class="px-4">
                    <img :src="getImageUrl(s.imagePath)" 
                         class="rounded-3 shadow-sm border border-secondary-subtle bg-white" 
                         style="width: 55px; height: 55px; object-fit: cover;"
                         @error="handleImageError" alt="Thumbnail">
                  </td>
                  <td class="fw-bold text-primary">{{ s.name }}
                    <div v-if="s.description" class="text-body-secondary small fw-normal text-truncate" style="max-width: 200px;">{{ s.description }}</div>
                  </td>
                  <td class="text-end fw-bold text-success">{{ formatPrice(s.basePrice) }}</td>
                  <td class="text-center"><span class="badge bg-body-secondary text-body-emphasis border border-secondary-subtle">{{ s.unit }}</span></td>
                  <td class="text-center">
                    <span :class="s.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'" class="badge">
                      {{ s.status === 'ACTIVE' ? 'ĐANG BÁN' : 'TẠM NGỪNG' }}
                    </span>
                  </td>
                  <td class="text-end px-4">
                    <button @click="openEditModal(s)" class="btn btn-sm btn-outline-primary shadow-sm me-2" title="Chỉnh sửa">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="deleteService(s.id)" class="btn btn-sm btn-outline-danger shadow-sm" title="Xóa">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: LỊCH SỬ SỬ DỤNG DỊCH VỤ -->
      <div v-if="activeTab === 'history'" class="card border-0 shadow-sm rounded-4 overflow-hidden bg-body-tertiary">
        <div class="card-header bg-transparent border-bottom-0 pt-4 pb-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h5 class="fw-bold text-primary mb-0"><i class="fas fa-receipt me-2"></i>Lịch sử Phục vụ</h5>
          
          <!-- Thanh tìm kiếm -->
          <div class="input-group input-group-sm" style="width: 250px;">
            <span class="input-group-text bg-body border-secondary-subtle"><i class="fas fa-search text-body-secondary"></i></span>
            <input type="text" v-model="historySearchQuery" class="form-control bg-body border-secondary-subtle" placeholder="Tìm tên dịch vụ...">
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-secondary">
                <tr>
                  <th class="px-4 py-3">Thời gian</th>
                  <th class="py-3">Mã đơn thuê</th>
                  <th class="py-3">Tên dịch vụ</th>
                  <th class="py-3 text-center">Số lượng</th>
                  <th class="py-3 text-end px-4">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="5" class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></td>
                </tr>
                <tr v-else-if="filteredHistory.length === 0">
                  <td colspan="5" class="text-center py-5 text-body-secondary">Không tìm thấy lịch sử phù hợp.</td>
                </tr>
                <tr v-else v-for="h in filteredHistory" :key="h.id">
                  <td class="px-4 text-body-secondary small">{{ formatDate(h.time) }}</td>
                  <td class="fw-semibold text-body-emphasis">{{ h.rentalDetail?.rental?.id || 'N/A' }}</td>
                  <td class="fw-bold text-primary">{{ h.service?.name }}</td>
                  <td class="text-center fw-bold">{{ h.count }} {{ h.service?.unit }}</td>
                  <td class="text-end px-4 fw-bold text-danger">{{ formatPrice((h.count || 0) * (h.unitPrice || 0)) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL THÊM/SỬA DỊCH VỤ -->
    <div v-if="showModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold">
              <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-plus-circle'" class="me-2"></i>
              {{ isEditMode ? 'Cập nhật Dịch vụ' : 'Thêm Dịch vụ mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="submitForm">
            <div class="modal-body p-4">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label fw-semibold text-body-secondary">Tên dịch vụ <span class="text-danger">*</span></label>
                  <input v-model="form.name" type="text" class="form-control bg-body" required placeholder="VD: Nước suối Dasani, Giặt ủi...">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary">Đơn giá (VNĐ) <span class="text-danger">*</span></label>
                  <input v-model="form.basePrice" type="number" min="0" class="form-control bg-body fw-bold text-success" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary">Đơn vị tính <span class="text-danger">*</span></label>
                  <input v-model="form.unit" type="text" class="form-control bg-body" required placeholder="VD: Chai, Lon, Kg, Lít...">
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold text-body-secondary">Trạng thái <span class="text-danger">*</span></label>
                  <select v-model="form.status" class="form-select bg-body" required>
                    <option v-for="st in serviceStatuses" :key="st" :value="st">{{ st === 'ACTIVE' ? 'ĐANG BÁN' : 'TẠM NGỪNG' }}</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold text-body-secondary">Mô tả thêm (Không bắt buộc)</label>
                  <textarea v-model="form.description" class="form-control bg-body" rows="2" placeholder="Ghi chú chi tiết..."></textarea>
                </div>

                <div class="col-12 mt-3">
                  <label class="form-label fw-semibold text-body-secondary"><i class="fas fa-image text-primary me-2"></i>Ảnh đại diện</label>
                  
                  <div v-if="isEditMode && currentImagePath" class="d-flex align-items-center mb-2 p-2 border border-secondary-subtle rounded bg-body">
                    <img :src="getImageUrl(currentImagePath)" class="rounded shadow-sm bg-white me-3" style="width: 50px; height: 50px; object-fit: cover;">
                    <span class="small text-body-secondary">Ảnh hiện tại trên hệ thống. Trống khung dưới để giữ nguyên.</span>
                  </div>
                  <input type="file" class="form-control bg-body" accept="image/*" @change="handleImage">
                  <small class="text-body-secondary">Định dạng JPG, PNG. {{ isEditMode ? 'Chỉ chọn ảnh mới nếu muốn đổi ảnh cũ.' : '' }}</small>
                </div>
              </div>
            </div>
            <div class="modal-footer bg-body border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary" @click="closeModal">Hủy</button>
              <button type="submit" class="btn btn-primary fw-bold" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> 
                {{ isEditMode ? 'Lưu thay đổi' : 'Xác nhận Thêm' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- HỘP THOẠI XÁC NHẬN CUSTOM (Xóa Dịch Vụ) -->
    <div v-if="showConfirmModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header border-0 pb-0 justify-content-center mt-3">
            <div class="text-danger" style="font-size: 3rem;">
              <i class="fas fa-trash-alt"></i>
            </div>
          </div>
          <div class="modal-body text-center pt-2 pb-4 px-4">
            <h5 class="fw-bold mb-3 text-body-emphasis">Xác nhận xóa</h5>
            <p class="text-body-secondary mb-0" style="font-size: 0.95rem;">Bạn chắc chắn muốn xóa dịch vụ này? Nếu dịch vụ đã được khách sử dụng, hệ thống sẽ từ chối xóa.</p>
          </div>
          <div class="modal-footer bg-body border-0 d-flex justify-content-center rounded-bottom-4 py-3 gap-2">
            <button type="button" class="btn btn-secondary px-4 fw-semibold" @click="closeConfirm">Hủy</button>
            <button type="button" class="btn px-4 fw-bold btn-danger" @click="executeConfirm">Đồng ý</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../../utils/axios'

const activeTab = ref('services') // Tab điều hướng ngang
const services = ref([])
const serviceUsages = ref([]) // Mảng lưu lịch sử sử dụng dịch vụ
const serviceStatuses = ref([])
const isLoading = ref(true)
const isProcessing = ref(false)
const showModal = ref(false)
const isEditMode = ref(false)
const notification = ref({ type: '', message: '' })

// Search bar cho Lịch sử
const historySearchQuery = ref('')

const form = ref({
  serviceId: '', name: '', description: '', unit: '', basePrice: 0, status: 'ACTIVE'
})
const imageFile = ref(null)
const currentImagePath = ref(null)

// Confirm Modal Logic
const showConfirmModal = ref(false)
const confirmAction = ref(null)

const openConfirm = (actionCallback) => {
  confirmAction.value = actionCallback
  showConfirmModal.value = true
}
const closeConfirm = () => {
  showConfirmModal.value = false
  confirmAction.value = null
}
const executeConfirm = () => {
  if (confirmAction.value) confirmAction.value()
  closeConfirm()
}

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

const getImageUrl = (path) => {
  return path ? `https://api.ct296.id.vn${path}` : 'https://placehold.co/100x100?text=No+Image'
}
const handleImageError = (e) => { e.target.src = 'https://placehold.co/100x100?text=Error' }

// Computed filter cho Lịch sử
const filteredHistory = computed(() => {
  if (!historySearchQuery.value.trim()) return serviceUsages.value
  const q = historySearchQuery.value.toLowerCase().trim()
  return serviceUsages.value.filter(h => h.service?.name?.toLowerCase().includes(q))
})

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/manager/operation/dashboard')
    services.value = res.data.services || []
    serviceStatuses.value = res.data.serviceStatuses || []
    
    // Nếu API có trả về danh sách sử dụng dịch vụ (serviceUsages)
    serviceUsages.value = res.data.serviceUsages || []
  } catch (error) {
    showNotification('danger', 'Không thể tải dữ liệu dịch vụ.')
  } finally {
    isLoading.value = false
  }
}

const handleImage = (event) => {
  imageFile.value = event.target.files.length > 0 ? event.target.files[0] : null
}

const openCreateModal = () => {
  isEditMode.value = false
  form.value = { serviceId: '', name: '', description: '', unit: '', basePrice: 0, status: 'ACTIVE' }
  imageFile.value = null
  currentImagePath.value = null
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) fileInput.value = ''
  showModal.value = true
}

const openEditModal = (s) => {
  isEditMode.value = true
  form.value = { 
    serviceId: s.id, 
    name: s.name, 
    description: s.description || '', 
    unit: s.unit, 
    basePrice: s.basePrice, 
    status: s.status 
  }
  imageFile.value = null
  currentImagePath.value = s.imagePath
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) fileInput.value = ''
  showModal.value = true
}

const closeModal = () => showModal.value = false

const submitForm = async () => {
  isProcessing.value = true
  try {
    const formData = new FormData()
    if (isEditMode.value) formData.append('serviceId', form.value.serviceId)
    formData.append('name', form.value.name)
    if (form.value.description) formData.append('description', form.value.description)
    formData.append('unit', form.value.unit)
    formData.append('basePrice', form.value.basePrice)
    formData.append('status', form.value.status)
    
    if (imageFile.value) {
      formData.append('imageFile', imageFile.value)
    }

    await api.post('/api/manager/operation/services', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    showNotification('success', isEditMode.value ? 'Cập nhật dịch vụ thành công!' : 'Thêm dịch vụ mới thành công!')
    closeModal()
    fetchData()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Có lỗi xảy ra khi lưu.')
  } finally {
    isProcessing.value = false
  }
}

const deleteService = (id) => {
  openConfirm(async () => {
    try {
      await api.delete(`/api/manager/operation/services/${id}`)
      showNotification('success', 'Đã xóa dịch vụ.')
      fetchData()
    } catch (error) {
      // Backend sẽ quăng lỗi nếu countByServiceId > 0
      showNotification('danger', error.response?.data?.error || 'Không thể xóa dịch vụ này vì đã được sử dụng.')
    }
  })
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

/* Dark Mode Hover Fix cho Nav */
[data-bs-theme="dark"] .nav-pills .nav-link:hover:not(.active) {
  background-color: rgba(255,255,255,0.05);
}
</style>