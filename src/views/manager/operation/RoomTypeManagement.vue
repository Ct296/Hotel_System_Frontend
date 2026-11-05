<template>
  <div class="position-relative">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-body-emphasis mb-1">Quản lý Loại Phòng</h3>
        <p class="text-body-secondary small mb-0">Thiết lập thông số, giá và sức chứa cho các hạng phòng.</p>
      </div>
      <button @click="openCreateModal" class="btn fw-bold px-4 shadow-sm" style="background-color: #6366f1; color: white; border: none; height: 38px;">
        <i class="fas fa-plus me-2"></i> THÊM LOẠI PHÒNG
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
        
        <div class="d-flex align-items-center gap-2 flex-wrap flex-grow-1">
          <!-- Nút Lọc Mở Rộng -->
          <div class="dropdown">
            <button class="btn btn-outline-secondary bg-body text-body-emphasis border-secondary-subtle px-3 shadow-sm d-flex align-items-center justify-content-center" style="height: 38px;" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fas fa-filter text-secondary"></i>
            </button>
            <div class="dropdown-menu shadow-lg border-0 p-3 rounded-4" style="width: 280px;">
              <h6 class="dropdown-header fw-bold text-body-emphasis px-0 mb-2">Bộ lọc loại phòng</h6>
              <div class="mb-3">
                <label class="form-label small fw-semibold text-body-secondary mb-1">Sức chứa</label>
                <select v-model="filterCapacity" class="form-select form-select-sm bg-body">
                  <option value="ALL">Mọi sức chứa</option>
                  <option value="1">Từ 1 Người lớn</option>
                  <option value="2">Từ 2 Người lớn</option>
                  <option value="4">Từ 4 Người lớn</option>
                </select>
              </div>
              <div>
                <label class="form-label small fw-semibold text-body-secondary mb-1">Sắp xếp theo</label>
                <select v-model="sortOption" class="form-select form-select-sm bg-body">
                  <option value="DEFAULT">Sắp xếp mặc định</option>
                  <option value="PRICE_ASC">Giá: Thấp -> Cao</option>
                  <option value="PRICE_DESC">Giá: Cao -> Thấp</option>
                  <option value="AREA_DESC">Diện tích: Lớn nhất</option>
                  <option value="CAP_DESC">Sức chứa: Lớn nhất</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Thanh tìm kiếm & Nút Làm Mới -->
          <div class="input-group shadow-sm" style="max-width: 320px;">
            <span class="input-group-text bg-body border-secondary-subtle text-secondary bg-transparent">
              <i class="fas fa-search"></i>
            </span>
            <input type="text" v-model="searchQuery" class="form-control bg-body border-secondary-subtle border-start-0 ps-0 shadow-none text-body-emphasis" placeholder="Tên loại phòng...">
            <button @click="resetFilters" class="btn btn-outline-secondary bg-body border-secondary-subtle text-body-emphasis" type="button" title="Làm mới bộ lọc & tìm kiếm">
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
        
        <div class="d-flex align-items-center">
            <h5 class="fw-bold text-body-emphasis mb-0 d-none d-md-block"><i class="fas fa-list-ul me-2 text-primary"></i>Danh sách Hạng Phòng</h5>
        </div>
      </div>
      
      <div class="card-body p-0 mt-2">
        <div class="table-responsive">
          <table class="table align-middle mb-0 custom-table">
            <thead class="table-light text-body-secondary" style="font-size: 0.75rem;">
              <tr>
                <th class="px-4 py-3 fw-bold border-0 text-uppercase">Loại phòng</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-center">Sức chứa</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-end">Diện tích</th>
                <!-- THÊM CỘT TIỆN ÍCH Ở ĐÂY -->
                <th class="py-3 fw-bold border-0 text-uppercase">Tiện ích</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-end">Giá Giờ / Ngày</th>
                <th class="py-3 fw-bold border-0 text-end px-4"></th>
              </tr>
            </thead>
            <tbody class="bg-body border-top-0">
              <tr v-if="isLoading">
                <td colspan="6" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                  <div class="mt-2 text-body-secondary">Đang tải dữ liệu...</div>
                </td>
              </tr>
              <tr v-else-if="filteredAndSortedRoomTypes.length === 0">
                <td colspan="6" class="text-center py-5 text-body-secondary">
                  <i class="fas fa-search-minus fs-2 mb-3 opacity-50"></i>
                  <p class="mb-0">Không tìm thấy loại phòng phù hợp.</p>
                </td>
              </tr>
              <tr v-else v-for="rt in filteredAndSortedRoomTypes" :key="rt.id" class="table-row-hover border-bottom border-secondary-subtle">
                <td class="px-4 fw-bold text-primary">{{ rt.name }}<br><small class="text-body-secondary fw-normal">{{ rt.bed }}</small></td>
                <td class="text-center">
                  <span class="badge bg-body-secondary text-body-emphasis border border-secondary-subtle me-1" title="Người lớn"><i class="fas fa-user text-secondary"></i> {{ rt.adultMax }}</span>
                  <span class="badge bg-body-secondary text-body-emphasis border border-secondary-subtle" title="Trẻ em"><i class="fas fa-child text-secondary"></i> {{ rt.childrenMax }}</span>
                </td>
                <td class="text-end text-body-emphasis small">{{ rt.area }} m&sup2;</td>
                
                <td>
                   <div v-if="rt.roomAmenities && rt.roomAmenities.length > 0" class="d-flex flex-wrap gap-1" style="max-width: 250px;">
                      <span v-for="ra in rt.roomAmenities.slice(0, 3)" :key="ra.amenity?.id" class="badge bg-light text-dark border">
                        {{ ra.amenity?.name }}
                      </span>
                      <span v-if="rt.roomAmenities.length > 3" class="badge bg-light text-secondary border">
                        +{{ rt.roomAmenities.length - 3 }}
                      </span>
                   </div>
                   <span v-else class="text-muted small fst-italic">Chưa có</span>
                </td>

                <td class="text-end">
                  <div class="fw-semibold text-success">{{ formatPrice(rt.basePrice) }}/h</div>
                  <div class="small text-primary fw-bold">{{ formatPrice(rt.dailyPrice || (rt.basePrice * 22)) }}/đêm</div>
                </td>
                <td class="text-end px-4">
                   <!-- Nút hành động dạng Dropdown -->
                  <div class="dropdown">
                    <button class="btn btn-link text-body-secondary p-0 shadow-none fs-5" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="fas fa-list"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm border-secondary-subtle rounded-3">
                      <li>
                        <button class="dropdown-item fw-semibold text-info py-2" @click="openEditModal(rt)">
                          <i class="fas fa-edit me-2"></i> Chỉnh sửa
                        </button>
                      </li>
                      <li>
                        <button class="dropdown-item fw-semibold text-danger py-2" @click="deleteRoomType(rt.id)">
                          <i class="fas fa-trash me-2"></i> Xóa loại phòng
                        </button>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL THÊM / SỬA LOẠI PHÒNG ==================== -->
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
                  <input v-model="form.bed" type="text" class="form-control bg-body text-body-emphasis" required placeholder="VD: 1 Giường đôi lớn">
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
                  <label class="form-label fw-semibold text-body-secondary small">Tỉ lệ cọc (%) <span class="text-danger">*</span></label>
                  <input v-model="form.depositPercent" type="number" min="0" max="100" class="form-control bg-body text-body-emphasis" required>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold text-success small">Giá theo giờ (VNĐ) <span class="text-danger">*</span></label>
                  <input v-model="form.basePrice" type="number" min="0" class="form-control bg-body border-success fw-bold text-body-emphasis" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-primary small">Giá qua đêm / Theo ngày (VNĐ) <span class="text-danger">*</span></label>
                  <input v-model="form.dailyPrice" type="number" min="0" class="form-control bg-body border-primary fw-bold text-body-emphasis" required>
                </div>

                <div class="col-md-12">
                  <label class="form-label fw-semibold text-body-secondary small">Mô tả phòng</label>
                  <textarea v-model="form.description" class="form-control bg-body text-body-emphasis" rows="3" placeholder="Nhập chi tiết về loại phòng này..."></textarea>
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
                        <input
                          class="form-check-input shadow-sm"
                          type="checkbox"
                          :value="am.id"
                          :id="'am_' + am.id"
                          v-model="selectedAmenities"
                        >
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
              <button type="button" class="btn btn-secondary fw-semibold" @click="closeModal">Hủy</button>
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
            <p class="text-body-secondary mb-0" style="font-size: 0.95rem;">Bạn chắc chắn muốn xóa hạng phòng này? Nếu đang có phòng vật lý thuộc hạng này, hệ thống sẽ báo lỗi.</p>
          </div>
          <div class="modal-footer bg-body border-0 d-flex justify-content-center rounded-bottom-4 py-3 gap-2">
            <button type="button" class="btn btn-secondary px-4 fw-semibold" @click="closeConfirm">Hủy</button>
            <button type="button" class="btn px-4 fw-bold btn-danger" @click="executeConfirm">Xóa</button>
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

const selectedAmenities = ref([])

// Quản lý Form Thêm/Sửa
const form = ref({
  id: null, name: '', bed: '', adultMax: 2, childrenMax: 1, 
  area: 25.0, basePrice: 200000, dailyPrice: 500000, depositPercent: 30, description: ''
})

// Tính năng Lọc, Tìm kiếm, Sắp xếp
const searchQuery = ref('')
const filterCapacity = ref('ALL')
const sortOption = ref('DEFAULT')

const resetFilters = () => {
  searchQuery.value = ''
  filterCapacity.value = 'ALL'
  sortOption.value = 'DEFAULT'
}

const filteredAndSortedRoomTypes = computed(() => {
  let result = roomTypes.value

  if (filterCapacity.value !== 'ALL') {
    const minAdults = parseInt(filterCapacity.value)
    result = result.filter(rt => (rt.adultMax || 0) >= minAdults)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(rt => rt.name?.toLowerCase().includes(q))
  }

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

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ'

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
    showNotification('danger', 'Không thể lấy dữ liệu hạng phòng.')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  isEditMode.value = false
  form.value = { 
    id: null, name: '', bed: '', adultMax: 2, childrenMax: 1, 
    area: 25.0, basePrice: 200000, dailyPrice: 500000, depositPercent: 30, description: ''
  }
  selectedAmenities.value = []
  showModal.value = true
}

const openEditModal = (rt) => {
  isEditMode.value = true
  
  form.value = {
    id: rt.id,
    name: rt.name,
    bed: rt.bed || '',
    adultMax: rt.adultMax,
    childrenMax: rt.childrenMax,
    area: rt.area,
    basePrice: rt.basePrice,
    dailyPrice: rt.dailyPrice || (rt.basePrice * 22),
    depositPercent: rt.depositPercent,
    description: rt.description || ''
  }

  selectedAmenities.value = rt.roomAmenities ? rt.roomAmenities.map(ra => ra.amenity?.id).filter(id => id != null) : []
  
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = async () => {
  isProcessing.value = true
  try {
    const payload = {
      ...form.value,
      amenityIds: selectedAmenities.value
    }
    
    if (isEditMode.value) {
      await api.put(`/api/manager/operation/room-types/${payload.id}`, payload)
      showNotification('success', 'Cập nhật loại phòng thành công!')
    } else {
      await api.post('/api/manager/operation/room-types', payload)
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

const deleteRoomType = (id) => {
  openConfirm(async () => {
    try {
      await api.delete(`/api/manager/operation/room-types/${id}`)
      showNotification('success', 'Đã xóa loại phòng thành công.')
      fetchData()
    } catch (error) {
      showNotification('danger', error.response?.data?.error || 'Không thể xóa loại phòng này do đang có dữ liệu sử dụng.')
    }
  })
}

onMounted(() => fetchData())
</script>

<style scoped>
.custom-table th {
  background-color: transparent !important;
  font-weight: 700;
  color: var(--bs-secondary);
}

.table-row-hover:hover {
  background-color: var(--bs-secondary-bg) !important;
  transition: background-color 0.2s;
}

.dropdown-item:active {
  background-color: var(--bs-secondary-bg);
  color: inherit;
}

.cursor-pointer { cursor: pointer; }
.modal-body::-webkit-scrollbar { width: 6px; }
.modal-body::-webkit-scrollbar-thumb { background-color: var(--bs-secondary-bg); border-radius: 4px; }
</style>