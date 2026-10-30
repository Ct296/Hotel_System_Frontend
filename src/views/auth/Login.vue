<template>
  <div class="d-flex align-items-center justify-content-center min-vh-100 bg-body-tertiary">
    <div class="card shadow-lg p-4 p-md-5 bg-body" style="width: 100%; max-width: 420px; border-radius: 1.2rem; border: none;">
      <div class="text-center mb-4">
        <h3 class="fw-bold text-primary mb-1">ITHotel</h3>
        <p class="text-body-secondary small">Đăng nhập dành cho Khách hàng</p>
      </div>

      <div v-if="errorMsg" class="alert alert-danger py-2 text-center small fw-semibold shadow-sm">{{ errorMsg }}</div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label fw-semibold text-body-secondary small">Email</label>
          <input v-model="email" type="email" class="form-control form-control-lg bg-body-tertiary text-body-emphasis" placeholder="Nhập email..." required />
        </div>
        
        <div class="mb-4">
          <label class="form-label fw-semibold text-body-secondary small">Mật khẩu</label>
          <input v-model="password" type="password" class="form-control form-control-lg bg-body-tertiary text-body-emphasis" placeholder="Nhập mật khẩu..." required />
        </div>

        <button type="submit" class="btn btn-primary w-100 fw-bold py-3 rounded-pill shadow-sm" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          ĐĂNG NHẬP
        </button>
      </form>

      <div class="text-center mt-4 pt-3 border-top border-secondary-subtle">
        <span class="text-body-secondary small">Chưa có tài khoản? </span>
        <router-link to="/register" class="text-decoration-none fw-bold small text-primary">Đăng ký ngay</router-link>
      </div>
      <div class="text-center mt-3">
        <router-link to="/home" class="text-decoration-none text-body-secondary small transition-all"><i class="fas fa-arrow-left me-1"></i> Quay lại trang chủ</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import api from '../../utils/axios'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  errorMsg.value = ''
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
</script>

<style scoped>
.transition-all:hover {
  color: #0d6efd !important;
}
</style>