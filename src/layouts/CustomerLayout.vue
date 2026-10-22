<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- NAVBAR -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
      <div class="container">
        <router-link class="navbar-brand fw-bold" to="/home">
          <i class="fas fa-hotel me-2"></i>ITHotel
        </router-link>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item"><router-link class="nav-link" to="/home">Trang chủ</router-link></li>
            <li class="nav-item"><router-link class="nav-link" to="/rooms">Phòng</router-link></li>
            <li class="nav-item"><router-link class="nav-link" to="/services">Dịch vụ</router-link></li>
            <li class="nav-item"><router-link class="nav-link" to="/about">Giới thiệu</router-link></li>
          </ul>
          
          <ul class="navbar-nav align-items-center">
            <!-- CHƯA ĐĂNG NHẬP -->
            <template v-if="!authStore.isAuthenticated">
              <li class="nav-item"><router-link class="nav-link" to="/login">Đăng nhập</router-link></li>
              <li class="nav-item"><router-link class="btn btn-warning fw-bold ms-lg-2 mt-2 mt-lg-0" to="/register">Đăng ký</router-link></li>
            </template>
            
            <!-- ĐÃ ĐĂNG NHẬP -->
            <template v-else>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle fw-semibold" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                  <i class="fas fa-user-circle fs-5 me-1 align-middle"></i> {{ authStore.user?.fullName || 'Tài khoản' }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                  <li><router-link class="dropdown-item" to="/customer/profile"><i class="fas fa-id-card me-2 text-primary"></i>Hồ sơ cá nhân</router-link></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout"><i class="fas fa-sign-out-alt me-2"></i>Đăng xuất</a></li>
                </ul>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>

    <!-- MAIN CONTENT -->
    <main class="flex-grow-1 bg-light">
      <router-view /> <!-- Component của trang con sẽ chui vào đây -->
    </main>

    <!-- FOOTER -->
    <footer class="bg-dark text-white text-center py-4 mt-auto">
      <div class="container">
        <h5 class="fw-bold text-uppercase mb-3"><i class="fas fa-hotel me-2 text-warning"></i>ITHotel</h5>
        <p class="text-muted small mb-0">&copy; 2026 ITHotel Management System. All rights reserved.</p>
      </div>
    </footer>
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
  } catch (error) {
    console.error('Lỗi khi gọi API logout:', error)
  } finally {
    authStore.clearAuth()
    router.push('/login')
  }
}
</script>

<style scoped>
/* Highlight router-link khi đang ở trang đó */
.router-link-active {
  font-weight: bold;
  color: #fff !important;
}
</style>