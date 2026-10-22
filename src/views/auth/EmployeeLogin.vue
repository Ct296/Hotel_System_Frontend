<template>
  <div class="d-flex align-items-center justify-content-center min-vh-100" style="background: linear-gradient(135deg, #16043e 0%, #2a0d68 100%);">
    <div class="card shadow-lg p-4" style="width: 100%; max-width: 400px; border-radius: 1rem; border: none;">
      <div class="text-center mb-4">
        <div class="bg-primary text-white d-inline-flex justify-content-center align-items-center rounded-circle mb-3" style="width: 60px; height: 60px;">
          <i class="fas fa-user-tie fs-3"></i>
        </div>
        <h3 class="fw-bold text-dark">Cổng Nội Bộ</h3>
        <p class="text-muted small">Dành cho Staff, Manager & Admin</p>
      </div>

      <div v-if="errorMsg" class="alert alert-danger py-2">{{ errorMsg }}</div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label fw-semibold text-secondary">Email làm việc</label>
          <input v-model="email" type="email" class="form-control bg-light" placeholder="admin@ithotel.vn" required />
        </div>
        
        <div class="mb-4">
          <label class="form-label fw-semibold text-secondary">Mật khẩu</label>
          <input v-model="password" type="password" class="form-control bg-light" placeholder="Nhập mật khẩu..." required />
        </div>

        <button type="submit" class="btn btn-dark w-100 fw-bold py-2" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          ĐĂNG NHẬP HỆ THỐNG
        </button>
      </form>
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
      isEmployee: true // Ép kiểm tra quyền nội bộ
    })
    
    authStore.setAuth(response.data)
    const role = response.data.role

    // Điều hướng dựa trên Role
    if (role === 'ADMIN') router.push('/admin/dashboard')
    else if (role === 'MANAGER') router.push('/manager/dashboard')
    else if (role === 'STAFF') router.push('/staff/dashboard')
    else router.push('/') // Phòng hờ lỗi

  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Đăng nhập thất bại!'
  } finally {
    isLoading.value = false
  }
}
</script>