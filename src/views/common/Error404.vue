<template>
  <div class="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light text-center">
    <h1 class="display-1 fw-bold text-primary">404</h1>
    <h3 class="mb-4">Ôi không! Không tìm thấy trang.</h3>
    <p class="text-muted mb-4">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
    <button @click="goHome" class="btn btn-primary px-4 py-2 fw-bold">
      <i class="fas fa-home me-2"></i> Trở về Trang chủ
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const goHome = () => {
  if (authStore.isEmployee) {
    router.push('/employee/login') // Hoặc đẩy về dashboard tuỳ bạn
  } else {
    router.push('/home')
  }
}
</script>