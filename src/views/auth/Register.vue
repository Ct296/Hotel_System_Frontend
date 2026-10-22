<template>
  <div class="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
    <div class="card shadow-sm p-4" style="width: 100%; max-width: 500px; border-radius: 1rem;">
      <div class="text-center mb-4">
        <h3 class="fw-bold text-primary">Tạo tài khoản</h3>
        <p class="text-muted">Đăng ký thành viên ITHotel</p>
      </div>

      <div v-if="errorMsg" class="alert alert-danger py-2">{{ errorMsg }}</div>
      <div v-if="successMsg" class="alert alert-success py-2">{{ successMsg }}</div>

      <!-- BƯỚC 1: ĐIỀN THÔNG TIN -->
      <form v-if="step === 1" @submit.prevent="handleRegister">
        <div class="row g-2">
          <div class="col-6 mb-3">
            <label class="form-label fw-semibold">Họ</label>
            <input v-model="form.lastName" type="text" class="form-control" required />
          </div>
          <div class="col-6 mb-3">
            <label class="form-label fw-semibold">Tên</label>
            <input v-model="form.firstName" type="text" class="form-control" required />
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Email</label>
          <input v-model="form.email" type="email" class="form-control" required />
        </div>

        <div class="row g-2">
          <div class="col-6 mb-3">
            <label class="form-label fw-semibold">SĐT</label>
            <input v-model="form.phoneNumber" type="text" class="form-control" required />
          </div>
          <div class="col-6 mb-3">
            <label class="form-label fw-semibold">CCCD / Hộ chiếu</label>
            <input v-model="form.pid" type="text" class="form-control" required />
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label fw-semibold">Mật khẩu</label>
          <input v-model="form.password" type="password" class="form-control" minlength="8" required />
        </div>

        <button type="submit" class="btn btn-primary w-100 fw-bold py-2" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          ĐĂNG KÝ
        </button>
      </form>

      <!-- BƯỚC 2: NHẬP MÃ OTP -->
      <form v-if="step === 2" @submit.prevent="handleVerify">
        <div class="alert alert-info py-2 small">
          Mã xác thực 6 số đã được gửi tới email <strong>{{ form.email }}</strong>. Vui lòng kiểm tra hộp thư.
        </div>
        
        <div class="mb-4 text-center">
          <label class="form-label fw-bold">Nhập mã OTP</label>
          <input v-model="otp" type="text" class="form-control form-control-lg text-center fw-bold tracking-widest" maxlength="6" required />
        </div>

        <button type="submit" class="btn btn-success w-100 fw-bold py-2" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          XÁC THỰC
        </button>

        <div class="text-center mt-3">
          <button type="button" class="btn btn-link text-decoration-none small" @click="resendOtp" :disabled="isLoading">
            Gửi lại mã OTP
          </button>
        </div>
      </form>

      <div v-if="step === 1" class="text-center mt-3 border-top pt-3">
        <span class="text-muted">Đã có tài khoản? </span>
        <router-link to="/login" class="text-decoration-none fw-bold">Đăng nhập</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../utils/axios'

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
  password: ''
})

// Gửi thông tin đăng ký
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

// Gửi mã OTP xác nhận
const handleVerify = async () => {
  errorMsg.value = ''
  isLoading.value = true
  
  try {
    await api.post('/api/auth/register/verify', { otp: otp.value })
    alert('Đăng ký thành công! Vui lòng đăng nhập.')
    router.push('/login')
  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Mã OTP không hợp lệ hoặc đã hết hạn.'
  } finally {
    isLoading.value = false
  }
}

// Gửi lại mã OTP
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