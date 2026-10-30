<template>
  <div class="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-body text-center px-3">
    <!-- Icon minh họa lỗi -->
    <div class="mb-4">
      <div class="bg-danger-subtle text-danger d-inline-flex justify-content-center align-items-center rounded-circle shadow-sm" style="width: 80px; height: 80px;">
        <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem;"></i>
      </div>
    </div>
    
    <!-- Nội dung lỗi động -->
    <h1 class="display-1 fw-bold text-primary mb-2" style="letter-spacing: 2px;">{{ errorCode }}</h1>
    <h3 class="mb-3 text-body-emphasis fw-bold">{{ errorTitle }}</h3>
    <p class="text-body-secondary mb-4" style="max-width: 500px; line-height: 1.6;">
      {{ errorMessage }}
    </p>
    
    <!-- Nút điều hướng -->
    <button @click="goHome" class="btn btn-primary px-4 py-3 fw-bold rounded-pill shadow-sm transition-all">
      <i class="fas fa-home me-2"></i> Trở về Trang chủ
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Lấy thông số lỗi từ URL (nếu có), mặc định là 404
const errorCode = computed(() => route.query.code || '404')
const errorTitle = computed(() => route.query.title || 'Ôi không! Không tìm thấy trang.')
const errorMessage = computed(() => route.query.message || 'Trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc bạn không có quyền truy cập.')

const goHome = () => {
  if (authStore.isEmployee) {
    // Điều hướng dựa theo vai trò của Employee
    if (authStore.isAdmin) {
      router.push('/employee/admin')
    } else if (authStore.isManager) {
      router.push('/employee/manager/dashboard')
    } else {
      router.push('/employee/staff/overview')
    }
  } else {
    // Khách hàng hoặc người chưa đăng nhập
    router.push('/home')
  }
}
</script>

<style scoped>
.transition-all {
  transition: all 0.3s ease;
}
.transition-all:hover {
  transform: translateY(-2px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
}
</style>