<template>
  <div class="position-relative">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-body-emphasis mb-1">Quản lý Phòng Vật Lý</h3>
        <p class="text-body-secondary small mb-0">Thêm phòng thực tế, gán loại phòng và tải ảnh lên.</p>
      </div>
      <button @click="openCreateModal" class="btn fw-bold px-4 shadow-sm" style="background-color: #6366f1; color: white; border: none; height: 38px;">
        <i class="fas fa-plus me-2"></i> THÊM PHÒNG
      </button>
    </div>

    <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
      {{ notification.message }}
      <button type="button" class="btn-close" @click="notification.message = ''"></button>
    </div>

    <!-- KHỐI QUẢN LÝ DANH SÁCH -->
    <div class="card border-0 shadow-sm rounded-4 bg-body-tertiary">
      
      <!-- HEADER: THANH CÔNG CỤ -->
      <div class="card-header bg-transparent border-bottom-0 pt-4 pb-3">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          
          <div class="d-flex align-items-center gap-2 flex-wrap flex-grow-1">
            <!-- Nút Lọc Mở Rộng -->
            <div class="dropdown">
              <button class="btn btn-outline-secondary bg-body text-body-emphasis border-secondary-subtle px-3 shadow-sm d-flex align-items-center justify-content-center" style="height: 38px;" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-filter text-secondary"></i>
              </button>
              <div class="dropdown-menu shadow-lg border-0 p-3 rounded-4" style="width: 280px;">
                <h6 class="dropdown-header fw-bold text-body-emphasis px-0 mb-2">Bộ lọc phòng</h6>
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-body-secondary mb-1">Trạng thái phòng</label>
                  <select v-model="filterStatus" class="form-select form-select-sm bg-body">
                    <option value="ALL">Tất cả Trạng thái</option>
                    <option v-for="st in roomStatuses" :key="st" :value="st">{{ st }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Thanh tìm kiếm & Nút Làm Mới -->
            <div class="input-group shadow-sm" style="max-width: 320px;">
              <span class="input-group-text bg-body border-secondary-subtle text-secondary bg-transparent">
                <i class="fas fa-search"></i>
              </span>
              <input type="text" v-model="searchQuery" class="form-control bg-body border-secondary-subtle border-start-0 ps-0 shadow-none text-body-emphasis" placeholder="Tìm tên phòng, loại phòng...">
              <button @click="resetFilters" class="btn btn-outline-secondary bg-body border-secondary-subtle text-body-emphasis" type="button" title="Làm mới bộ lọc & tìm kiếm">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

        </div>
      </div>
      
      <div class="card-body p-0 mt-2">
        <div class="table-responsive">
          <table class="table align-middle mb-0 custom-table">
            <thead class="table-light text-body-secondary" style="font-size: 0.75rem;">
              <tr>
                <th class="px-4 py-3 fw-bold border-0 text-uppercase">Phòng</th>
                <th class="py-3 fw-bold border-0 text-uppercase">Vị trí</th>
                <th class="py-3 fw-bold border-0 text-uppercase">Hạng</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-center" style="width: 100px;">Ảnh chính</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-center">SL Ảnh chính</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-center">SL Ảnh phụ</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-center">Trạng thái</th>
                <th class="py-3 fw-bold border-0 text-end px-4"></th>
              </tr>
            </thead>
            <tbody class="bg-body border-top-0">
              <tr v-if="isLoading">
                <td colspan="8" class="text-center py-5 text-body-secondary">
                  <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div> Đang tải...
                </td>
              </tr>
              <tr v-else-if="filteredRooms.length === 0">
                <td colspan="8" class="text-center py-5 text-body-secondary">
                  <i class="fas fa-search-minus fs-2 mb-3 opacity-50"></i>
                  <p class="mb-0">Không tìm thấy phòng phù hợp.</p>
                </td>
              </tr>
              <tr v-else v-for="r in filteredRooms" :key="r.id" class="table-row-hover border-bottom border-secondary-subtle">
                <td class="px-4 fw-bold text-primary fs-6">{{ r.name }}</td>
                <td class="text-body-secondary small"><i class="fas fa-map-marker-alt text-danger me-1"></i>{{ r.location }}</td>
                <td><span class="badge bg-body-secondary text-body-emphasis border border-secondary-subtle">{{ r.roomType?.name || 'N/A' }}</span></td>
                <td class="text-center">
                  <img :src="getPrimaryImageSrc(r)" 
                       class="rounded-3 shadow-sm border border-secondary-subtle bg-white" 
                       style="width: 45px; height: 45px; object-fit: cover;"
                       @error="handleImageError" alt="Thumbnail">
                </td>
                <td class="text-center fw-semibold text-body-secondary">{{ getPrimaryImageCount(r) }}</td>
                <td class="text-center fw-semibold text-body-secondary">{{ getSecondaryImageCount(r) }}</td>
                <td class="text-center">
                  <span :class="getStatusBadgeClass(r.status)" class="badge rounded-pill fw-bold">{{ r.status }}</span>
                </td>
                <td class="text-end px-4">
                  <div class="dropdown">
                    <button class="btn btn-link text-body-secondary p-0 shadow-none fs-5" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="fas fa-list"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm border-secondary-subtle rounded-3">
                      <li>
                        <button class="dropdown-item fw-semibold text-info py-2" @click="openEditModal(r)">
                          <i class="fas fa-edit me-2"></i> Chỉnh sửa & Quản lý Ảnh
                        </button>
                      </li>
                      <li>
                        <button class="dropdown-item fw-semibold text-danger py-2" @click="deleteRoom(r.id)">
                          <i class="fas fa-trash me-2"></i> Xóa phòng
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

    <!-- MODAL THÊM / SỬA PHÒNG -->
    <div v-if="showModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold">
              <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-plus-circle'" class="me-2"></i>
              {{ isEditMode ? 'Cập nhật & Quản lý Ảnh' : 'Thêm Phòng Mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          
          <div class="modal-body p-4" style="max-height: 75vh; overflow-y: auto;">
            <!-- Phần 1: Thông tin phòng -->
            <form @submit.prevent="submitForm" id="roomForm">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary">Tên phòng (Số phòng) <span class="text-danger">*</span></label>
                  <input v-model="form.name" type="text" class="form-control bg-body text-body-emphasis" required placeholder="VD: P101, VIP-01...">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary">Vị trí / Tầng <span class="text-danger">*</span></label>
                  <input v-model="form.location" type="text" class="form-control bg-body text-body-emphasis" required placeholder="VD: Tầng 1, Khu A...">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary">Thuộc Hạng phòng <span class="text-danger">*</span></label>
                  <select v-model="form.roomTypeId" class="form-select bg-body text-body-emphasis" required>
                    <option value="" disabled>-- Chọn Hạng phòng --</option>
                    <option v-for="rt in roomTypes" :key="rt.id" :value="rt.id">{{ rt.name }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary">Trạng thái <span class="text-danger">*</span></label>
                  <select v-model="form.status" class="form-select bg-body fw-bold text-body-emphasis" :class="getStatusTextClass(form.status)" required>
                    <option v-for="st in roomStatuses" :key="st" :value="st">{{ st }}</option>
                  </select>
                </div>
              </div>
            </form>

            <hr class="my-4 border-secondary-subtle">

            <!-- Phần 2: Quản lý ảnh (Chỉ hiện khi Sửa) -->
            <div v-if="isEditMode" class="mb-4">
              <h6 class="fw-bold text-primary mb-3"><i class="fas fa-images me-2"></i>Ảnh hiện tại trên hệ thống</h6>
              
              <div class="row g-3">
                <!-- Khu vực ảnh chính -->
                <div class="col-md-4 border-end border-secondary-subtle">
                  <span class="small fw-semibold text-body-secondary d-block mb-2">ẢNH CHÍNH (THUMBNAIL)</span>
                  <div v-if="currentPrimaryImage" class="position-relative">
                    <img :src="getImageUrl(currentPrimaryImage)" class="img-thumbnail w-100 object-fit-cover bg-white" style="height: 120px;" @error="handleImageError">
                    <span class="badge bg-success position-absolute top-0 start-0 m-1 shadow-sm">Primary</span>
                  </div>
                  <div v-else class="text-body-secondary small border border-secondary-subtle rounded p-3 text-center bg-body">Chưa có ảnh chính</div>
                </div>

                <!-- Khu vực ảnh phụ -->
                <div class="col-md-8">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="small fw-semibold text-body-secondary">ẢNH PHỤ TÙY CHỌN</span>
                    <button v-if="selectedImagesToDelete.length > 0" @click="deleteSelectedImages(form.roomId)" type="button" class="btn btn-sm btn-danger shadow-sm">
                      <i class="fas fa-trash me-1"></i> Xóa {{ selectedImagesToDelete.length }} ảnh
                    </button>
                  </div>
                  <div v-if="currentSecondaryImages.length > 0" class="row g-2">
                    <div v-for="img in currentSecondaryImages" :key="img.id" class="col-4 col-sm-3 position-relative">
                      <div class="border border-secondary-subtle rounded p-1 bg-body" :class="{'border-danger border-2': selectedImagesToDelete.includes(img.id)}">
                        <img :src="getImageUrl(img)" class="w-100 rounded object-fit-cover bg-white" style="height: 80px;" @error="handleImageError">
                        
                        <!-- Checkbox chọn nhiều -->
                        <div class="position-absolute top-0 start-0 ms-2 mt-1">
                          <input type="checkbox" class="form-check-input shadow-sm border-secondary cursor-pointer" :value="img.id" v-model="selectedImagesToDelete" style="width: 1.2rem; height: 1.2rem;">
                        </div>
                        
                        <!-- Nút thùng rác -->
                        <button type="button" @click="deleteSingleImage(form.roomId, img.id)" class="btn btn-sm btn-danger position-absolute bottom-0 end-0 me-2 mb-1" style="padding: 2px 5px; opacity: 0.85;">
                          <i class="fas fa-trash-alt" style="font-size: 0.75rem;"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-body-secondary small border border-secondary-subtle rounded p-3 text-center bg-body">Chưa có ảnh phụ.</div>
                </div>
              </div>
            </div>

            <!-- Phần 3: Tải ảnh mới -->
            <div>
              <h6 class="fw-bold mb-3 text-body-emphasis"><i class="fas fa-cloud-upload-alt me-2 text-primary"></i>Tải ảnh mới</h6>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary small">Ảnh chính mới <span v-if="!isEditMode" class="text-danger">*</span></label>
                  <input type="file" class="form-control form-control-sm bg-body" accept="image/*" @change="handlePrimaryImage" :required="!isEditMode && !currentPrimaryImage" form="roomForm">
                  <small v-if="isEditMode" class="text-body-secondary" style="font-size: 0.75rem;">Sẽ ghi đè ảnh chính hiện tại.</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary small">Bổ sung ảnh phụ</label>
                  <input type="file" class="form-control form-control-sm bg-body" accept="image/*" multiple @change="handleSecondaryImages" form="roomForm">
                  <small class="text-body-secondary" style="font-size: 0.75rem;">Giữ Ctrl để chọn nhiều ảnh.</small>
                </div>
              </div>
            </div>

          </div>
          <div class="modal-footer bg-body border-0 rounded-bottom-4">
            <button type="button" class="btn btn-secondary fw-semibold" @click="closeModal">Hủy</button>
            <button type="submit" form="roomForm" class="btn btn-primary fw-bold" :disabled="isProcessing">
              <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> 
              {{ isEditMode ? 'Lưu toàn bộ thay đổi' : 'Xác nhận Thêm phòng' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../../utils/axios'

const rooms = ref([])
const roomTypes = ref([])
const roomStatuses = ref([])
const isLoading = ref(true)
const isProcessing = ref(false)
const notification = ref({ type: '', message: '' })

// Quản lý Modal & Form
const showModal = ref(false)
const isEditMode = ref(false)
const form = ref({ roomId: '', name: '', location: '', roomTypeId: '', status: 'AVAILABLE' })

// Quản lý Ảnh
const primaryImageFile = ref(null)
const secondaryImageFiles = ref([])
const currentPrimaryImage = ref(null)
const currentSecondaryImages = ref([])
const selectedImagesToDelete = ref([])

// Tính năng Tìm kiếm & Lọc
const searchQuery = ref('')
const filterStatus = ref('ALL')

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'ALL'
}

const filteredRooms = computed(() => {
  let result = rooms.value

  // 1. Lọc theo trạng thái
  if (filterStatus.value !== 'ALL') {
    result = result.filter(r => r.status === filterStatus.value)
  }

  // 2. Tìm kiếm theo tên hoặc loại phòng
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(r => 
      r.name?.toLowerCase().includes(q) || r.roomType?.name?.toLowerCase().includes(q)
    )
  }

  return result
})

const showNotification = (type, message) => {
  notification.value = { type, message }
  setTimeout(() => notification.value.message = '', 5000)
}

// Xử lý Class Trạng Thái
const getStatusBadgeClass = (status) => {
  if (status === 'AVAILABLE') return 'bg-success-subtle text-success'
  if (status === 'OCCUPIED') return 'bg-danger-subtle text-danger'
  if (status === 'MAINTENANCE') return 'bg-warning-subtle text-warning'
  return 'bg-secondary'
}

const getStatusTextClass = (status) => {
  if (status === 'AVAILABLE') return 'text-success'
  if (status === 'OCCUPIED') return 'text-danger'
  if (status === 'MAINTENANCE') return 'text-warning'
  return 'text-body'
}

const getImageUrl = (imgObj) => {
  if (!imgObj) return 'https://placehold.co/100x100?text=No+Image'
  const path = imgObj.imagePath || imgObj.url || imgObj.path
  return path ? `https://api.ct296.id.vn${path}` : 'https://placehold.co/100x100?text=No+Image'
}

const getPrimaryImageCount = (room) => {
  if (!room.images) return 0;
  return room.images.filter(img => img.isPrimary).length;
}

const getSecondaryImageCount = (room) => {
  if (!room.images) return 0;
  return room.images.filter(img => !img.isPrimary).length;
}

const getPrimaryImageSrc = (room) => {
  if (!room.images || room.images.length === 0) return 'https://placehold.co/100x100?text=No+Image'
  const primaryImg = room.images.find(img => img.isPrimary) || room.images[0]
  return getImageUrl(primaryImg)
}

const handleImageError = (e) => { e.target.src = 'https://placehold.co/100x100?text=Error' }

// Lấy dữ liệu
const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/manager/operation/dashboard')
    rooms.value = res.data.rooms || []
    roomTypes.value = res.data.roomTypes || []
    roomStatuses.value = res.data.roomStatuses || []
  } catch (error) {
    showNotification('danger', 'Không thể tải danh sách phòng.')
  } finally {
    isLoading.value = false
  }
}

const refreshRoomImagesLocal = async (roomId) => {
  try {
    const res = await api.get('/api/manager/operation/dashboard')
    rooms.value = res.data.rooms || []
    const updatedRoom = rooms.value.find(r => r.id === roomId)
    if (updatedRoom) {
      if (updatedRoom.images && updatedRoom.images.length > 0) {
        currentPrimaryImage.value = updatedRoom.images.find(i => i.isPrimary) || updatedRoom.images[0]
        currentSecondaryImages.value = updatedRoom.images.filter(i => i.id !== currentPrimaryImage.value.id)
      } else {
        currentPrimaryImage.value = null
        currentSecondaryImages.value = []
      }
    }
  } catch (error) {}
}

const handlePrimaryImage = (e) => { primaryImageFile.value = e.target.files.length > 0 ? e.target.files[0] : null }
const handleSecondaryImages = (e) => { secondaryImageFiles.value = Array.from(e.target.files) }

const openCreateModal = () => {
  isEditMode.value = false
  form.value = { roomId: '', name: '', location: '', roomTypeId: '', status: 'AVAILABLE' }
  
  primaryImageFile.value = null
  secondaryImageFiles.value = []
  currentPrimaryImage.value = null
  currentSecondaryImages.value = []
  
  const fileInputs = document.querySelectorAll('input[type="file"]')
  fileInputs.forEach(input => input.value = '')
  
  showModal.value = true
}

const openEditModal = (r) => {
  isEditMode.value = true
  form.value = { roomId: r.id, name: r.name, location: r.location, roomTypeId: r.roomType?.id || '', status: r.status }
  
  primaryImageFile.value = null
  secondaryImageFiles.value = []
  selectedImagesToDelete.value = []
  
  if (r.images && r.images.length > 0) {
    currentPrimaryImage.value = r.images.find(i => i.isPrimary) || r.images[0]
    currentSecondaryImages.value = r.images.filter(i => i.id !== currentPrimaryImage.value.id)
  } else {
    currentPrimaryImage.value = null
    currentSecondaryImages.value = []
  }
  
  const fileInputs = document.querySelectorAll('input[type="file"]')
  fileInputs.forEach(input => input.value = '')
  
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const deleteSingleImage = async (roomId, imageId) => {
  if (!confirm('Bạn có muốn xóa bức ảnh này ngay lúc này? Thao tác không thể hoàn tác.')) return
  try {
    await api.delete(`/api/manager/operation/rooms/${roomId}/images/${imageId}`)
    showNotification('success', 'Xóa ảnh thành công.')
    selectedImagesToDelete.value = selectedImagesToDelete.value.filter(id => id !== imageId)
    await refreshRoomImagesLocal(roomId)
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Không thể xóa ảnh này.')
  }
}

const deleteSelectedImages = async (roomId) => {
  if (!confirm(`Xác nhận xóa VĨNH VIỄN ${selectedImagesToDelete.value.length} ảnh đã chọn?`)) return
  isProcessing.value = true
  try {
    await Promise.all(selectedImagesToDelete.value.map(imageId => 
      api.delete(`/api/manager/operation/rooms/${roomId}/images/${imageId}`)
    ))
    showNotification('success', `Đã xóa thành công ${selectedImagesToDelete.value.length} ảnh.`)
    selectedImagesToDelete.value = []
    await refreshRoomImagesLocal(roomId)
  } catch (error) {
    showNotification('danger', 'Có lỗi xảy ra khi xóa ảnh.')
  } finally {
    isProcessing.value = false
  }
}

const submitForm = async () => {
  isProcessing.value = true
  try {
    const formData = new FormData()
    if (isEditMode.value) formData.append('roomId', form.value.roomId)
    formData.append('name', form.value.name)
    formData.append('location', form.value.location)
    formData.append('roomTypeId', form.value.roomTypeId)
    formData.append('status', form.value.status)
    
    if (primaryImageFile.value) formData.append('primaryImageFile', primaryImageFile.value)
    if (secondaryImageFiles.value.length > 0) {
      secondaryImageFiles.value.forEach(file => formData.append('secondaryImageFiles', file))
    }
    
    await api.post('/api/manager/operation/rooms', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    
    showNotification('success', isEditMode.value ? 'Lưu thay đổi phòng & tải ảnh lên thành công!' : 'Thêm phòng mới thành công!')
    closeModal()
    fetchData()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi khi lưu phòng. Vui lòng kiểm tra lại dữ liệu.')
  } finally {
    isProcessing.value = false
  }
}

const deleteRoom = async (id) => {
  showNotification('warning', 'Chức năng xóa phòng vật lý đang tạm khóa để bảo vệ dữ liệu.')
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
.object-fit-cover { object-fit: cover; }
.modal-body::-webkit-scrollbar { width: 6px; }
.modal-body::-webkit-scrollbar-thumb { background-color: var(--bs-secondary-bg); border-radius: 4px; }
</style>
