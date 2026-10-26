<template>
  <div class="position-relative">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Quản lý Sự cố</h3>
        <p class="text-muted small mb-0">Ghi nhận hư hỏng, phàn nàn và theo dõi trạng thái xử lý.</p>
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

    <!-- Bảng danh sách Sự cố -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
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
                <td colspan="7" class="text-center py-5"><div class="spinner-border text-danger" role="status"></div></td>
              </tr>
              <tr v-else-if="incidents.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">Tuyệt vời! Không có sự cố nào.</td>
              </tr>
              <tr v-else v-for="ic in incidents" :key="ic.id">
                <td class="px-4">
                  <span class="fw-bold text-dark d-block">{{ ic.name }}</span>
                  <span class="text-muted small text-truncate d-block" style="max-width: 200px;" :title="ic.description">{{ ic.description || 'Không có mô tả' }}</span>
                </td>
                <td class="fw-semibold text-primary">{{ ic.roomName || 'N/A' }}</td>
                <td>{{ formatDate(ic.occurTime) }}</td>
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
    <div v-if="showModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title fw-bold">
              <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-exclamation-circle'" class="me-2"></i>
              {{ isEditMode ? 'Cập nhật Sự cố' : 'Ghi nhận Sự cố mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="submitForm">
            <div class="modal-body p-4">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label fw-semibold">Tên sự cố <span class="text-danger">*</span></label>
                  <input v-model="form.name" type="text" class="form-control" required placeholder="VD: Hỏng tivi, Rách ga giường...">
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Phòng xảy ra</label>
                  <select v-model="form.rentalDetailId" class="form-select">
                    <option value="">-- Không xác định --</option>
                    <option v-for="rt in activeRentals" :key="rt.id" :value="rt.id">Phòng {{ rt.roomName }}</option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-semibold">Thời gian phát hiện <span class="text-danger">*</span></label>
                  <input v-model="form.occurTime" type="datetime-local" class="form-control" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Bên chịu trách nhiệm</label>
                  <select v-model="form.responsible" class="form-select">
                    <option value="HOTEL">Khách sạn</option>
                    <option value="CUSTOMER">Khách hàng</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Trạng thái xử lý <span class="text-danger">*</span></label>
                  <select v-model="form.status" class="form-select fw-bold" :class="getStatusTextClass(form.status)" required>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="PROCESSING">Đang xử lý (Sửa chữa)</option>
                    <option value="RESOLVED">Đã giải quyết xong</option>
                  </select>
                </div>

                <div class="col-md-12">
                  <label class="form-label fw-semibold">Mô tả chi tiết</label>
                  <textarea v-model="form.description" class="form-control" rows="2" placeholder="Tình trạng cụ thể..."></textarea>
                </div>

                <!-- Khu vực đền bù & Hướng giải quyết -->
                <div class="col-md-12 mt-3 p-3 bg-light rounded-3 border">
                  <h6 class="fw-bold text-dark mb-3"><i class="fas fa-gavel me-2 text-warning"></i>Phương án giải quyết</h6>
                  <div class="row g-3">
                    <div class="col-md-4">
                      <label class="form-label fw-semibold text-danger">Tiền phạt / Đền bù (VNĐ)</label>
                      <input v-model="form.money" type="number" min="0" class="form-control fw-bold" :disabled="form.responsible !== 'CUSTOMER'" placeholder="0">
                      <small v-if="form.responsible !== 'CUSTOMER'" class="text-muted" style="font-size: 0.75rem;">Chỉ thu tiền nếu lỗi do Khách.</small>
                    </div>
                    <div class="col-md-8">
                      <label class="form-label fw-semibold">Cách xử lý (Ghi chú)</label>
                      <input v-model="form.handle" type="text" class="form-control" placeholder="VD: Thay mới, Cảnh cáo khách, Bảo trì tòa nhà...">
                    </div>
                  </div>
                </div>

              </div>
            </div>
            <div class="modal-footer bg-light border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary" @click="closeModal">Hủy bỏ</button>
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
import { ref, onMounted } from 'vue'
import api from '../../../utils/axios'

const incidents = ref([])
const activeRentals = ref([])
const isLoading = ref(true)
const isProcessing = ref(false)
const showModal = ref(false)
const isEditMode = ref(false)
const notification = ref({ type: '', message: '' })

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
  return 'text-secondary'
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
  
  // Format thời gian hiện tại để nhét vào input datetime-local
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
  // Xử lý lại chuỗi datetime-local
  if (form.value.occurTime) {
    form.value.occurTime = form.value.occurTime.slice(0, 16)
  }
  showModal.value = true
}

const closeModal = () => showModal.value = false

const submitForm = async () => {
  isProcessing.value = true
  try {
    // Nếu chuyển sang lỗi do KS thì reset tiền đền bù
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

const deleteIncident = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa bản ghi sự cố này?')) return
  try {
    await api.delete(`/api/manager/operation/incidents/${id}`)
    showNotification('success', 'Đã xóa sự cố.')
    fetchData()
  } catch (error) {
    showNotification('danger', 'Không thể xóa.')
  }
}

onMounted(() => fetchData())
</script>