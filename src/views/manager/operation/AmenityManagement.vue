<template>
  <div class="position-relative">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Quản lý Tiện Ích</h3>
        <p class="text-muted small mb-0">Danh sách các trang thiết bị, dịch vụ đi kèm trong phòng.</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary shadow-sm fw-bold">
        <i class="fas fa-plus me-2"></i> Thêm Tiện Ích
      </button>
    </div>

    <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
      {{ notification.message }}
      <button type="button" class="btn-close" @click="notification.message = ''"></button>
    </div>

    <!-- Bảng danh sách Tiện ích -->
    <div class="row">
      <div class="col-md-8">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="px-4 py-3" style="width: 20%;">Mã ID</th>
                    <th class="py-3">Tên Tiện Ích</th>
                    <th class="py-3 text-end px-4" style="width: 30%;">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="isLoading">
                    <td colspan="3" class="text-center py-4 text-muted">
                      <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div> Đang tải...
                    </td>
                  </tr>
                  <tr v-else-if="amenities.length === 0">
                    <td colspan="3" class="text-center py-4 text-muted">Chưa có tiện ích nào.</td>
                  </tr>
                  <tr v-else v-for="am in amenities" :key="am.id">
                    <td class="px-4 text-muted small">{{ am.id }}</td>
                    <td class="fw-semibold text-dark">
                      <i class="fas fa-check text-success me-2"></i>{{ am.name }}
                    </td>
                    <td class="text-end px-4">
                      <button @click="openEditModal(am)" class="btn btn-sm btn-outline-primary shadow-sm me-2">
                        <i class="fas fa-edit"></i> Sửa
                      </button>
                      <button @click="deleteAmenity(am.id)" class="btn btn-sm btn-outline-danger shadow-sm">
                        <i class="fas fa-trash"></i> Xóa
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

    <!-- MODAL THÊM/SỬA TIỆN ÍCH -->
    <div v-if="showModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold">
              <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-plus-circle'" class="me-2"></i>
              {{ isEditMode ? 'Cập nhật Tiện ích' : 'Thêm Tiện ích mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="submitForm">
            <div class="modal-body p-4">
              <div class="mb-0">
                <label class="form-label fw-semibold">Tên tiện ích <span class="text-danger">*</span></label>
                <input v-model="form.name" type="text" class="form-control" required placeholder="VD: Smart TV, Bồn tắm, Wifi...">
              </div>
            </div>
            <div class="modal-footer bg-light border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary" @click="closeModal">Hủy bỏ</button>
              <button type="submit" class="btn btn-primary fw-bold" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Xác nhận
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

const amenities = ref([])
const isLoading = ref(true)
const isProcessing = ref(false)
const showModal = ref(false)
const isEditMode = ref(false)

const notification = ref({ type: '', message: '' })
const showNotification = (type, message) => {
  notification.value = { type, message }
  setTimeout(() => notification.value.message = '', 5000)
}

const form = ref({ amenityId: '', name: '' })

// Lấy danh sách tiện ích từ API Dashboard
const fetchAmenities = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/manager/operation/dashboard')
    amenities.value = response.data.allAmenities || []
  } catch (error) {
    showNotification('danger', 'Không thể tải danh sách tiện ích.')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  isEditMode.value = false
  form.value = { amenityId: '', name: '' }
  showModal.value = true
}

const openEditModal = (am) => {
  isEditMode.value = true
  form.value = { amenityId: am.id, name: am.name }
  showModal.value = true
}

const closeModal = () => showModal.value = false

const submitForm = async () => {
  isProcessing.value = true
  try {
    await api.post('/api/manager/operation/amenities', form.value)
    showNotification('success', isEditMode.value ? 'Cập nhật thành công!' : 'Thêm mới thành công!')
    closeModal()
    fetchAmenities()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Có lỗi xảy ra.')
  } finally {
    isProcessing.value = false
  }
}

const deleteAmenity = async (id) => {
  if (!confirm('Xóa tiện ích này? Nếu tiện ích đang được gán cho loại phòng thì sẽ không thể xóa.')) return
  try {
    await api.delete(`/api/manager/operation/amenities/${id}`)
    showNotification('success', 'Đã xóa tiện ích.')
    fetchAmenities()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Không thể xóa tiện ích này.')
  }
}

onMounted(() => fetchAmenities())
</script>