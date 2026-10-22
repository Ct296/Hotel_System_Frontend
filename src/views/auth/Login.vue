<template>
  <div class="d-flex align-items-center justify-content-center min-vh-100 bg-light">
    <div class="card shadow-sm p-4" style="width: 100%; max-width: 400px; border-radius: 1rem;">
      <div class="text-center mb-4">
        <h3 class="fw-bold text-primary">ITHotel</h3>
        <p class="text-muted">Đăng nhập dành cho Khách hàng</p>
      </div>

      <div v-if="errorMsg" class="alert alert-danger py-2">{{ errorMsg }}</div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label fw-semibold">Email</label>
          <input v-model="email" type="email" class="form-control" placeholder="Nhập email..." required />
        </div>
        
        <div class="mb-4">
          <label class="form-label fw-semibold">Mật khẩu</label>
          <input v-model="password" type="password" class="form-control" placeholder="Nhập mật khẩu..." required />
        </div>

        <button type="submit" class="btn btn-primary w-100 fw-bold py-2" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          ĐĂNG NHẬP
        </button>
      </form>

      <div class="text-center mt-3">
        <span class="text-muted">Chưa có tài khoản? </span>
        <router-link to="/register" class="text-decoration-none fw-bold">Đăng ký ngay</router-link>
      </div>
      <div class="text-center mt-3">
        <router-link to="/home" class="text-decoration-none text-muted small"><i class="fas fa-arrow-left"></i> Quay lại trang chủ</router-link>
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
      isEmployee: false // Báo cho Backend biết đây là cổng Khách
    })
    
    // Lưu vào Pinia
    authStore.setAuth(response.data)
    
    // Chuyển hướng về trang chủ
    router.push('/home')
  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại!'
  } finally {
    isLoading.value = false
  }
}
</script>