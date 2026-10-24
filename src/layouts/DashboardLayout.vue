<template>
  <div class="d-flex" style="min-height: 100vh; background-color: #f8f9fa;">
    <!-- Sidebar -->
    <div class="bg-dark text-white p-3" style="width: 250px;">
      <h4 class="text-center mb-4 fw-bold text-uppercase border-bottom pb-3 mt-2">IT Hotel</h4>
      <ul class="nav flex-column gap-2">
        <li class="nav-item">
          <router-link to="/employee/admin" class="nav-link text-white rounded menu-item">
            <i class="fas fa-chart-pie me-2"></i> Tổng quan
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/employee/accounts" class="nav-link text-white rounded menu-item">
            <i class="fas fa-users me-2"></i> Quản lý Tài khoản
          </router-link>
        </li>
        <li class="nav-item mt-5">
          <button @click="handleLogout" class="btn btn-danger w-100 fw-bold shadow-sm">
            <i class="fas fa-sign-out-alt me-2"></i> Đăng xuất
          </button>
        </li>
      </ul>
    </div>

    <!-- Main Content -->
    <div class="flex-grow-1 d-flex flex-column">
      <header class="bg-white shadow-sm py-3 px-4 d-flex justify-content-end align-items-center">
        <div class="d-flex align-items-center gap-3">
          <span class="fw-semibold text-secondary">Xin chào, {{ authStore.user?.fullName || 'Admin' }}</span>
          <div class="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center shadow-sm" style="width: 40px; height: 40px;">
            <i class="fas fa-user"></i>
          </div>
        </div>
      </header>
      
      <main class="p-4">
        <!-- Nơi các trang con (AdminDashboard, Manager, v.v.) hiển thị -->
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'
import api from '../utils/axios'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  try {
    await api.post('/api/auth/logout')
  } catch (e) {} // Bỏ qua lỗi mạng nếu có
  authStore.logout()
  router.push('/employee/login')
}
</script>

<style scoped>
.menu-item { transition: 0.2s; }
.menu-item:hover, .router-link-exact-active { background-color: rgba(255,255,255,0.15); font-weight: bold; }
</style>