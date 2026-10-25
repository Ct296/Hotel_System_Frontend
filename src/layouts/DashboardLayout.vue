<template>
  <div class="d-flex" style="min-height: 100vh; background-color: #f8f9fa;">
    <!-- Sidebar -->
    <div class="bg-dark text-white p-3" style="width: 250px;">
      <h4 class="text-center mb-4 fw-bold text-uppercase border-bottom pb-3 mt-2">IT Hotel</h4>
      <ul class="nav flex-column gap-2">
        
        <!-- MENU CHỈ DÀNH CHO ADMIN -->
        <template v-if="authStore.isAdmin">
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
        </template>

        <!-- MENU CHỈ DÀNH CHO MANAGER -->
        <template v-if="authStore.isManager">
          <h6 class="text-uppercase text-muted fw-bold mt-4 mb-2 px-3" style="font-size: 0.8rem;">Vận Hành (Operation)</h6>
          <!-- Nút bấm sang trang Loại Phòng -->
          <li class="nav-item">
            <router-link to="/employee/manager/room-types" class="nav-link text-white rounded menu-item">
              <i class="fas fa-layer-group me-2"></i> QL Loại phòng
            </router-link>
          </li>
          <!-- Nút bấm sang trang Phòng -->
          <li class="nav-item">
            <router-link to="/employee/manager/rooms" class="nav-link text-white rounded menu-item">
              <i class="fas fa-door-open me-2"></i> QL Phòng Vật Lý
            </router-link>
          </li>
          <!-- Nút bấm sang trang Tiện ích -->
          <li class="nav-item">
            <router-link to="/employee/manager/amenities" class="nav-link text-white rounded menu-item">
              <i class="fas fa-wifi me-2"></i> QL Tiện ích
            </router-link>
          </li>
          <!-- Nút bấm sang trang Thiết lập giá -->
          <li class="nav-item">
            <router-link to="/employee/manager/pricing" class="nav-link text-white rounded menu-item">
              <i class="fas fa-tags me-2"></i> QL Giá & Ưu Đãi
            </router-link>
          </li>

        </template>

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
          <span class="fw-semibold text-secondary">Xin chào, {{ authStore.user?.fullName || 'Nhân sự' }}</span>
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
  
  // Xóa trắng thông tin đăng nhập
  authStore.clearAuth() 
  router.push('/employee/login')
}
</script>

<style scoped>
.menu-item { transition: 0.2s; }
.menu-item:hover, .router-link-exact-active { background-color: rgba(255,255,255,0.15); font-weight: bold; }
</style>