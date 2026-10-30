<template>
  <div class="position-relative">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-body-emphasis mb-1">Quản lý Loại Phòng</h3>
        <p class="text-body-secondary small mb-0">Thiết lập thông số, giá cả và sức chứa cho các hạng phòng.</p>
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

    <!-- BẢNG DANH SÁCH LOẠI PHÒNG (Full width) -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-body-tertiary">
      <div class="card-header bg-transparent border-bottom-0 pt-4 pb-2 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <h5 class="fw-bold text-body-emphasis mb-0"><i class="fas fa-list-ul me-2 text-primary"></i>Danh sách Hạng Phòng</h5>
        
        <!-- Thanh Công cụ: Tìm kiếm, Lọc & Sắp xếp -->
        <div class="d-flex flex-wrap gap-2">
          <div class="input-group input-group-sm" style="min-width: 200px; max-width: 250px;">
            <span class="input-group-text bg-body border-secondary-subtle"><i class="fas fa-search text-body-secondary"></i></span>
            <input type="text" v-model="searchQuery" class="form-control bg-body border-secondary-subtle text-body-emphasis" placeholder="Tìm tên loại phòng...">
          </div>
          <select v-model="filterCapacity" class="form-select form-select-sm bg-body border-secondary-subtle text-body-emphasis" style="width: 150px;">
            <option value="ALL">Mọi sức chứa</option>
            <option value="1">Từ 1 Người lớn</option>
            <option value="2">Từ 2 Người lớn</option>
            <option value="4">Từ 4 Người lớn</option>
          </select>
          <select v-model="sortOption" class="form-select form-select-sm bg-body border-secondary-subtle text-body-emphasis" style="width: 170px;">
            <option value="DEFAULT">Sắp xếp mặc định</option>
            <option value="PRICE_ASC">Giá: Thấp -> Cao</option>
            <option value="PRICE_DESC">Giá: Cao -> Thấp</option>
            <option value="AREA_DESC">Diện tích: Lớn nhất</option>
            <option value="CAP_DESC">Sức chứa: Lớn nhất</option>
          </select>
        </div>
      </div>
      
      <div class="card-body p-0 mt-2">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-secondary">
              <tr>
                <th class="px-4 py-3">Loại phòng</th>
                <th class="py-3 text-center">Sức chứa</th>
                <th class="py-3 text-end">Diện tích</th>
                <th class="py-3 text-end">Giá gốc</th>
                <th class="py-3 text-end px-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="5" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                  <div class="mt-2 text-body-secondary">Đang tải dữ liệu...</div>
                </td>
              </tr>
              <tr v-else-if="filteredAndSortedRoomTypes.length === 0">
                <td colspan="5" class="text-center py-5 text-body-secondary">
                  <i class="fas fa-search-minus fs-2 mb-3 opacity-50"></i>
                  <p class="mb-0">Không tìm thấy loại phòng phù hợp.</p>
                </td>
              </tr>
              <tr v-else v-for="rt in filteredAndSortedRoomTypes" :key="rt.id">
                <td class="px-4 fw-bold text-primary">{{ rt.name }}<br><small class="text-body-secondary fw-normal">{{ rt.bed }}</small></td>
                <td class="text-center">
                  <span class="badge bg-body-secondary text-body-emphasis border border-secondary-subtle me-1" title="Người lớn"><i class="fas fa-user text-secondary"></i> {{ rt.adultMax }}</span>
                  <span class="badge bg-body-secondary text-body-emphasis border border-secondary-subtle" title="Trẻ em"><i class="fas fa-child text-secondary"></i> {{ rt.childrenMax }}</span>
                </td>
                <td class="text-end text-body-emphasis small">{{ rt.area }} m&sup2;</td>
                <td class="text-end fw-semibold text-success">{{ formatPrice(rt.basePrice) }}</td>
                <td class="text-end px-4">
                  <button @click="openEditModal(rt)" class="btn btn-sm btn-outline-primary shadow-sm me-2" title="Sửa">
                    <i class="fas fa-edit"></i> Sửa
                  </button>
                  <button @click="deleteRoomType(rt.id)" class="btn btn-sm btn-outline-danger shadow-sm" title="Xóa">
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
    <div v-if="showModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold">
              <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-plus-circle'" class="me-2"></i>
              {{ isEditMode ? 'Cập nhật Loại phòng' : 'Thêm Loại phòng mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="submitForm">
            <div class="modal-body p-4" style="max-height: 75vh; overflow-y: auto;">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label fw-semibold text-body-secondary small">Tên loại phòng <span class="text-danger">*</span></label>
                  <input v-model="form.name" type="text" class="form-control bg-body text-body-emphasis" required placeholder="VD: Standard, Deluxe...">
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold text-body-secondary small">Loại giường <span class="text-danger">*</span></label>
                  <input v-model="form.bed" type="text" class="form-control bg-body text-body-emphasis" required placeholder="VD: 1 Giường Đôi">
                </div>

                <div class="col-md-3">
                  <label class="form-label fw-semibold text-body-secondary small">Người lớn tối đa <span class="text-danger">*</span></label>
                  <input v-model="form.adultMax" type="number" min="1" class="form-control bg-body text-body-emphasis" required>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold text-body-secondary small">Trẻ em tối đa <span class="text-danger">*</span></label>
                  <input v-model="form.childrenMax" type="number" min="0" class="form-control bg-body text-body-emphasis" required>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold text-body-secondary small">Diện tích (m&sup2;) <span class="text-danger">*</span></label>
                  <input v-model="form.area" type="number" step="0.1" min="1" class="form-control bg-body text-body-emphasis" required>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold text-body-secondary small">Tỷ lệ cọc (%) <span class="text-danger">*</span></label>
                  <input v-model="form.depositPercent" type="number" min="0" max="100" class="form-control bg-body text-body-emphasis" required>
                </div>

                <div class="col-md-12">
                  <label class="form-label fw-semibold text-success small">Giá gốc (VNĐ) <span class="text-danger">*</span></label>
                  <input v-model="form.basePrice" type="number" min="0" class="form-control bg-body border-success fw-bold text-body-emphasis" required>
                </div>

                <div class="col-md-12">
                  <label class="form-label fw-semibold text-body-secondary small">Mô tả phòng</label>
                  <textarea v-model="form.description" class="form-control bg-body text-body-emphasis" rows="3" placeholder="Nhập mô tả chi tiết về loại phòng này..."></textarea>
                </div>

                <!-- DANH SÁCH TIỆN ÍCH -->
                <div class="col-md-12 mt-3 pt-3 border-top border-secondary-subtle">
                  <label class="form-label fw-semibold text-primary pb-2 w-100">
                    <i class="fas fa-wifi me-2"></i>Tiện ích đi kèm
                  </label>
                  <div class="row g-2 mt-2">
                    <div v-if="amenities.length === 0" class="col-12 text-body-secondary small">
                      Chưa có tiện ích nào trong hệ thống.
                    </div>
                    <div class="col-md-4 col-sm-6" v-for="am in amenities" :key="am.id">
                      <div class="form-check custom-checkbox">
                        <input class="form-check-input bg-body border-secondary-subtle shadow-sm" type="checkbox" :value="am.id" :id="'am_' + am.id" v-model="form.amenityIds">
                        <label class="form-check-label cursor-pointer text-body-emphasis small" :for="'am_' + am.id">
                          {{ am.name }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            <div class="modal-footer bg-body border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary fw-semibold" @click="closeModal">Hủy bỏ</button>
              <button type="submit" class="btn btn-primary fw-bold" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> 
                {{ isEditMode ? 'Lưu thay đổi' : 'Xác nhận Thêm' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- HỘP THOẠI XÁC NHẬN CUSTOM (Xóa Loại phòng) -->
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
            <p class="text-body-secondary mb-0" style="font-size: 0.95rem;">Bạn chắc chắn muốn xóa hạng phòng này? Nếu đã có phòng vật lý hoặc lịch sử đặt phòng gắn với hạng này, hệ thống sẽ từ chối.</p>
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

const roomTypes = ref([])
const amenities = ref([])
const isLoading = ref(true)
const isProcessing = ref(false)
const showModal = ref(false)
const isEditMode = ref(false)
const notification = ref({ type: '', message: '' })

// Quản lý Form Thêm/Sửa
const form = ref({
  id: null, name: '', bed: '', adultMax: 2, childrenMax: 1, 
  area: 25.0, basePrice: 200000, depositPercent: 30, description: '',
  amenityIds: []
})

// Tính năng Lọc, Tìm kiếm, Sắp xếp
const searchQuery = ref('')
const filterCapacity = ref('ALL') // Số lượng người lớn tối thiểu
const sortOption = ref('DEFAULT')

const filteredAndSortedRoomTypes = computed(() => {
  let result = roomTypes.value

  // Lọc theo sức chứa người lớn
  if (filterCapacity.value !== 'ALL') {
    const minAdults = parseInt(filterCapacity.value)
    result = result.filter(rt => (rt.adultMax || 0) >= minAdults)
  }

  // Tìm kiếm theo tên loại phòng
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(rt => rt.name?.toLowerCase().includes(q))
  }

  // Sắp xếp
  if (sortOption.value === 'PRICE_ASC') {
    result = result.slice().sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0))
  } else if (sortOption.value === 'PRICE_DESC') {
    result = result.slice().sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0))
  } else if (sortOption.value === 'AREA_DESC') {
    result = result.slice().sort((a, b) => (b.area || 0) - (a.area || 0))
  } else if (sortOption.value === 'CAP_DESC') {
    result = result.slice().sort((a, b) => (b.adultMax || 0) - (a.adultMax || 0))
  }

  return result
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

// Mở Modal Tạo mới
const openCreateModal = () => {
  isEditMode.value = false
  form.value = { 
    id: null, name: '', bed: '', adultMax: 2, childrenMax: 1, 
    area: 25.0, basePrice: 200000, depositPercent: 30, description: '', 
    amenityIds: [] 
  }
  showModal.value = true
}

// Mở Modal Sửa
const openEditModal = (rt) => {
  isEditMode.value = true
  form.value = { ...rt }
  // Lấy danh sách ID tiện ích đã có của phòng này để tick sẵn trên giao diện
  form.value.amenityIds = rt.roomAmenities ? rt.roomAmenities.map(ra => ra.amenity?.id).filter(id => id != null) : []
  showModal.value = true
}

// Đóng Modal
const closeModal = () => {
  showModal.value = false
}

// Xử lý Thêm / Lưu thay đổi
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
    showNotification('danger', error.response?.data?.error || 'Có lỗi xảy ra, vui lòng kiểm tra lại thông tin.')
  } finally {
    isProcessing.value = false
  }
}

// Xử lý Xóa
const deleteRoomType = (id) => {
  openConfirm(async () => {
    try {
      await api.delete(`/api/manager/operation/room-types/${id}`)
      showNotification('success', 'Đã xóa hạng phòng thành công.')
      fetchData()
    } catch (error) {
      showNotification('danger', error.response?.data?.error || 'Không thể xóa loại phòng này vì có thể đã được sử dụng.')
    }
  })
}

onMounted(() => fetchData())
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }

/* Custom Scrollbar cho Modal dài */
.modal-body::-webkit-scrollbar { width: 6px; }
.modal-body::-webkit-scrollbar-thumb { background-color: var(--bs-secondary-bg); border-radius: 4px; }
</style>