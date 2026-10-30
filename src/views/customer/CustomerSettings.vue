<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-body-emphasis mb-1">Cài đặt hệ thống</h3>
        <p class="text-body-secondary small mb-0">Tùy chỉnh giao diện, hồ sơ cá nhân và bảo mật tài khoản.</p>
      </div>
    </div>

    <div v-if="notification.message" :class="`alert alert-${notification.type} shadow-sm fw-bold alert-dismissible fade show`">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle me-1' : 'fas fa-exclamation-triangle me-1'"></i>
      {{ notification.message }}
      <button type="button" class="btn-close" @click="notification.message = ''"></button>
    </div>

    <div class="row g-4 align-items-start">
      <!-- CỘT TRÁI: MENU CÀI ĐẶT (Đã khóa cứng) -->
      <div class="col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 bg-body-tertiary settings-sidebar">
          <div class="card-body p-3">
            <div class="nav flex-column nav-pills gap-2" role="tablist" aria-orientation="vertical">
              
              <!-- Nhóm 1: Trải nghiệm -->
              <button class="nav-link text-start fw-semibold py-3" :class="{ active: activeTab === 'preferences' }" @click="activeTab = 'preferences'">
                <i class="fas fa-desktop me-3 text-center" style="width: 20px;"></i>Hiển thị & Giao diện
              </button>
              <button class="nav-link text-start fw-semibold py-3" :class="{ active: activeTab === 'notifications' }" @click="activeTab = 'notifications'">
                <i class="fas fa-bell me-3 text-center" style="width: 20px;"></i>Âm báo & Thông báo
              </button>

              <hr class="my-2 text-secondary opacity-25">

              <!-- Nhóm 2: Tài khoản -->
              <button class="nav-link text-start fw-semibold py-3" :class="{ active: activeTab === 'profile' }" @click="activeTab = 'profile'">
                <i class="fas fa-user-edit me-3 text-center" style="width: 20px;"></i>Hồ sơ cá nhân
              </button>
              <button class="nav-link text-start fw-semibold py-3" :class="{ active: activeTab === 'password' }" @click="activeTab = 'password'">
                <i class="fas fa-key me-3 text-center" style="width: 20px;"></i>Đổi mật khẩu
              </button>

              <hr class="my-2 text-secondary opacity-25">

              <!-- Nhóm 3: Lịch sử & Bảo mật -->
              <button class="nav-link text-start fw-semibold py-3" :class="{ active: activeTab === 'security' }" @click="activeTab = 'security'">
                <i class="fas fa-shield-alt me-3 text-center" style="width: 20px;"></i>Lịch sử đăng nhập
              </button>
              <button class="nav-link text-start fw-semibold py-3" :class="{ active: activeTab === 'account_status' }" @click="activeTab = 'account_status'">
                <i class="fas fa-history me-3 text-center" style="width: 20px;"></i>Lịch sử trạng thái
              </button>

              <hr class="my-2 text-secondary opacity-25">
              
              <!-- Nút Quay Lại Hồ Sơ (Dành riêng cho Customer) -->
              <router-link to="/customer/profile" class="btn btn-outline-danger fw-bold rounded-3 w-100 text-start py-2 d-flex align-items-center mt-2">
                <i class="fas fa-arrow-left me-3 text-center" style="width: 20px;"></i> Quay lại Hồ sơ
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- CỘT PHẢI: NỘI DUNG CÀI ĐẶT -->
      <div class="col-lg-9">
        
        <!-- TAB HỒ SƠ CÁ NHÂN -->
        <div v-if="activeTab === 'profile'" class="card border-0 shadow-sm rounded-4 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-2">
            <h5 class="fw-bold text-primary mb-0">Thông tin cá nhân</h5>
          </div>
          <div class="card-body p-4">
            <div v-if="isLoading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
            <form v-else @submit.prevent="submitProfileUpdate">
              <div class="row g-4">
                
                <div class="col-12 d-flex align-items-center gap-4 mb-2 border-bottom border-secondary-subtle pb-4">
                  <img :src="avatarPreview || getImageUrl(currentUser.avatar)" 
                       class="rounded-circle border border-2 shadow-sm object-fit-cover bg-white" 
                       style="width: 90px; height: 90px;" 
                       @error="handleImageError" alt="Avatar">
                  <div class="flex-grow-1">
                    <label class="fw-semibold mb-2 text-body-emphasis">Ảnh đại diện mới (Không bắt buộc)</label>
                    <input type="file" @change="handleAvatarUpload" class="form-control bg-body w-75" accept="image/*">
                    <small class="text-body-secondary mt-1 d-block">Định dạng JPG, PNG. Tối đa 2MB.</small>
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="fw-bold mb-1 text-body-secondary">Họ <span class="text-danger">*</span></label>
                  <input v-model="profileForm.lastName" type="text" class="form-control form-control-lg bg-body text-body-emphasis" required>
                </div>
                <div class="col-md-6">
                  <label class="fw-bold mb-1 text-body-secondary">Tên <span class="text-danger">*</span></label>
                  <input v-model="profileForm.firstName" type="text" class="form-control form-control-lg bg-body text-body-emphasis" required>
                </div>
                
                <div class="col-md-6">
                  <label class="fw-bold mb-1 text-body-secondary">Số điện thoại <span class="text-danger">*</span></label>
                  <input v-model="profileForm.phoneNumber" type="text" class="form-control form-control-lg bg-body text-body-emphasis" required>
                </div>
                <div class="col-md-6">
                  <label class="fw-bold mb-1 text-body-secondary">CCCD / Hộ chiếu <span class="text-danger">*</span></label>
                  <input v-model="profileForm.pid" type="text" class="form-control form-control-lg bg-body text-body-emphasis" required>
                </div>
                
                <div class="col-md-4">
                  <label class="fw-bold mb-1 text-body-secondary">Quốc tịch <span class="text-danger">*</span></label>
                  <select v-model="profileForm.nationality" class="form-select form-select-lg bg-body text-body-emphasis" required>
                    <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="fw-bold mb-1 text-body-secondary">Giới tính <span class="text-danger">*</span></label>
                  <select v-model="profileForm.sex" class="form-select form-select-lg bg-body text-body-emphasis" required>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="UNSPECIFIED">Không xác định</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="fw-bold mb-1 text-body-secondary">Ngày sinh <span class="text-danger">*</span></label>
                  <input v-model="profileForm.dateOfBirth" type="date" class="form-control form-control-lg bg-body text-body-emphasis" required>
                </div>
              </div>

              <div class="text-end mt-4 pt-3 border-top border-secondary-subtle">
                <button type="submit" class="btn btn-primary fw-bold px-4 py-2 rounded-3 shadow-sm" :disabled="isProcessing">
                  <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span> <i v-else class="fas fa-save me-2"></i> Lưu Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- TAB ĐỔI MẬT KHẨU -->
        <div v-if="activeTab === 'password'" class="card border-0 shadow-sm rounded-4 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-2">
            <h5 class="fw-bold text-primary mb-0">Đổi mật khẩu</h5>
          </div>
          <div class="card-body p-4">
            <form @submit.prevent="submitPasswordChange">
              <div class="mb-3">
                <label class="fw-bold mb-1 text-body-secondary">Mật khẩu hiện tại <span class="text-danger">*</span></label>
                <input v-model="passwordForm.oldPass" type="password" class="form-control form-control-lg bg-body text-body-emphasis" required>
              </div>
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="fw-bold mb-1 text-body-secondary">Mật khẩu mới <span class="text-danger">*</span></label>
                  <input v-model="passwordForm.newPass" type="password" class="form-control form-control-lg bg-body text-body-emphasis" minlength="8" required>
                </div>
                <div class="col-md-6">
                  <label class="fw-bold mb-1 text-body-secondary">Xác nhận mật khẩu mới <span class="text-danger">*</span></label>
                  <input v-model="passwordForm.confirmPass" type="password" class="form-control form-control-lg bg-body text-body-emphasis" minlength="8" required>
                </div>
              </div>
              <div class="text-end border-top border-secondary-subtle pt-3">
                <button type="submit" class="btn btn-warning text-dark fw-bold px-4 py-2 rounded-3 shadow-sm" :disabled="isProcessing">
                  <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span> <i v-else class="fas fa-key me-2"></i> Cập Nhật Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- TAB HIỂN THỊ & GIAO DIỆN -->
        <div v-if="activeTab === 'preferences'" class="card border-0 shadow-sm rounded-4 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-2">
            <h5 class="fw-bold text-primary mb-0">Hiển thị & Giao diện</h5>
          </div>
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-4 p-4 border border-secondary-subtle rounded-4 bg-body">
              <div>
                <h6 class="fw-bold mb-1 text-body-emphasis"><i class="fas fa-moon me-2 text-warning"></i>Chế độ Tối (Dark Mode)</h6>
                <p class="text-body-secondary small mb-0">Chuyển toàn bộ hệ thống sang nền tối giúp dịu mắt hơn.</p>
              </div>
              <div class="form-check form-switch mb-0" style="transform: scale(1.3); margin-right: 10px;">
                <input class="form-check-input cursor-pointer shadow-sm" type="checkbox" role="switch"
                       :checked="themeStore.isDarkMode" @change="themeStore.toggleTheme()">
              </div>
            </div>
          </div>
        </div>

        <!-- CÁC TAB ĐANG PHÁT TRIỂN -->
        <div v-if="['notifications', 'security', 'account_status'].includes(activeTab)" class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-body d-flex flex-column align-items-center justify-content-center py-5 text-muted">
            <div class="bg-body border border-secondary-subtle rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style="width: 80px; height: 80px;">
              <i class="fas fa-tools fs-1 text-primary"></i>
            </div>
            <h4 class="fw-bold text-body-emphasis">Tính năng đang phát triển</h4>
            <p class="text-body-secondary">Phần cài đặt tùy chỉnh này sẽ được ra mắt trong các phiên bản cập nhật tiếp theo.</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import api from '../../utils/axios'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const activeTab = ref('preferences')
const isLoading = ref(true)
const isProcessing = ref(false)
const notification = ref({ type: '', message: '' })
const countries = ref([]) 

const currentUser = ref({})
const profileForm = ref({ lastName: '', firstName: '', phoneNumber: '', pid: '', sex: 'MALE', nationality: '', dateOfBirth: '' })
const avatarFile = ref(null)
const avatarPreview = ref(null) 
const passwordForm = ref({ oldPass: '', newPass: '', confirmPass: '' })

const backendBaseUrl = 'https://api.ct296.id.vn'
const defaultAvatar = `${backendBaseUrl}/image/default_avatar_customer.jpg`

const getImageUrl = (path) => {
  if (!path || path.trim() === '') return defaultAvatar
  return path.startsWith('http') ? path : `${backendBaseUrl}${path}`
}
const handleImageError = (e) => { e.target.src = defaultAvatar }

const showNotification = (type, message) => {
  notification.value = { type, message }
  setTimeout(() => notification.value.message = '', 5000)
}

const fetchCountries = async () => {
  try {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,translations')
    const data = await res.json()
    countries.value = data.map(c => c.translations?.vie?.common || c.name.common).sort((a, b) => a.localeCompare(b))
  } catch (error) {
    countries.value = ['Việt Nam', 'Mỹ', 'Anh', 'Nhật Bản', 'Hàn Quốc']
  }
}

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/customer/profile')
    currentUser.value = res.data.currentUser || {}
    
    profileForm.value = {
      lastName: currentUser.value.lastName || '',
      firstName: currentUser.value.firstName || '',
      phoneNumber: currentUser.value.phoneNumber || '',
      pid: currentUser.value.pid || '',
      sex: currentUser.value.sex || 'MALE',
      nationality: currentUser.value.nationality || 'Việt Nam',
      dateOfBirth: currentUser.value.dateOfBirth || ''
    }
  } catch (error) {
    showNotification('danger', 'Lỗi tải dữ liệu.')
  } finally {
    isLoading.value = false
  }
}

const handleAvatarUpload = (e) => {
  const file = e.target.files.length > 0 ? e.target.files[0] : null
  avatarFile.value = file
  if (file) avatarPreview.value = URL.createObjectURL(file)
  else avatarPreview.value = null
}

const submitProfileUpdate = async () => {
  isProcessing.value = true
  try {
    const formData = new FormData()
    Object.keys(profileForm.value).forEach(key => formData.append(key, profileForm.value[key]))
    if (avatarFile.value) formData.append('avatarFile', avatarFile.value)

    const res = await api.put('/api/customer/profile/update', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    showNotification('success', res.data.message)
    authStore.setAuth({ ...authStore.$state, user: { ...authStore.user, avatar: res.data.user.avatar, fullName: `${res.data.user.lastName} ${res.data.user.firstName}` } })
    fetchData()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi cập nhật.')
  } finally {
    isProcessing.value = false
  }
}

const submitPasswordChange = async () => {
  if (passwordForm.value.newPass !== passwordForm.value.confirmPass) return showNotification('danger', 'Xác nhận mật khẩu không khớp.')
  isProcessing.value = true
  try {
    const res = await api.put('/api/customer/profile/change-password', passwordForm.value)
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
  fetchData()
})
</script>

<style scoped>
/* KHÓA CỨNG THANH MENU BÊN TRÁI */
@media (min-width: 992px) {
  .settings-sidebar {
    position: sticky;
    top: 90px;
    z-index: 10;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
  }
  
  /* Làm gọn thanh cuộn của Menu (nếu màn hình bị lùn) */
  .settings-sidebar::-webkit-scrollbar {
    width: 4px;
  }
  .settings-sidebar::-webkit-scrollbar-thumb {
    background-color: var(--bs-secondary-bg);
    border-radius: 4px;
  }
}

.nav-pills .nav-link {
  color: var(--bs-body-color);
  border-radius: 8px;
  transition: all 0.2s ease;
}
.nav-pills .nav-link:hover:not(.active) {
  background-color: var(--bs-secondary-bg);
}
.nav-pills .nav-link.active {
  background-color: #0d6efd;
  color: white;
  box-shadow: 0 4px 6px rgba(13, 110, 253, 0.2);
}
.cursor-pointer {
  cursor: pointer;
}

/* Fix CSS Hover trong Dark Mode */
[data-bs-theme="dark"] .nav-pills .nav-link:hover:not(.active) {
  background-color: rgba(255,255,255,0.05);
}
.object-fit-cover {
  object-fit: cover;
}
</style>