<template>
  <div class="d-flex min-vh-100 bg-light">
    <!-- SIDEBAR -->
    <aside class="bg-dark text-white p-3 d-flex flex-column" style="width: 260px;">
      <div class="text-center mb-4 mt-2 border-bottom border-secondary pb-3">
        <h4 class="fw-bold text-uppercase mb-1"><i class="fas fa-building text-warning me-2"></i>ITHotel</h4>
        <small class="text-muted">{{ roleDisplayName }}</small>
      </div>

      <nav class="nav flex-column gap-2 flex-grow-1">
        <!-- Menu Lễ Tân -->
        <router-link v-if="authStore.isStaff || authStore.isManager || authStore.isAdmin" class="nav-link text-white rounded menu-item" to="/staff/dashboard">
          <i class="fas fa-concierge-bell me-2"></i> Lễ tân & Đặt phòng
        </router-link>

        <!-- Menu Quản Lý -->
        <router-link v-if="authStore.isManager || authStore.isAdmin" class="nav-link text-white rounded menu-item" to="/manager/dashboard">
          <i class="fas fa-chart-pie me-2"></i> Tổng quan Quản lý
        </router-link>
        <router-link v-if="authStore.isManager || authStore.isAdmin" class="nav-link text-white rounded menu-item" to="/manager/hr">
          <i class="fas fa-users-cog me-2"></i> Quản lý Nhân sự
        </router-link>
        <router-link v-if="authStore.isManager || authStore.isAdmin" class="nav-link text-white rounded menu-item" to="/manager/operation">
          <i class="fas fa-cogs me-2"></i> Vận hành & Dịch vụ
        </router-link>
        <router-link v-if="authStore.isManager || authStore.isAdmin" class="nav-link text-white rounded menu-item" to="/manager/customer">
          <i class="fas fa-users me-2"></i> Khách hàng & AI
        </router-link>
        <router-link v-if="authStore.isManager || authStore.isAdmin" class="nav-link text-white rounded menu-item" to="/manager/report">
          <i class="fas fa-chart-line me-2"></i> Báo cáo Doanh thu
        </router-link>

        <!-- Menu Admin -->
        <router-link v-if="authStore.isAdmin" class="nav-link text-white rounded menu-item" to="/admin/dashboard">
          <i class="fas fa-user-shield me-2"></i> Quản trị Hệ thống
        </router-link>
      </nav>

      <div class="mt-auto pt-3 border-top border-secondary">
        <router-link class="nav-link text-white rounded menu-item mb-2" to="/employee/profile">
          <i class="fas fa-id-badge me-2"></i> Hồ sơ cá nhân
        </router-link>
        <a href="#" class="nav-link text-danger rounded menu-item fw-bold" @click.prevent="handleLogout">
          <i class="fas fa-sign-out-alt me-2"></i> Đăng xuất
        </a>
      </div>
    </aside>

    <!-- MAIN CONTENT AREA -->
    <main class="flex-grow-1 d-flex flex-column">
      <!-- TOPBAR -->
      <header class="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold text-secondary">{{ routeName }}</h5>
        <div class="d-flex align-items-center gap-3">
          <div class="text-end">
            <div class="fw-bold">{{ authStore.user?.fullName }}</div>
            <small class="text-muted">{{ authStore.user?.email }}</small>
          </div>
          <div class="bg-secondary text-white rounded-circle d-flex justify-content-center align-items-center" style="width: 40px; height: 40px;">
            <i class="fas fa-user"></i>
          </div>
        </div>
      </header>

      <!-- PAGE CONTENT -->
      <div class="p-4 flex-grow-1" style="overflow-y: auto; height: calc(100vh - 72px);">
        <router-view /> <!-- Component nội bộ chui vào đây -->
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useRouter, useRoute } from 'vue-router'
import api from '../utils/axios'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const roleDisplayName = computed(() => {
  if (authStore.isAdmin) return 'Administrator'
  if (authStore.isManager) return 'Manager'
  if (authStore.isStaff) return 'Staff (Lễ tân)'
  return 'Employee'
})

const routeName = computed(() => route.name || 'Dashboard')

const handleLogout = async () => {
  try {
    await api.post('/api/auth/logout')
  } catch (error) {
    console.error(error)
  } finally {
    authStore.clearAuth()
    router.push('/employee/login')
  }
}
</script>

<style scoped>
.menu-item {
  transition: all 0.2s;
  opacity: 0.8;
}
.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  opacity: 1;
}
.router-link-active.menu-item {
  background-color: #0d6efd;
  opacity: 1;
  font-weight: bold;
}
</style>