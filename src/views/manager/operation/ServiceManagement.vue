<template>
  <div class="position-relative">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Quản lý Dịch vụ Bổ sung</h3>
        <p class="text-muted small mb-0">Thiết lập các dịch vụ ăn uống, giặt ủi, spa... và tải ảnh đại diện.</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary shadow-sm fw-bold">
        <i class="fas fa-plus me-2"></i> Thêm Dịch vụ
      </button>
    </div>

    <!-- Thông báo Alert -->
    <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
      {{ notification.message }}
      <button type="button" class="btn-close" @click="notification.message = ''"></button>
    </div>

    <!-- Bảng danh sách Dịch vụ -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
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
                <td colspan="6" class="text-center py-5 text-muted">Chưa có dịch vụ nào.</td>
              </tr>
              <tr v-else v-for="s in services" :key="s.id">
                <td class="px-4">
                  <img :src="getImageUrl(s.imagePath)" 
                       class="rounded-3 shadow-sm border" 
                       style="width: 55px; height: 55px; object-fit: cover; background-color: #f8f9fa;"
                       @error="handleImageError" alt="Thumbnail">
                </td>
                <td class="fw-bold text-primary">{{ s.name }}
                  <div v-if="s.description" class="text-muted small fw-normal text-truncate" style="max-width: 200px;">{{ s.description }}</div>
                </td>
                <td class="text-end fw-bold text-success">{{ formatPrice(s.basePrice) }}</td>
                <td class="text-center"><span class="badge bg-light text-dark border">{{ s.unit }}</span></td>
                <td class="text-center">
                  <span :class="s.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'" class="badge">
                    {{ s.status === 'ACTIVE' ? 'ĐANG BÁN' : 'TẠM NGƯNG' }}
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

    <!-- MODAL THÊM/SỬA DỊCH VỤ -->
    <div v-if="showModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
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
                  <label class="form-label fw-semibold">Tên dịch vụ <span class="text-danger">*</span></label>
                  <input v-model="form.name" type="text" class="form-control" required placeholder="VD: Nước suối Dasani, Giặt ủi...">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Đơn giá (VNĐ) <span class="text-danger">*</span></label>
                  <input v-model="form.basePrice" type="number" min="0" class="form-control fw-bold text-success" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Đơn vị tính <span class="text-danger">*</span></label>
                  <input v-model="form.unit" type="text" class="form-control" required placeholder="VD: Chai, Lon, Kg, Lượt...">
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold">Trạng thái <span class="text-danger">*</span></label>
                  <select v-model="form.status" class="form-select" required>
                    <option v-for="st in serviceStatuses" :key="st" :value="st">{{ st === 'ACTIVE' ? 'ĐANG BÁN' : 'TẠM NGƯNG' }}</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold">Mô tả thêm (Không bắt buộc)</label>
                  <textarea v-model="form.description" class="form-control" rows="2" placeholder="Ghi chú chi tiết..."></textarea>
                </div>

                <div class="col-12 mt-3">
                  <label class="form-label fw-semibold"><i class="fas fa-image text-primary me-2"></i>Ảnh đại diện</label>
                  
                  <div v-if="isEditMode && currentImagePath" class="d-flex align-items-center mb-2 p-2 border rounded bg-light">
                    <img :src="getImageUrl(currentImagePath)" class="rounded shadow-sm me-3" style="width: 50px; height: 50px; object-fit: cover;">
                    <span class="small text-muted">Ảnh hiện tại trên hệ thống. Trống khung dưới nếu giữ nguyên.</span>
                  </div>

                  <input type="file" class="form-control" accept="image/*" @change="handleImage">
                  <small class="text-muted">Định dạng JPG, PNG. {{ isEditMode ? 'Chọn ảnh mới sẽ ghi đè ảnh cũ.' : '' }}</small>
                </div>
                
              </div>
            </div>
            <div class="modal-footer bg-light border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary" @click="closeModal">Hủy bỏ</button>
              <button type="submit" class="btn btn-primary fw-bold" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> 
                {{ isEditMode ? 'Lưu thay đổi' : 'Xác nhận Thêm' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- HỘP THOẠI XÁC NHẬN CUSTOM -->
    <div v-if="showConfirmModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header border-0 pb-0 justify-content-center mt-3">
            <div class="text-danger" style="font-size: 3rem;">
              <i class="fas fa-trash-alt"></i>
            </div>
          </div>
          <div class="modal-body text-center pt-2 pb-4 px-4">
            <h5 class="fw-bold mb-3">Xác nhận Xóa</h5>
            <p class="text-muted mb-0" style="font-size: 0.95rem;">Bạn có chắc chắn muốn xóa dịch vụ này? Nếu dịch vụ đã từng được khách sử dụng, hệ thống sẽ chặn xóa.</p>
          </div>
          <div class="modal-footer bg-light border-0 d-flex justify-content-center rounded-bottom-4 py-3 gap-2">
            <button type="button" class="btn btn-light border px-4 fw-semibold" @click="closeConfirm">Hủy bỏ</button>
            <button type="button" class="btn px-4 fw-bold btn-danger" @click="executeConfirm">Đồng ý</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../../utils/axios'

const services = ref([])
const serviceStatuses = ref([])

const isLoading = ref(true)
const isProcessing = ref(false)
const showModal = ref(false)
const isEditMode = ref(false)
const notification = ref({ type: '', message: '' })

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

const getImageUrl = (path) => {
  return path ? `http://localhost:8080${path}` : 'https://placehold.co/100x100?text=No+Image'
}
const handleImageError = (e) => { e.target.src = 'https://placehold.co/100x100?text=Error' }

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/manager/operation/dashboard')
    services.value = res.data.services || []
    serviceStatuses.value = res.data.serviceStatuses || []
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
      showNotification('danger', error.response?.data?.error || 'Không thể xóa dịch vụ này.')
    }
  })
}

onMounted(() => fetchData())
</script>