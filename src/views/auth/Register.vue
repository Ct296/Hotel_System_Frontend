<template>
  <div class="d-flex align-items-center justify-content-center min-vh-100 bg-body-tertiary py-5">
    <div class="card shadow-lg p-4 p-md-5 bg-body" style="width: 100%; max-width: 600px; border-radius: 1.2rem; border: none;">
      <div class="text-center mb-4">
        <h3 class="fw-bold text-primary mb-1">Tạo tài khoản</h3>
        <p class="text-body-secondary small">Đăng ký thành viên ITHotel</p>
      </div>

      <div v-if="errorMsg" class="alert alert-danger py-2 text-center small fw-semibold shadow-sm">{{ errorMsg }}</div>
      <div v-if="successMsg" class="alert alert-success py-2 text-center small fw-semibold shadow-sm">{{ successMsg }}</div>

      <!-- BƯỚC 1: ĐIỀN THÔNG TIN -->
      <form v-if="step === 1" @submit.prevent="handleRegister">
        <!-- THÔNG BÁO ĐỒNG BỘ ĐIỂM TÍCH LŨY CHO KHÁCH TỪNG LƯU TRÚ -->
        <div class="alert alert-warning border-warning border-start border-4 py-2 px-3 small mb-4 shadow-sm text-body-emphasis">
          <i class="fas fa-crown text-warning me-2"></i>
          <strong>Lưu ý:</strong> Nếu bạn đã từng nghỉ tại ITHotel, hãy nhập đúng CCCD và SĐT để hệ thống tự động đồng bộ điểm tích lũy.
        </div>

        <div class="row g-3">
          <div class="col-md-6 mb-2">
            <label class="form-label fw-semibold text-body-secondary small">Họ</label>
            <input v-model="form.lastName" type="text" class="form-control bg-body-tertiary text-body-emphasis" required />
          </div>
          <div class="col-md-6 mb-2">
            <label class="form-label fw-semibold text-body-secondary small">Tên</label>
            <input v-model="form.firstName" type="text" class="form-control bg-body-tertiary text-body-emphasis" required />
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold text-body-secondary small">Email</label>
          <input v-model="form.email" type="email" class="form-control bg-body-tertiary text-body-emphasis" required />
        </div>

        <div class="row g-3">
          <div class="col-md-6 mb-2">
            <label class="form-label fw-semibold text-body-secondary small">Số điện thoại</label>
            <input v-model="form.phoneNumber" type="text" class="form-control bg-body-tertiary text-body-emphasis" required />
          </div>
          <div class="col-md-6 mb-2">
            <label class="form-label fw-semibold text-body-secondary small">CCCD / Hộ chiếu</label>
            <input v-model="form.pid" type="text" class="form-control bg-body-tertiary text-body-emphasis" required />
          </div>
          
          <div class="col-md-4 mb-2">
            <label class="form-label fw-semibold text-body-secondary small">Ngày sinh</label>
            <input v-model="form.dateOfBirth" type="date" class="form-control bg-body-tertiary text-body-emphasis" required />
          </div>
          <div class="col-md-4 mb-2">
            <label class="form-label fw-semibold text-body-secondary small">Giới tính</label>
            <select v-model="form.sex" class="form-select bg-body-tertiary text-body-emphasis" required>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="UNSPECIFIED">Khác</option>
            </select>
          </div>
          <div class="col-md-4 mb-2">
            <label class="form-label fw-semibold text-body-secondary small">Quốc tịch</label>
            <input v-model="form.nationality" type="text" class="form-control bg-body-tertiary text-body-emphasis" required placeholder="Việt Nam" />
          </div>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <label class="form-label fw-semibold text-body-secondary small">Mật khẩu</label>
            <input v-model="form.password" type="password" class="form-control bg-body-tertiary text-body-emphasis" minlength="8" required />
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold text-body-secondary small">Xác nhận mật khẩu</label>
            <input v-model="form.confirmPassword" type="password" class="form-control bg-body-tertiary text-body-emphasis" minlength="8" required />
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-100 fw-bold py-3 rounded-pill shadow-sm" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          ĐĂNG KÝ
        </button>
      </form>

      <!-- BƯỚC 2: NHẬP MÃ OTP -->
      <form v-if="step === 2" @submit.prevent="handleVerify">
        <div class="alert alert-info py-3 small text-center mb-4 bg-info-subtle border-0 shadow-sm text-info-emphasis">
          Mã xác thực 6 số đã được gửi tới email <br><strong>{{ form.email }}</strong>.<br> Vui lòng kiểm tra hộp thư.
        </div>
        
        <div class="mb-4 text-center">
          <label class="form-label fw-bold text-body-secondary mb-3">NHẬP MÃ OTP</label>
          <input v-model="otp" type="text" class="form-control form-control-lg text-center fw-bold bg-body-tertiary text-body-emphasis border-primary shadow-sm" style="letter-spacing: 5px; font-size: 1.5rem;" maxlength="6" required />
        </div>

        <button type="submit" class="btn btn-success w-100 fw-bold py-3 rounded-pill shadow-sm" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          XÁC THỰC
        </button>

        <div class="text-center mt-3">
          <button type="button" class="btn btn-link text-decoration-none small text-body-secondary fw-semibold transition-all" @click="resendOtp" :disabled="isLoading">
            Gửi lại mã OTP
          </button>
        </div>
      </form>

      <div v-if="step === 1" class="text-center mt-4 pt-3 border-top border-secondary-subtle">
        <span class="text-body-secondary small">Đã có tài khoản? </span>
        <router-link to="/login" class="text-decoration-none fw-bold small text-primary">Đăng nhập</router-link>
      </div>
      <div class="text-center mt-3">
        <router-link to="/home" class="text-decoration-none text-body-secondary small transition-all"><i class="fas fa-arrow-left me-1"></i> Quay lại trang chủ</router-link>
      </div>
    </div>
  </div>
  <!-- MODAL ĐĂNG KÝ THÀNH CÔNG (Thay cho alert mặc định) -->
    <div v-if="showSuccessModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(2px); z-index: 1080;">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body">
          <div class="modal-header border-0 pb-0 justify-content-center mt-3">
            <div class="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 72px; height: 72px; font-size: 2.2rem;">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
          <div class="modal-body text-center pt-3 pb-4 px-4">
            <h5 class="fw-bold mb-2 text-body-emphasis">Đăng ký thành công!</h5>
            <p class="text-body-secondary small mb-0">{{ successModalMsg }}</p>
          </div>
          <div class="modal-footer border-0 pt-0 pb-4 px-4">
            <button type="button" class="btn btn-success w-100 fw-bold py-2 rounded-pill shadow-sm" @click="goToLogin">
              Đăng nhập ngay <i class="fas fa-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../utils/axios'

const showSuccessModal = ref(false)
const successModalMsg = ref('')

const goToLogin = () => {
  showSuccessModal.value = false
  router.push('/login')
}

const router = useRouter()

const step = ref(1)
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const otp = ref('')

const form = reactive({
  lastName: '',
  firstName: '',
  email: '',
  phoneNumber: '',
  pid: '',
  sex: 'MALE', 
  dateOfBirth: '',
  nationality: 'Việt Nam',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  isLoading.value = true
  
  try {
    const res = await api.post('/api/auth/register', form)
    successMsg.value = res.data.message
    step.value = 2 // Chuyển sang bước nhập OTP
  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Lỗi đăng ký. Vui lòng kiểm tra lại!'
  } finally {
    isLoading.value = false
  }
}

const handleVerify = async () => {
  errorMsg.value = ''
  isLoading.value = true
  
  try {
    await api.post('/api/auth/register/verify', { otp: otp.value })
    successModalMsg.value = response.data?.message || 'Đăng ký thành công! Vui lòng đăng nhập.'
    showSuccessModal.value = true
  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Mã OTP không hợp lệ hoặc đã hết hạn.'
  } finally {
    isLoading.value = false
  }
}

const resendOtp = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  isLoading.value = true
  
  try {
    const res = await api.post('/api/auth/register/resend-otp')
    successMsg.value = res.data.message
  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Lỗi gửi lại mã OTP.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.transition-all {
  transition: all 0.2s ease-in-out;
}
.transition-all:hover {
  color: #0d6efd !important;
}
</style>