<template>
  <div class="position-relative">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-body-emphasis mb-1">Quản lý Sự cố</h3>
        <p class="text-body-secondary small mb-0">Ghi nhận hư hỏng, phàn nàn và theo dõi trạng thái xử lý.</p>
      </div>
      <button @click="openCreateModal" class="btn btn-danger shadow-sm fw-bold">
        <i class="fas fa-exclamation-triangle me-2"></i> Báo cáo Sự cố
      </button>
    </div>

    <!-- Thông báo -->
    <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-info-circle me-2'"></i>
      {{ notification.message }}
      <button type="button" class="btn-close" @click="notification.message = ''"></button>
    </div>

    <!-- Bảng danh sách Sự cố (Kèm Bộ lọc & Tìm kiếm) -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-body-tertiary">
      <div class="card-header bg-transparent border-bottom-0 pt-4 pb-2 d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-3">
        <h5 class="fw-bold text-body-emphasis mb-0"><i class="fas fa-list-ul me-2 text-primary"></i>Danh sách Sự cố</h5>
        
        <!-- Thanh Công cụ (Đã fix lỗi rớt dòng) -->
        <div class="d-flex gap-2 overflow-x-auto pb-1">
          <div class="input-group input-group-sm" style="min-width: 220px;">
            <span class="input-group-text bg-body border-secondary-subtle"><i class="fas fa-search text-body-secondary"></i></span>
            <input type="text" v-model="searchQuery" class="form-control bg-body border-secondary-subtle text-body-emphasis" placeholder="Tìm tên sự cố, mô tả, phòng...">
          </div>
          <select v-model="filterStatus" class="form-select form-select-sm bg-body border-secondary-subtle text-body-emphasis" style="min-width: 140px; width: auto;">
            <option value="ALL">Mọi trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="RESOLVED">Đã xử lý</option>
          </select>
          <select v-model="sortOption" class="form-select form-select-sm bg-body border-secondary-subtle text-body-emphasis" style="min-width: 170px; width: auto;">
            <option value="NEWEST">Thời gian: Mới nhất</option>
            <option value="OLDEST">Thời gian: Cũ nhất</option>
            <option value="MONEY_DESC">Đền bù: Cao nhất</option>
          </select>
        </div>
      </div>

      <div class="card-body p-0 mt-2">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-secondary">
              <tr>
                <th class="px-4 py-3">Sự cố</th>
                <th class="py-3">Phòng</th>
                <th class="py-3">Thời gian</th>
                <th class="py-3 text-center">Trách nhiệm</th>
                <th class="py-3 text-end">Đền bù (VNĐ)</th>
                <th class="py-3 text-center">Trạng thái</th>
                <th class="py-3 text-end px-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="7" class="text-center py-5 text-body-secondary">
                  <div class="spinner-border text-danger spinner-border-sm me-2" role="status"></div> Đang tải...
                </td>
              </tr>
              <tr v-else-if="filteredAndSortedIncidents.length === 0">
                <td colspan="7" class="text-center py-5 text-body-secondary">
                  <i class="fas fa-search-minus fs-2 mb-3 opacity-50"></i>
                  <p class="mb-0">Không tìm thấy sự cố phù hợp.</p>
                </td>
              </tr>
              <tr v-else v-for="ic in filteredAndSortedIncidents" :key="ic.id">
                <td class="px-4">
                  <span class="fw-bold text-body-emphasis d-block">{{ ic.name }}</span>
                  <span class="text-body-secondary small text-truncate d-block" style="max-width: 200px;" :title="ic.description">{{ ic.description || 'Không có mô tả' }}</span>
                </td>
                <td class="fw-semibold text-primary">{{ ic.roomName || 'N/A' }}</td>
                <td class="text-body-secondary small">{{ formatDate(ic.occurTime) }}</td>
                <td class="text-center">
                  <span v-if="ic.responsible === 'CUSTOMER'" class="badge bg-danger">Khách hàng</span>
                  <span v-else-if="ic.responsible === 'HOTEL'" class="badge bg-primary">Khách sạn</span>
                  <span v-else class="badge bg-secondary">Khác</span>
                </td>
                <td class="text-end fw-semibold text-danger">{{ ic.money > 0 ? formatPrice(ic.money) : '-' }}</td>
                <td class="text-center">
                  <span :class="getStatusBadgeClass(ic.status)" class="badge">{{ ic.status === 'RESOLVED' ? 'Đã xử lý' : (ic.status === 'PROCESSING' ? 'Đang xử lý' : 'Chờ xử lý') }}</span>
                </td>
                <td class="text-end px-4">
                  <!-- Nút sửa chỉ hiện khi chưa RESOLVED -->
                  <button v-if="ic.status !== 'RESOLVED'" @click="openEditModal(ic)" class="btn btn-sm btn-outline-primary shadow-sm me-2" title="Cập nhật tiến độ">
                    <i class="fas fa-edit"></i> Cập nhật
                  </button>
                  <button v-else class="btn btn-sm btn-outline-secondary shadow-sm disabled" title="Phiếu đã đóng, không thể sửa">
                    <i class="fas fa-lock me-1"></i> Đã đóng
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL THÊM/SỬA SỰ CỐ -->
    <div v-if="showModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title fw-bold">
              <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-exclamation-circle'" class="me-2"></i>
              {{ isEditMode ? 'Cập nhật Sự cố' : 'Ghi nhận Sự cố mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="submitForm">
            <div class="modal-body p-4" style="max-height: 75vh; overflow-y: auto;">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label fw-semibold text-body-secondary small">Tên sự cố <span class="text-danger">*</span></label>
                  <input v-model="form.name" type="text" class="form-control bg-body text-body-emphasis" required placeholder="VD: Hỏng tivi, Rách ga giường...">
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold text-body-secondary small">Phòng xảy ra</label>
                  <select v-model="form.rentalDetailId" class="form-select bg-body text-body-emphasis">
                    <option value="">-- Không xác định --</option>
                    <option v-for="rt in activeRentals" :key="rt.id" :value="rt.id">Phòng {{ rt.roomName }}</option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-semibold text-body-secondary small">Thời gian phát hiện <span class="text-danger">*</span></label>
                  <input v-model="form.occurTime" type="datetime-local" class="form-control bg-body text-body-emphasis" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold text-body-secondary small">Bên chịu trách nhiệm</label>
                  <select v-model="form.responsible" class="form-select bg-body text-body-emphasis">
                    <option value="HOTEL">Khách sạn</option>
                    <option value="CUSTOMER">Khách hàng</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold text-body-secondary small">Trạng thái xử lý <span class="text-danger">*</span></label>
                  <select v-model="form.status" class="form-select fw-bold bg-body" :class="getStatusTextClass(form.status)" required>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="PROCESSING">Đang xử lý (Sửa chữa)</option>
                    <option value="RESOLVED">Đã giải quyết xong</option>
                  </select>
                </div>

                <div class="col-md-12">
                  <label class="form-label fw-semibold text-body-secondary small">Mô tả chi tiết</label>
                  <textarea v-model="form.description" class="form-control bg-body text-body-emphasis" rows="2" placeholder="Tình trạng cụ thể..."></textarea>
                </div>

                <!-- Khu vực đền bù & Hướng giải quyết -->
                <div class="col-md-12 mt-3 p-3 bg-body border border-secondary-subtle rounded-3">
                  <h6 class="fw-bold text-body-emphasis mb-3"><i class="fas fa-gavel me-2 text-warning"></i>Phương án giải quyết</h6>
                  <div class="row g-3">
                    <div class="col-md-4">
                      <label class="form-label fw-semibold text-danger small">Tiền phạt / Đền bù (VNĐ)</label>
                      <input v-model="form.money" type="number" min="0" class="form-control fw-bold bg-body text-body-emphasis border-danger" :disabled="form.responsible !== 'CUSTOMER'" placeholder="0">
                      <small v-if="form.responsible !== 'CUSTOMER'" class="text-body-secondary" style="font-size: 0.75rem;">Chỉ thu tiền nếu lỗi do Khách.</small>
                    </div>
                    <div class="col-md-8">
                      <label class="form-label fw-semibold text-body-secondary small">Cách xử lý (Ghi chú)</label>
                      <input v-model="form.handle" type="text" class="form-control bg-body text-body-emphasis" placeholder="VD: Thay mới, Cảnh cáo khách, Bảo trì tòa nhà...">
                    </div>
                  </div>
                </div>

              </div>
            </div>
            <div class="modal-footer bg-body border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary fw-semibold" @click="closeModal">Hủy bỏ</button>
              <button type="submit" class="btn btn-danger fw-bold" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> 
                {{ isEditMode ? 'Lưu thay đổi' : 'Ghi nhận Sự cố' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../../utils/axios'

const incidents = ref([])
const activeRentals = ref([])
const isLoading = ref(true)
const isProcessing = ref(false)
const showModal = ref(false)
const isEditMode = ref(false)
const notification = ref({ type: '', message: '' })

// Bộ lọc & Tìm kiếm
const searchQuery = ref('')
const filterStatus = ref('ALL') // ALL, PENDING, PROCESSING, RESOLVED
const sortOption = ref('NEWEST') // NEWEST, OLDEST, MONEY_DESC

// Computed để lọc và sắp xếp Sự cố
const filteredAndSortedIncidents = computed(() => {
  let result = incidents.value

  // Lọc theo trạng thái
  if (filterStatus.value !== 'ALL') {
    result = result.filter(ic => ic.status === filterStatus.value)
  }

  // Tìm kiếm theo tên, mô tả hoặc tên phòng
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(ic => 
      ic.name?.toLowerCase().includes(q) || 
      ic.description?.toLowerCase().includes(q) || 
      ic.roomName?.toString().toLowerCase().includes(q)
    )
  }

  // Sắp xếp
  if (sortOption.value === 'NEWEST') {
    result = result.slice().sort((a, b) => new Date(b.occurTime) - new Date(a.occurTime))
  } else if (sortOption.value === 'OLDEST') {
    result = result.slice().sort((a, b) => new Date(a.occurTime) - new Date(b.occurTime))
  } else if (sortOption.value === 'MONEY_DESC') {
    result = result.slice().sort((a, b) => (b.money || 0) - (a.money || 0))
  }

  return result
})

const form = ref({
  id: '', name: '', rentalDetailId: '', occurTime: '', 
  responsible: 'HOTEL', status: 'PENDING', description: '', money: 0, handle: ''
})

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price)
const formatDate = (dateString) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const getStatusBadgeClass = (status) => {
  if (status === 'RESOLVED') return 'bg-success'
  if (status === 'PROCESSING') return 'bg-warning text-dark'
  return 'bg-secondary'
}

const getStatusTextClass = (status) => {
  if (status === 'RESOLVED') return 'text-success'
  if (status === 'PROCESSING') return 'text-warning'
  return 'text-body-emphasis'
}

const showNotification = (type, message) => {
  notification.value = { type, message }
  setTimeout(() => notification.value.message = '', 5000)
}

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/manager/operation/incidents')
    incidents.value = res.data.incidents || []
    activeRentals.value = res.data.activeRentals || []
  } catch (error) {
    showNotification('danger', 'Không thể tải danh sách sự cố.')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  isEditMode.value = false
  
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  
  form.value = {
    id: '', name: '', rentalDetailId: '', 
    occurTime: now.toISOString().slice(0, 16), 
    responsible: 'HOTEL', status: 'PENDING', description: '', money: 0, handle: ''
  }
  showModal.value = true
}

const openEditModal = (ic) => {
  isEditMode.value = true
  form.value = { ...ic, rentalDetailId: ic.rentalDetailId || '' }
  if (form.value.occurTime) {
    form.value.occurTime = form.value.occurTime.slice(0, 16)
  }
  showModal.value = true
}

const closeModal = () => showModal.value = false

const submitForm = async () => {
  isProcessing.value = true
  try {
    if (form.value.responsible !== 'CUSTOMER') form.value.money = 0
    
    await api.post('/api/manager/operation/incidents', form.value)
    showNotification('success', isEditMode.value ? 'Cập nhật thành công!' : 'Đã ghi nhận sự cố!')
    closeModal()
    fetchData()
  } catch (error) {
    showNotification('danger', 'Có lỗi xảy ra khi lưu.')
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
/* Custom Scrollbar cho Modal dài */
.modal-body::-webkit-scrollbar { width: 6px; }
.modal-body::-webkit-scrollbar-thumb { background-color: var(--bs-secondary-bg); border-radius: 4px; }
</style>