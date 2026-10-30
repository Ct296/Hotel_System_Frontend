<template>
  <div class="position-relative">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-body-emphasis mb-1">Quản lý Tiện Ích</h3>
        <p class="text-body-secondary small mb-0">Danh sách và thiết lập các trang thiết bị, dịch vụ đi kèm trong phòng.</p>
      </div>
    </div>

    <!-- Thông báo Alert -->
    <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
      {{ notification.message }}
      <button type="button" class="btn-close" @click="notification.message = ''"></button>
    </div>

    <div class="row g-4">
      <!-- CỘT TRÁI: FORM THÊM / CẬP NHẬT -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 bg-body-tertiary sticky-top" style="top: 90px; z-index: 10;">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold text-primary mb-0">
              <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-plus-circle'" class="me-2"></i>
              {{ isEditMode ? 'Cập nhật Tiện Ích' : 'Thêm Tiện Ích' }}
            </h5>
          </div>
          
          <div class="card-body p-4">
            <form @submit.prevent="submitForm">
              <div class="mb-4">
                <label class="form-label fw-semibold text-body-secondary">Tên tiện ích <span class="text-danger">*</span></label>
                <input v-model="form.name" type="text" class="form-control bg-body" required placeholder="VD: Smart TV, Bồn tắm, Wifi...">
              </div>
              
              <!-- CỤM NÚT THAO TÁC (Thêm nút Hủy/Làm mới) -->
              <div class="d-flex gap-2">
                <button type="button" @click="cancelEdit" class="btn btn-outline-secondary fw-bold rounded-3 shadow-sm py-2 w-50" :disabled="isProcessing">
                  <i class="fas" :class="isEditMode ? 'fa-times' : 'fa-undo'"></i> 
                  {{ isEditMode ? 'Hủy' : 'Làm mới' }}
                </button>
                <button type="submit" class="btn fw-bold rounded-3 shadow-sm py-2 w-50" :class="isEditMode ? 'btn-primary' : 'btn-success'" :disabled="isProcessing">
                  <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> 
                  <i v-else :class="isEditMode ? 'fas fa-save me-1' : 'fas fa-check me-1'"></i> 
                  {{ isEditMode ? 'Lưu' : 'Xác nhận' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- CỘT PHẢI: BẢNG DANH SÁCH & TÌM KIẾM -->
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h5 class="fw-bold text-body-emphasis mb-0"><i class="fas fa-list-ul me-2 text-primary"></i>Danh sách Tiện Ích</h5>
            
            <!-- Thanh tìm kiếm -->
            <div class="input-group input-group-sm" style="width: 250px;">
              <span class="input-group-text bg-body border-secondary-subtle"><i class="fas fa-search text-body-secondary"></i></span>
              <input type="text" v-model="searchQuery" class="form-control bg-body border-secondary-subtle" placeholder="Tìm tên tiện ích hoặc ID...">
            </div>
          </div>
          
          <div class="card-body p-0 mt-2">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-secondary">
                  <tr>
                    <th class="px-4 py-3" style="width: 25%;">Mã ID</th>
                    <th class="py-3">Tên Tiện Ích</th>
                    <th class="py-3 text-end px-4" style="width: 25%;">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="isLoading">
                    <td colspan="3" class="text-center py-5 text-body-secondary">
                      <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div> Đang tải...
                    </td>
                  </tr>
                  <tr v-else-if="filteredAmenities.length === 0">
                    <td colspan="3" class="text-center py-5 text-body-secondary">
                      <i class="fas fa-search-minus fs-2 mb-3 opacity-50"></i>
                      <p class="mb-0">Không tìm thấy tiện ích nào.</p>
                    </td>
                  </tr>
                  <tr v-else v-for="am in filteredAmenities" :key="am.id" :class="{'table-active': form.amenityId === am.id}">
                    <td class="px-4 text-body-secondary small fw-semibold">{{ am.id }}</td>
                    <td class="fw-bold text-body-emphasis">
                      <i class="fas fa-check text-success me-2 opacity-75"></i>{{ am.name }}
                    </td>
                    <td class="text-end px-4">
                      <button @click="editAmenity(am)" class="btn btn-sm btn-outline-primary shadow-sm me-2" title="Sửa">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="deleteAmenity(am.id)" class="btn btn-sm btn-outline-danger shadow-sm" title="Xóa">
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

    <!-- HỘP THOẠI XÁC NHẬN CUSTOM (Dành cho Xóa) -->
    <div v-if="showConfirmModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header border-0 pb-0 justify-content-center mt-3">
            <div class="text-danger" style="font-size: 3rem;">
              <i class="fas fa-exclamation-circle"></i>
            </div>
          </div>
          <div class="modal-body text-center pt-2 pb-4 px-4">
            <h5 class="fw-bold mb-3 text-body-emphasis">Xác nhận xóa</h5>
            <p class="text-body-secondary mb-0" style="font-size: 0.95rem;">Bạn chắc chắn muốn xóa tiện ích này? Nếu tiện ích đang được gán cho loại phòng thì hệ thống sẽ từ chối.</p>
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

const amenities = ref([])
const isLoading = ref(true)
const isProcessing = ref(false)
const notification = ref({ type: '', message: '' })

// Quản lý Form Thêm/Sửa
const isEditMode = ref(false)
const form = ref({ amenityId: '', name: '' })

// Chức năng Tìm kiếm
const searchQuery = ref('')

const filteredAmenities = computed(() => {
  if (!searchQuery.value.trim()) return amenities.value
  const q = searchQuery.value.toLowerCase().trim()
  return amenities.value.filter(am => 
    am.name?.toLowerCase().includes(q) || am.id?.toLowerCase().includes(q)
  )
})

// Quản lý Confirm Modal
const showConfirmModal = ref(false)
const confirmAction = ref(null)

const showNotification = (type, message) => {
  notification.value = { type, message }
  setTimeout(() => notification.value.message = '', 5000)
}

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

// Kích hoạt Edit
const editAmenity = (am) => {
  isEditMode.value = true
  form.value = { amenityId: am.id, name: am.name }
}

// Hủy Edit, quay về Create / Làm mới form
const cancelEdit = () => {
  isEditMode.value = false
  form.value = { amenityId: '', name: '' }
}

// Xử lý Lưu/Thêm
const submitForm = async () => {
  isProcessing.value = true
  try {
    await api.post('/api/manager/operation/amenities', form.value)
    showNotification('success', isEditMode.value ? 'Cập nhật tiện ích thành công!' : 'Thêm mới tiện ích thành công!')
    cancelEdit() // Reset form sau khi thành công
    fetchAmenities()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Có lỗi xảy ra khi lưu.')
  } finally {
    isProcessing.value = false
  }
}

// Xử lý Xóa
const deleteAmenity = (id) => {
  openConfirm(async () => {
    try {
      await api.delete(`/api/manager/operation/amenities/${id}`)
      showNotification('success', 'Đã xóa tiện ích thành công.')
      if (form.value.amenityId === id) cancelEdit()
      fetchAmenities()
    } catch (error) {
      showNotification('danger', error.response?.data?.error || 'Không thể xóa tiện ích này vì đang được sử dụng.')
    }
  })
}

onMounted(() => fetchAmenities())
</script>

<style scoped>
.table-active {
  background-color: var(--bs-secondary-bg) !important;
}
</style>