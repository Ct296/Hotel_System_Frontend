<template>
  <div class="d-flex align-items-center justify-content-center min-vh-100" style="background: linear-gradient(135deg, #16043e 0%, #2a0d68 100%);">
    <div class="card shadow-lg p-4 bg-body" style="width: 100%; max-width: 400px; border-radius: 1.2rem; border: none;">
      <div class="text-center mb-4">
        <div class="bg-primary text-white d-inline-flex justify-content-center align-items-center rounded-circle mb-3 shadow-sm" style="width: 65px; height: 65px;">
          <i class="fas fa-user-tie fs-3"></i>
        </div>
        <h3 class="fw-bold text-body-emphasis mb-1">Cổng Nội Bộ</h3>
        <p class="text-body-secondary small">Dành cho Staff, Manager & Admin</p>
      </div>

      <div v-if="errorMsg" class="alert alert-danger py-2 fw-semibold text-center small shadow-sm">{{ errorMsg }}</div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label fw-semibold text-body-secondary small">Email làm việc</label>
          <input v-model="email" type="email" class="form-control form-control-lg bg-body-tertiary text-body-emphasis" placeholder="admin@ithotel.vn" required />
        </div>
        
        <div class="mb-4">
          <label class="form-label fw-semibold text-body-secondary small">Mật khẩu</label>
          <input v-model="password" type="password" class="form-control form-control-lg bg-body-tertiary text-body-emphasis" placeholder="Nhập mật khẩu..." required />
        </div>

        <button type="submit" class="btn btn-primary w-100 fw-bold py-3 rounded-pill shadow-sm" :disabled="isLoading">
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
      employee: true 
    })
    
    authStore.setAuth(response.data)
    const role = response.data.role

    if (role === 'ADMIN') {
      router.push('/employee/admin')
    } else if (role === 'MANAGER') {
      const title = response.data.user.title
      if (title === 'HR_MANAGER') {
        router.push('/employee/manager/staffs')
      } else if (title === 'CUSTOMER_MANAGER') {
        router.push('/employee/manager/customer-dashboard')
      } else {
        router.push('/employee/manager/dashboard') 
      }
    } else if (role === 'STAFF') {
      router.push('/employee/staff/overview')
    } else {
      router.push('/')
    }

  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Đăng nhập thất bại!'
  } finally {
    isLoading.value = false
  }
}
</script>