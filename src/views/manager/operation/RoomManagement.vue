<template>
  <div class="position-relative">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Quản lý Phòng Vật Lý</h3>
        <p class="text-muted small mb-0">Thêm phòng thực tế, gán loại phòng và tải ảnh lên.</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary shadow-sm fw-bold">
        <i class="fas fa-plus me-2"></i> Thêm Phòng
      </button>
    </div>

    <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
      {{ notification.message }}
      <button type="button" class="btn-close" @click="notification.message = ''"></button>
    </div>

    <!-- Bảng danh sách Phòng -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="px-4 py-3" style="width: 90px;">Ảnh</th>
                <th class="py-3">Tên phòng</th>
                <th class="py-3">Vị trí / Tầng</th>
                <th class="py-3">Hạng phòng</th>
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
              <tr v-else-if="rooms.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">Chưa có phòng nào trong hệ thống.</td>
              </tr>
              <tr v-else v-for="r in rooms" :key="r.id">
                <td class="px-4">
                  <img :src="getPrimaryImageSrc(r)" 
                       class="rounded-3 shadow-sm border" 
                       style="width: 55px; height: 55px; object-fit: cover; background-color: #f8f9fa;"
                       @error="handleImageError" alt="Thumbnail">
                </td>
                <td class="fw-bold text-primary fs-6">{{ r.name }}</td>
                <td><i class="fas fa-map-marker-alt text-danger me-2"></i>{{ r.location }}</td>
                <td><span class="badge bg-light text-dark border">{{ r.roomType?.name || 'Chưa gán' }}</span></td>
                <td class="text-center">
                  <span :class="getStatusBadgeClass(r.status)" class="badge">{{ r.status }}</span>
                </td>
                <td class="text-end px-4">
                  <button @click="openEditModal(r)" class="btn btn-sm btn-outline-primary shadow-sm me-2" title="Quản lý ảnh & Chỉnh sửa">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteRoom(r.id)" class="btn btn-sm btn-outline-danger shadow-sm" title="Xóa phòng">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL THÊM/SỬA PHÒNG -->
    <div v-if="showModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold">
              <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-plus-circle'" class="me-2"></i>
              {{ isEditMode ? 'Cập nhật & Quản lý ảnh' : 'Thêm Phòng mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          
          <div class="modal-body p-4" style="max-height: 75vh; overflow-y: auto;">
            <!-- Phần 1: Thông tin phòng -->
            <form @submit.prevent="submitForm" id="roomForm">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Tên phòng (Số phòng) <span class="text-danger">*</span></label>
                  <input v-model="form.name" type="text" class="form-control" required placeholder="VD: P101, VIP-01...">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Vị trí / Tầng <span class="text-danger">*</span></label>
                  <input v-model="form.location" type="text" class="form-control" required placeholder="VD: Tầng 1, Khu A...">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Thuộc loại phòng <span class="text-danger">*</span></label>
                  <select v-model="form.roomTypeId" class="form-select" required>
                    <option value="" disabled>-- Chọn hạng phòng --</option>
                    <option v-for="rt in roomTypes" :key="rt.id" :value="rt.id">{{ rt.name }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Trạng thái <span class="text-danger">*</span></label>
                  <select v-model="form.status" class="form-select" required>
                    <option v-for="st in roomStatuses" :key="st" :value="st">{{ st }}</option>
                  </select>
                </div>
              </div>
            </form>

            <hr class="my-4 text-muted">

            <!-- Phần 2: Quản lý ảnh (Chỉ hiện khi Sửa) -->
            <div v-if="isEditMode" class="mb-4">
              <h6 class="fw-bold text-primary mb-3"><i class="fas fa-images me-2"></i>Ảnh đang có trên hệ thống</h6>
              
              <div class="row g-3">
                <!-- Khu vực hiển thị Ảnh chính -->
                <div class="col-md-3 border-end">
                  <span class="small fw-semibold text-muted d-block mb-2">ẢNH CHÍNH (THUMBNAIL)</span>
                  <div v-if="currentPrimaryImage" class="position-relative">
                    <img :src="getImageUrl(currentPrimaryImage)" class="img-thumbnail w-100 object-fit-cover" style="height: 120px;" @error="handleImageError">
                    <span class="badge bg-success position-absolute top-0 start-0 m-1 shadow-sm">Primary</span>
                  </div>
                  <div v-else class="text-muted small border rounded p-3 text-center bg-light">Chưa có ảnh</div>
                </div>

                <!-- Khu vực hiển thị lưới Ảnh phụ -->
                <div class="col-md-9">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="small fw-semibold text-muted">ẢNH PHỤ TÙY CHỌN</span>
                    <button v-if="selectedImagesToDelete.length > 0" @click="deleteSelectedImages(form.roomId)" type="button" class="btn btn-sm btn-danger shadow-sm">
                      <i class="fas fa-trash me-1"></i> Xóa {{ selectedImagesToDelete.length }} ảnh đã chọn
                    </button>
                  </div>

                  <div v-if="currentSecondaryImages.length > 0" class="row g-2">
                    <div v-for="img in currentSecondaryImages" :key="img.id" class="col-4 col-sm-3 position-relative">
                      <div class="border rounded p-1" :class="{'border-danger border-2': selectedImagesToDelete.includes(img.id)}">
                        <img :src="getImageUrl(img)" class="w-100 rounded object-fit-cover" style="height: 80px;" @error="handleImageError">
                        
                        <!-- Checkbox chọn nhiều -->
                        <div class="position-absolute top-0 start-0 ms-2 mt-1">
                          <input type="checkbox" class="form-check-input shadow-sm border-secondary cursor-pointer" :value="img.id" v-model="selectedImagesToDelete" style="width: 1.2rem; height: 1.2rem;">
                        </div>
                        
                        <!-- Nút thùng rác xóa lẻ -->
                        <button type="button" @click="deleteSingleImage(form.roomId, img.id)" class="btn btn-sm btn-danger position-absolute bottom-0 end-0 me-2 mb-1" style="padding: 2px 5px; opacity: 0.85;">
                          <i class="fas fa-trash-alt" style="font-size: 0.75rem;"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-muted small border rounded p-3 text-center bg-light">Chưa có ảnh phụ nào.</div>
                </div>
              </div>
            </div>

            <!-- Phần 3: Thêm ảnh mới (Dùng cho cả Thêm mới và Sửa) -->
            <div>
              <h6 class="fw-bold mb-3"><i class="fas fa-cloud-upload-alt me-2 text-primary"></i>Tải lên ảnh mới</h6>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Tải lên Ảnh chính mới <span v-if="!isEditMode" class="text-danger">*</span></label>
                  <input type="file" class="form-control form-control-sm" accept="image/*" @change="handlePrimaryImage" :required="!isEditMode && !currentPrimaryImage" form="roomForm">
                  <small v-if="isEditMode" class="text-muted" style="font-size: 0.75rem;">Sẽ ghi đè ảnh chính hiện tại.</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Bổ sung thêm Ảnh phụ</label>
                  <input type="file" class="form-control form-control-sm" accept="image/*" multiple @change="handleSecondaryImages" form="roomForm">
                  <small class="text-muted" style="font-size: 0.75rem;">Giữ Ctrl để chọn nhiều ảnh.</small>
                </div>
              </div>
            </div>

          </div>

          <div class="modal-footer bg-light border-0 rounded-bottom-4">
            <button type="button" class="btn btn-secondary" @click="closeModal">Hủy bỏ</button>
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
import { ref, onMounted } from 'vue'
import api from '../../../utils/axios'

const rooms = ref([])
const roomTypes = ref([])
const roomStatuses = ref([])

const isLoading = ref(true)
const isProcessing = ref(false)
const showModal = ref(false)
const isEditMode = ref(false)
const notification = ref({ type: '', message: '' })

const form = ref({ roomId: '', name: '', location: '', roomTypeId: '', status: 'AVAILABLE' })

// Biến lưu File tải lên
const primaryImageFile = ref(null)
const secondaryImageFiles = ref([])

// Biến quản lý UI Ảnh trong lúc Sửa
const currentPrimaryImage = ref(null)
const currentSecondaryImages = ref([])
const selectedImagesToDelete = ref([])

const showNotification = (type, message) => {
  notification.value = { type, message }
  setTimeout(() => notification.value.message = '', 5000)
}

const getStatusBadgeClass = (status) => {
  if (status === 'AVAILABLE') return 'bg-success'
  if (status === 'OCCUPIED') return 'bg-danger'
  if (status === 'MAINTENANCE') return 'bg-warning text-dark'
  return 'bg-secondary'
}

const getImageUrl = (imgObj) => {
  if (!imgObj) return 'https://placehold.co/100x100?text=No+Image'
  const path = imgObj.imagePath || imgObj.url || imgObj.path
  return path ? `http://localhost:8080${path}` : 'https://placehold.co/100x100?text=No+Image'
}

const getPrimaryImageSrc = (room) => {
  if (!room.images || room.images.length === 0) return 'https://placehold.co/100x100?text=No+Image'
  const primaryImg = room.images.find(img => img.isPrimary) || room.images[0]
  return getImageUrl(primaryImg)
}

const handleImageError = (e) => { e.target.src = 'https://placehold.co/100x100?text=Error' }

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/manager/operation/dashboard')
    rooms.value = res.data.rooms || []
    roomTypes.value = res.data.roomTypes || []
    roomStatuses.value = res.data.roomStatuses || []
  } catch (error) {
    showNotification('danger', 'Không thể tải dữ liệu phòng.')
  } finally {
    isLoading.value = false
  }
}

// Làm mới riêng danh sách ảnh của 1 phòng sau khi xóa ảnh (không tắt Modal)
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

  // Bóc tách ảnh để hiển thị UI
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

const closeModal = () => showModal.value = false

// --- LOGIC XÓA ẢNH (BẮN API DELETE TRỰC TIẾP) ---
const deleteSingleImage = async (roomId, imageId) => {
  if (!confirm('Bạn có chắc muốn xóa ảnh này ngay lập tức? Thao tác không thể hoàn tác.')) return
  try {
    await api.delete(`/api/manager/operation/rooms/${roomId}/images/${imageId}`)
    showNotification('success', 'Đã xóa ảnh thành công.')
    selectedImagesToDelete.value = selectedImagesToDelete.value.filter(id => id !== imageId) // Gỡ tick nếu đang tick
    await refreshRoomImagesLocal(roomId)
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Không thể xóa ảnh lúc này.')
  }
}

const deleteSelectedImages = async (roomId) => {
  if (!confirm(`Xác nhận xóa VĨNH VIỄN ${selectedImagesToDelete.value.length} ảnh đã chọn?`)) return
  isProcessing.value = true
  try {
    // Dùng Promise.all để bắn song song lệnh xóa lên Backend
    await Promise.all(selectedImagesToDelete.value.map(imageId => 
      api.delete(`/api/manager/operation/rooms/${roomId}/images/${imageId}`)
    ))
    showNotification('success', `Đã xóa thành công ${selectedImagesToDelete.value.length} ảnh.`)
    selectedImagesToDelete.value = []
    await refreshRoomImagesLocal(roomId)
  } catch (error) {
    showNotification('danger', 'Có lỗi xảy ra khi xóa một số ảnh.')
  } finally {
    isProcessing.value = false
  }
}
// ------------------------------------------------

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
    
    showNotification('success', isEditMode.value ? 'Đã lưu thay đổi phòng & tải ảnh lên!' : 'Thêm phòng mới thành công!')
    closeModal()
    fetchData()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi khi lưu phòng. Vui lòng kiểm tra lại dữ liệu.')
  } finally {
    isProcessing.value = false
  }
}

const deleteRoom = async (id) => {
  showNotification('warning', 'Chức năng xóa phòng đang được phát triển.')
}

onMounted(() => fetchData())
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.object-fit-cover { object-fit: cover; }
</style>