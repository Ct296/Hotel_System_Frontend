<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Cài đặt hệ thống</h3>
        <p class="text-muted small mb-0">Quản lý tùy chọn hiển thị và hồ sơ cá nhân.</p>
      </div>
    </div>

    <div v-if="notification.message" :class="`alert alert-${notification.type} shadow-sm fw-bold alert-dismissible fade show`">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle me-1' : 'fas fa-exclamation-triangle me-1'"></i>
      {{ notification.message }}
      <button type="button" class="btn-close" @click="notification.message = ''"></button>
    </div>

    <div class="row g-4">
      <!-- Cột Trái: Menu Cài đặt -->
      <div class="col-lg-3">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-3">
            <div class="nav flex-column nav-pills gap-2" role="tablist" aria-orientation="vertical">
              
              <!-- Nhóm 1: Trải nghiệm -->
              <button class="nav-link text-start fw-semibold py-3" :class="{ active: activeTab === 'preferences' }" @click="activeTab = 'preferences'">
                <i class="fas fa-desktop me-3 text-center" style="width: 20px;"></i>Hiển thị & Giao diện
              </button>
              <button class="nav-link text-start fw-semibold py-3" :class="{ active: activeTab === 'notifications' }" @click="activeTab = 'notifications'">
                <i class="fas fa-bell me-3 text-center" style="width: 20px;"></i>Âm báo & Thông báo
              </button>

              <hr class="my-2 text-muted">

              <!-- Nhóm 2: Tài khoản -->
              <button class="nav-link text-start fw-semibold py-3" :class="{ active: activeTab === 'profile' }" @click="activeTab = 'profile'">
                <i class="fas fa-user-edit me-3 text-center" style="width: 20px;"></i>Hồ sơ cá nhân
              </button>
              <button class="nav-link text-start fw-semibold py-3" :class="{ active: activeTab === 'password' }" @click="activeTab = 'password'">
                <i class="fas fa-key me-3 text-center" style="width: 20px;"></i>Đổi mật khẩu
              </button>

              <hr class="my-2 text-muted">

              <!-- Nhóm 3: Lịch sử & Bảo mật -->
              <button class="nav-link text-start fw-semibold py-3" :class="{ active: activeTab === 'security' }" @click="activeTab = 'security'">
                <i class="fas fa-shield-alt me-3 text-center" style="width: 20px;"></i>Lịch sử đăng nhập
              </button>
              <button class="nav-link text-start fw-semibold py-3" :class="{ active: activeTab === 'account_status' }" @click="activeTab = 'account_status'">
                <i class="fas fa-history me-3 text-center" style="width: 20px;"></i>Lịch sử trạng thái
              </button>

            </div>
          </div>
        </div>
      </div>

      <!-- Cột Phải: Nội dung Cài đặt -->
      <div class="col-lg-9">
        
        <!-- TAB HỒ SƠ CÁ NHÂN -->
        <div v-if="activeTab === 'profile'" class="card border-0 shadow-sm rounded-4">
          <div class="card-header bg-white border-0 pt-4 pb-2">
            <h5 class="fw-bold text-primary mb-0">Thông tin cá nhân</h5>
          </div>
          <div class="card-body p-4">
            <div v-if="isLoading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
            <form v-else @submit.prevent="submitProfile">
              <div class="row g-4">
                
                <div class="col-12 d-flex align-items-center gap-4 mb-2 border-bottom pb-4">
                  <img :src="avatarPreview || getImageUrl(profileForm.avatar)" 
                       class="rounded-circle border border-2 shadow-sm" 
                       style="width: 90px; height: 90px; object-fit: cover;" 
                       @error="handleImageError" alt="Avatar">
                  <div class="flex-grow-1">
                    <label class="fw-semibold mb-2">Ảnh đại diện mới (Không bắt buộc)</label>
                    <input type="file" @change="handleAvatarUpload" class="form-control bg-light w-50" accept="image/*">
                  </div>
                </div>

                <div class="col-md-6"><label class="fw-semibold mb-1">Họ & Tên lót <span class="text-danger">*</span></label><input v-model="profileForm.lastName" type="text" class="form-control bg-light" required></div>
                <div class="col-md-6"><label class="fw-semibold mb-1">Tên <span class="text-danger">*</span></label><input v-model="profileForm.firstName" type="text" class="form-control bg-light" required></div>
                
                <div class="col-md-6"><label class="fw-semibold mb-1">Số điện thoại <span class="text-danger">*</span></label><input v-model="profileForm.phoneNumber" type="text" class="form-control bg-light" required></div>
                <div class="col-md-6"><label class="fw-semibold mb-1">CCCD / CMND <span class="text-danger">*</span></label><input v-model="profileForm.pid" type="text" class="form-control bg-light" required></div>
                
                <div class="col-md-4">
                  <label class="fw-semibold mb-1">Giới tính <span class="text-danger">*</span></label>
                  <select v-model="profileForm.sex" class="form-select bg-light" required>
                    <option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="UNSPECIFIED">Không xác định</option>
                  </select>
                </div>
                
                <div class="col-md-4">
                  <label class="fw-semibold mb-1">Quốc tịch <span class="text-danger">*</span></label>
                  <select v-model="profileForm.nationality" class="form-select bg-light" required>
                    <option value="" disabled>-- Chọn quốc gia --</option>
                    <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
                  </select>
                </div>

                <div class="col-md-4"><label class="fw-semibold mb-1">Ngày sinh <span class="text-danger">*</span></label><input v-model="profileForm.dateOfBirth" type="date" class="form-control bg-light" required></div>
              </div>
              <div class="text-end mt-4 pt-3 border-top">
                <button type="submit" class="btn btn-primary fw-bold px-4" :disabled="isProcessing">
                  <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span> Lưu Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- TAB ĐỔI MẬT KHẨU -->
        <div v-if="activeTab === 'password'" class="card border-0 shadow-sm rounded-4">
          <div class="card-header bg-white border-0 pt-4 pb-2">
            <h5 class="fw-bold text-primary mb-0">Đổi mật khẩu</h5>
          </div>
          <div class="card-body p-4">
            <form @submit.prevent="submitPassword">
              <div class="mb-3">
                <label class="fw-semibold mb-1">Mật khẩu hiện tại <span class="text-danger">*</span></label>
                <input v-model="passwordForm.oldPass" type="password" class="form-control bg-light" required>
              </div>
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="fw-semibold mb-1">Mật khẩu mới <span class="text-danger">*</span></label>
                  <input v-model="passwordForm.newPass" type="password" minlength="8" class="form-control bg-light" required>
                </div>
                <div class="col-md-6">
                  <label class="fw-semibold mb-1">Xác nhận mật khẩu mới <span class="text-danger">*</span></label>
                  <input v-model="passwordForm.confirmPass" type="password" minlength="8" class="form-control bg-light" required>
                </div>
              </div>
              <div class="text-end">
                <button type="submit" class="btn btn-warning text-dark fw-bold px-4" :disabled="isProcessing">
                  <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span> Cập Nhật Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- CÁC TAB ĐANG PHÁT TRIỂN -->
        <div v-if="['preferences', 'notifications', 'security', 'account_status'].includes(activeTab)" class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body d-flex flex-column align-items-center justify-content-center py-5 text-muted">
            <div class="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
              <i class="fas fa-tools fs-1 text-secondary"></i>
            </div>
            <h4 class="fw-bold">Tính năng đang phát triển</h4>
            <p>Phần cài đặt này sẽ được cập nhật trong các phiên bản tiếp theo.</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import api from '../../utils/axios'

const authStore = useAuthStore()
const activeTab = ref('preferences') // Để hiển thị mục đầu tiên mặc định
const isLoading = ref(true)
const isProcessing = ref(false)
const notification = ref({ type: '', message: '' })
const countries = ref([]) 

const profileForm = ref({
  avatar: '', lastName: '', firstName: '', phoneNumber: '', pid: '', sex: 'MALE', nationality: '', dateOfBirth: ''
})
const avatarFile = ref(null)
const avatarPreview = ref(null) 

const passwordForm = ref({
  oldPass: '', newPass: '', confirmPass: ''
})

const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/100x100?text=Avatar'
  return path.startsWith('http') ? path : `https://api.ct296.id.vn${path}`
}

const handleImageError = (e) => {
  e.target.src = 'https://placehold.co/100x100?text=Avatar'
}

const showNotification = (type, message) => {
  notification.value = { type, message }
  setTimeout(() => notification.value.message = '', 5000)
}

const fetchCountries = async () => {
  try {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,translations')
    const data = await res.json()
    countries.value = data.map(c => c.translations?.vie?.common || c.name.common)
                          .sort((a, b) => a.localeCompare(b))
  } catch (error) {
    countries.value = ['Việt Nam', 'Mỹ', 'Anh', 'Pháp', 'Nhật Bản', 'Hàn Quốc', 'Trung Quốc']
  }
}

const fetchProfile = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/profile')
    const user = res.data
    profileForm.value = {
      avatar: user.avatar || '',
      lastName: user.lastName || '',
      firstName: user.firstName || '',
      phoneNumber: user.phoneNumber || '',
      pid: user.pid || '',
      sex: user.sex || 'MALE',
      nationality: user.nationality || 'Việt Nam',
      dateOfBirth: user.dateOfBirth || ''
    }
  } catch (error) {
    showNotification('danger', 'Không thể tải thông tin hồ sơ.')
  } finally {
    isLoading.value = false
  }
}

const handleAvatarUpload = (e) => {
  const file = e.target.files.length > 0 ? e.target.files[0] : null
  avatarFile.value = file
  if (file) {
    avatarPreview.value = URL.createObjectURL(file)
  } else {
    avatarPreview.value = null
  }
}

const submitProfile = async () => {
  isProcessing.value = true
  try {
    const formData = new FormData()
    formData.append('firstName', profileForm.value.firstName)
    formData.append('lastName', profileForm.value.lastName)
    formData.append('phoneNumber', profileForm.value.phoneNumber)
    formData.append('pid', profileForm.value.pid)
    formData.append('nationality', profileForm.value.nationality)
    formData.append('sex', profileForm.value.sex)
    formData.append('dateOfBirth', profileForm.value.dateOfBirth)
    if (avatarFile.value) formData.append('avatarFile', avatarFile.value)

    const res = await api.put('/api/profile/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    showNotification('success', res.data.message)
    authStore.setAuth({ ...authStore.$state, user: { ...authStore.user, avatar: res.data.user.avatar, fullName: res.data.user.fullName } })
    profileForm.value.avatar = res.data.user.avatar
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi cập nhật hồ sơ.')
  } finally {
    isProcessing.value = false
  }
}

const submitPassword = async () => {
  if (passwordForm.value.newPass !== passwordForm.value.confirmPass) {
    return showNotification('danger', 'Xác nhận mật khẩu mới không khớp.')
  }
  isProcessing.value = true
  try {
    const res = await api.put('/api/profile/change-password', passwordForm.value)
    showNotification('success', res.data.message)
    passwordForm.value = { oldPass: '', newPass: '', confirmPass: '' }
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi đổi mật khẩu.')
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => {
  fetchCountries()
  fetchProfile()
})
</script>

<style scoped>
.nav-pills .nav-link {
  color: #495057;
  border-radius: 8px;
  transition: all 0.2s ease;
}
.nav-pills .nav-link:hover:not(.active) {
  background-color: #e9ecef;
}
.nav-pills .nav-link.active {
  background-color: #0d6efd;
  color: white;
  box-shadow: 0 4px 6px rgba(13, 110, 253, 0.2);
}
</style>