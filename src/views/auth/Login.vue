<template>
  <div class="d-flex align-items-center justify-content-center min-vh-100 bg-body-tertiary py-4">
    <div class="card shadow-lg p-4 p-md-5 bg-body" style="width: 100%; max-width: 440px; border-radius: 1.2rem; border: none;">
      
      <!-- HEADER ĐỘNG THEO CHẾ ĐỘ -->
      <div class="text-center mb-4">
        <h3 class="fw-bold text-primary mb-1">ITHotel</h3>
        <p class="text-body-secondary small mb-0" v-if="mode === 'LOGIN'">Đăng nhập dành cho Khách hàng</p>
        <p class="text-body-secondary small mb-0" v-else-if="mode === 'FORGOT_INFO'">Khôi phục mật khẩu - Xác minh thông tin</p>
        <p class="text-body-secondary small mb-0" v-else-if="mode === 'FORGOT_OTP'">Khôi phục mật khẩu - Nhập mã OTP</p>
        <p class="text-body-secondary small mb-0" v-else-if="mode === 'FORGOT_RESET'">Khôi phục mật khẩu - Thiết lập mật khẩu mới</p>
      </div>

      <!-- THÔNG BÁO LỖI / THÀNH CÔNG -->
      <div v-if="errorMsg" class="alert alert-danger py-2 text-center small fw-semibold shadow-sm">
        <i class="fas fa-exclamation-triangle me-1"></i> {{ errorMsg }}
      </div>
      <div v-if="successMsg" class="alert alert-success py-2 text-center small fw-semibold shadow-sm">
        <i class="fas fa-check-circle me-1"></i> {{ successMsg }}
      </div>

      <!-- ==================== 1. FORM ĐĂNG NHẬP ==================== -->
      <form v-if="mode === 'LOGIN'" @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label fw-semibold text-body-secondary small">Email</label>
          <input v-model="email" type="email" class="form-control form-control-lg bg-body-tertiary text-body-emphasis" placeholder="Nhập email..." required />
        </div>
        
        <div class="mb-2">
          <label class="form-label fw-semibold text-body-secondary small">Mật khẩu</label>
          <input v-model="password" type="password" class="form-control form-control-lg bg-body-tertiary text-body-emphasis" placeholder="Nhập mật khẩu..." required />
        </div>

        <!-- Link Quên mật khẩu -->
        <div class="d-flex justify-content-end mb-4">
          <a href="#" @click.prevent="switchMode('FORGOT_INFO')" class="text-decoration-none small fw-semibold text-primary">
            Quên mật khẩu?
          </a>
        </div>

        <button type="submit" class="btn btn-primary w-100 fw-bold py-3 rounded-pill shadow-sm" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          ĐĂNG NHẬP
        </button>
      </form>

      <!-- ==================== 2. BƯỚC 1: NHẬP EMAIL, SĐT, CCCD ==================== -->
      <form v-else-if="mode === 'FORGOT_INFO'" @submit.prevent="handleRequestOtp">
        <div class="mb-3">
          <label class="form-label fw-semibold text-body-secondary small">Email đăng ký <span class="text-danger">*</span></label>
          <input v-model="forgotForm.email" type="email" class="form-control bg-body-tertiary text-body-emphasis" placeholder="Nhập đúng email tài khoản..." required />
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold text-body-secondary small">Số điện thoại <span class="text-danger">*</span></label>
          <input v-model="forgotForm.phoneNumber" type="text" class="form-control bg-body-tertiary text-body-emphasis" placeholder="Nhập số điện thoại (9 - 11 số)..." required />
        </div>

        <div class="mb-4">
          <label class="form-label fw-semibold text-body-secondary small">Số CCCD / CMND <span class="text-danger">*</span></label>
          <input v-model="forgotForm.pid" type="text" class="form-control bg-body-tertiary text-body-emphasis" placeholder="Nhập số CCCD/CMND đã đăng ký..." required />
        </div>

        <button type="submit" class="btn btn-primary w-100 fw-bold py-3 rounded-pill shadow-sm mb-3" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          NHẬN MÃ OTP
        </button>

        <div class="text-center">
          <a href="#" @click.prevent="switchMode('LOGIN')" class="text-decoration-none small fw-semibold text-secondary">
            <i class="fas fa-arrow-left me-1"></i> Quay lại đăng nhập
          </a>
        </div>
      </form>

      <!-- ==================== 3. BƯỚC 2: NHẬP MÃ OTP 6 SỐ ==================== -->
      <form v-else-if="mode === 'FORGOT_OTP'" @submit.prevent="handleVerifyOtp">
        <div class="text-center mb-3">
          <span class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
            <i class="fas fa-clock me-1"></i> Thời hạn mã: <strong>{{ formattedCountdown }}</strong>
          </span>
        </div>

        <div class="mb-4">
          <label class="form-label fw-semibold text-body-secondary small d-block text-center">Nhập mã OTP 6 chữ số đã gửi về Email</label>
          <input 
            v-model="otpCode" 
            type="text" 
            maxlength="6" 
            class="form-control form-control-lg bg-body-tertiary text-body-emphasis text-center fw-bold tracking-widest fs-4" 
            placeholder="000000" 
            required 
          />
        </div>

        <button type="submit" class="btn btn-primary w-100 fw-bold py-3 rounded-pill shadow-sm mb-3" :disabled="isLoading || countdown <= 0">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          XÁC THỰC OTP
        </button>

        <div class="d-flex justify-content-between align-items-center small">
          <a href="#" @click.prevent="switchMode('FORGOT_INFO')" class="text-decoration-none text-secondary">
            <i class="fas fa-arrow-left me-1"></i> Nhập lại thông tin
          </a>
          <button type="button" @click="handleResendOtp" class="btn btn-link p-0 text-decoration-none fw-bold text-primary small" :disabled="isLoading">
            Gửi lại mã OTP
          </button>
        </div>
      </form>

      <!-- ==================== 4. BƯỚC 3: ĐẶT MẬT KHẨU MỚI ==================== -->
      <form v-else-if="mode === 'FORGOT_RESET'" @submit.prevent="handleResetPassword">
        <div class="mb-3">
          <label class="form-label fw-semibold text-body-secondary small">Mật khẩu mới <span class="text-danger">*</span></label>
          <input v-model="resetForm.newPassword" type="password" minlength="8" class="form-control form-control-lg bg-body-tertiary text-body-emphasis" placeholder="Tối thiểu 8 ký tự..." required />
        </div>

        <div class="mb-4">
          <label class="form-label fw-semibold text-body-secondary small">Nhập lại mật khẩu mới <span class="text-danger">*</span></label>
          <input v-model="resetForm.confirmPassword" type="password" minlength="8" class="form-control form-control-lg bg-body-tertiary text-body-emphasis" placeholder="Xác nhận mật khẩu mới..." required />
        </div>

        <button type="submit" class="btn btn-success w-100 fw-bold py-3 rounded-pill shadow-sm mb-3" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          ĐỔI MẬT KHẨU
        </button>

        <div class="text-center">
          <a href="#" @click.prevent="switchMode('LOGIN')" class="text-decoration-none small text-secondary">
            Hủy và quay về đăng nhập
          </a>
        </div>
      </form>

      <!-- FOOTER CHUNG -->
      <div v-if="mode === 'LOGIN'" class="text-center mt-4 pt-3 border-top border-secondary-subtle">
        <span class="text-body-secondary small">Chưa có tài khoản? </span>
        <router-link to="/register" class="text-decoration-none fw-bold small text-primary">Đăng ký ngay</router-link>
      </div>
      <div class="text-center mt-3">
        <router-link to="/home" class="text-decoration-none text-body-secondary small transition-all">
          <i class="fas fa-arrow-left me-1"></i> Quay lại trang chủ
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import api from '../../utils/axios'

const router = useRouter()
const authStore = useAuthStore()

// Chế độ hiển thị: 'LOGIN' | 'FORGOT_INFO' | 'FORGOT_OTP' | 'FORGOT_RESET'
const mode = ref('LOGIN')

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const isLoading = ref(false)

// State cho luồng Quên mật khẩu
const forgotForm = ref({
  email: '',
  phoneNumber: '',
  pid: ''
})
const otpCode = ref('')
const resetForm = ref({
  newPassword: '',
  confirmPassword: ''
})

// Đồng hồ đếm ngược 5 phút (300 giây)
const countdown = ref(300)
let timerInterval = null

const formattedCountdown = computed(() => {
  const m = String(Math.floor(countdown.value / 60)).padStart(2, '0')
  const s = String(countdown.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

const startCountdown = (seconds = 300) => {
  stopCountdown()
  countdown.value = seconds
  timerInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      stopCountdown()
      errorMsg.value = 'Mã OTP đã hết hạn (5 phút). Vui lòng bấm Gửi lại mã OTP!'
    }
  }, 1000)
}

const stopCountdown = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

onUnmounted(() => {
  stopCountdown()
})

const switchMode = (targetMode) => {
  errorMsg.value = ''
  successMsg.value = ''
  mode.value = targetMode
  if (targetMode !== 'FORGOT_OTP') {
    stopCountdown()
  }
}

// 1. Xử lý Đăng nhập
const handleLogin = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  isLoading.value = true
  try {
    const response = await api.post('/api/auth/login', {
      email: email.value,
      password: password.value,
      isEmployee: false 
    })
    
    authStore.setAuth(response.data)
    router.push('/home')
  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại!'
  } finally {
    isLoading.value = false
  }
}

// 2. Bước 1: Kiểm tra Email, SĐT, CCCD & Yêu cầu gửi OTP
const handleRequestOtp = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  isLoading.value = true
  try {
    const res = await api.post('/api/auth/forgot-password/request', {
      email: forgotForm.value.email.trim(),
      phoneNumber: forgotForm.value.phoneNumber.trim(),
      pid: forgotForm.value.pid.trim()
    })
    otpCode.value = ''
    mode.value = 'FORGOT_OTP'
    successMsg.value = res.data.message || 'Mã OTP đã được gửi đến email của bạn.'
    startCountdown(300)
  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Thông tin xác minh không chính xác!'
  } finally {
    isLoading.value = false
  }
}

// 3. Bước 2: Xác thực OTP 6 chữ số
const handleVerifyOtp = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  if (!/^\d{6}$/.test(otpCode.value.trim())) {
    errorMsg.value = 'Vui lòng nhập đúng 6 chữ số OTP!'
    return
  }
  isLoading.value = true
  try {
    const res = await api.post('/api/auth/forgot-password/verify-otp', {
      otp: otpCode.value.trim()
    })
    stopCountdown()
    resetForm.value = { newPassword: '', confirmPassword: '' }
    mode.value = 'FORGOT_RESET'
    successMsg.value = res.data.message || 'Xác thực OTP thành công!'
  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Mã OTP không hợp lệ!'
  } finally {
    isLoading.value = false
  }
}

// 4. Gửi lại OTP
const handleResendOtp = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  isLoading.value = true
  try {
    const res = await api.post('/api/auth/forgot-password/resend-otp')
    otpCode.value = ''
    successMsg.value = res.data.message || 'Đã gửi lại mã OTP mới!'
    startCountdown(300)
  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Không thể gửi lại OTP. Vui lòng thử lại!'
  } finally {
    isLoading.value = false
  }
}

// 5. Bước 3: Đặt lại mật khẩu mới
const handleResetPassword = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  if (resetForm.value.newPassword !== resetForm.value.confirmPassword) {
    errorMsg.value = 'Mật khẩu xác nhận không khớp!'
    return
  }
  isLoading.value = true
  try {
    const res = await api.post('/api/auth/forgot-password/reset', {
      newPassword: resetForm.value.newPassword,
      confirmPassword: resetForm.value.confirmPassword
    })
    // Chuyển về form Login, điền sẵn email cho khách và báo thành công
    email.value = forgotForm.value.email.trim()
    password.value = ''
    mode.value = 'LOGIN'
    successMsg.value = res.data.message || 'Đổi mật khẩu thành công! Hãy đăng nhập.'
  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Đổi mật khẩu thất bại!'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.transition-all:hover {
  color: #0d6efd !important;
}
.tracking-widest {
  letter-spacing: 0.5rem;
}
</style>