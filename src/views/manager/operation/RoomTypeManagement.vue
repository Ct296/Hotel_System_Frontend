<template>
  <div class="position-relative">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Quản lý Loại Phòng</h3>
        <p class="text-muted small mb-0">Thiết lập thông số, giá cả và sức chứa cho các hạng phòng.</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary shadow-sm fw-bold">
        <i class="fas fa-plus me-2"></i> Thêm Loại Phòng
      </button>
    </div>

    <!-- Thông báo Alert -->
    <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
      {{ notification.message }}
      <button type="button" class="btn-close" @click="notification.message = ''"></button>
    </div>

    <!-- Bảng danh sách Loại phòng -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="px-4 py-3">Loại phòng</th>
                <th class="py-3">Giường</th>
                <th class="py-3 text-center">Sức chứa</th>
                <th class="py-3 text-end">Diện tích</th>
                <th class="py-3 text-end">Giá gốc (VNĐ)</th>
                <th class="py-3 text-end px-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="6" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                  <div class="mt-2 text-muted">Đang tải dữ liệu...</div>
                </td>
              </tr>
              <tr v-else-if="roomTypes.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="fas fa-box-open fs-2 mb-3"></i>
                  <p class="mb-0">Chưa có dữ liệu loại phòng nào.</p>
                </td>
              </tr>
              <tr v-else v-for="rt in roomTypes" :key="rt.id">
                <td class="px-4 fw-bold text-primary">{{ rt.name }}</td>
                <td>{{ rt.bed }}</td>
                <td class="text-center">
                  <span class="badge bg-info text-dark me-1" title="Người lớn"><i class="fas fa-user"></i> {{ rt.adultMax }}</span>
                  <span class="badge bg-secondary" title="Trẻ em"><i class="fas fa-child"></i> {{ rt.childrenMax }}</span>
                </td>
                <td class="text-end">{{ rt.area }} m&sup2;</td>
                <td class="text-end fw-semibold text-success">{{ formatPrice(rt.basePrice) }}</td>
                <td class="text-end px-4">
                  <button @click="openEditModal(rt)" class="btn btn-sm btn-outline-primary shadow-sm me-2">
                    <i class="fas fa-edit"></i> Sửa
                  </button>
                  <button @click="deleteRoomType(rt.id)" class="btn btn-sm btn-outline-danger shadow-sm">
                    <i class="fas fa-trash"></i> Xóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL THÊM/SỬA LOẠI PHÒNG ==================== -->
    <div v-if="showModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold">
              <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-plus-circle'" class="me-2"></i>
              {{ isEditMode ? 'Cập nhật Loại phòng' : 'Thêm Loại phòng mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="submitForm">
            <div class="modal-body p-4">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label fw-semibold">Tên loại phòng <span class="text-danger">*</span></label>
                  <input v-model="form.name" type="text" class="form-control" required placeholder="VD: Standard, Deluxe...">
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Loại giường <span class="text-danger">*</span></label>
                  <input v-model="form.bed" type="text" class="form-control" required placeholder="VD: 1 Giường Đôi">
                </div>

                <div class="col-md-3">
                  <label class="form-label fw-semibold">Người lớn tối đa <span class="text-danger">*</span></label>
                  <input v-model="form.adultMax" type="number" min="1" class="form-control" required>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Trẻ em tối đa <span class="text-danger">*</span></label>
                  <input v-model="form.childrenMax" type="number" min="0" class="form-control" required>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Diện tích (m&sup2;) <span class="text-danger">*</span></label>
                  <input v-model="form.area" type="number" step="0.1" min="1" class="form-control" required>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Tỷ lệ cọc (%) <span class="text-danger">*</span></label>
                  <input v-model="form.depositPercent" type="number" min="0" max="100" class="form-control" required>
                </div>

                <div class="col-md-12">
                  <label class="form-label fw-semibold text-success">Giá gốc (VNĐ) <span class="text-danger">*</span></label>
                  <input v-model="form.basePrice" type="number" min="0" class="form-control border-success fw-bold" required>
                </div>

                <div class="col-md-12">
                  <label class="form-label fw-semibold">Mô tả phòng</label>
                  <textarea v-model="form.description" class="form-control" rows="3" placeholder="Nhập mô tả chi tiết về loại phòng này..."></textarea>
                </div>

                <!-- DANH SÁCH TIỆN ÍCH -->
                <div class="col-md-12 mt-3">
                  <label class="form-label fw-semibold text-primary border-bottom pb-2 w-100">
                    <i class="fas fa-wifi me-2"></i>Tiện ích đi kèm
                  </label>
                  <div class="row g-2 mt-2">
                    <div v-if="amenities.length === 0" class="col-12 text-muted small">
                      Chưa có tiện ích nào trong hệ thống.
                    </div>
                    <div class="col-md-4 col-sm-6" v-for="am in amenities" :key="am.id">
                      <div class="form-check custom-checkbox">
                        <input class="form-check-input" type="checkbox" :value="am.id" :id="'am_' + am.id" v-model="form.amenityIds">
                        <label class="form-check-label cursor-pointer" :for="'am_' + am.id">
                          {{ am.name }}
                        </label>
                      </div>
                    </div>
                  </div>
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

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../../utils/axios'

const roomTypes = ref([])
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

const form = ref({
  id: null, name: '', bed: '', adultMax: 2, childrenMax: 1, 
  area: 25.0, basePrice: 0, depositPercent: 30, description: '',
  amenityIds: []
})

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price)

const fetchData = async () => {
  isLoading.value = true
  try {
    const [rtRes, dashRes] = await Promise.all([
      api.get('/api/manager/operation/room-types'),
      api.get('/api/manager/operation/dashboard')
    ])
    roomTypes.value = rtRes.data || []
    amenities.value = dashRes.data.allAmenities || []
  } catch (error) {
    console.error('Lỗi fetch dữ liệu:', error)
    showNotification('danger', 'Không thể tải dữ liệu từ máy chủ!')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  isEditMode.value = false
  form.value = { 
    id: null, name: '', bed: '', adultMax: 2, childrenMax: 1, 
    area: 25.0, basePrice: 200000, depositPercent: 30, description: '', 
    amenityIds: [] 
  }
  showModal.value = true
}

const openEditModal = (rt) => {
  isEditMode.value = true
  form.value = { ...rt }
  // Lấy danh sách ID tiện ích đã có của phòng này để tick sẵn trên giao diện
  form.value.amenityIds = rt.roomAmenities ? rt.roomAmenities.map(ra => ra.amenity?.id).filter(id => id != null) : []
  showModal.value = true
}

const closeModal = () => showModal.value = false

const submitForm = async () => {
  isProcessing.value = true
  try {
    if (isEditMode.value) {
      await api.put(`/api/manager/operation/room-types/${form.value.id}`, form.value)
      showNotification('success', 'Cập nhật loại phòng thành công!')
    } else {
      await api.post('/api/manager/operation/room-types', form.value)
      showNotification('success', 'Thêm loại phòng mới thành công!')
    }
    closeModal()
    fetchData()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại.')
  } finally {
    isProcessing.value = false
  }
}

const deleteRoomType = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa loại phòng này? Thao tác không thể hoàn tác!')) return
  try {
    await api.delete(`/api/manager/operation/room-types/${id}`)
    showNotification('success', 'Đã xóa loại phòng.')
    fetchData()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Không thể xóa loại phòng này (có thể đã có phòng thuộc loại này).')
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>