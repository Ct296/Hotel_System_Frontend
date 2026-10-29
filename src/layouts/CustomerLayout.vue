<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- NAVBAR (HEADER) -->
    <nav class="navbar navbar-expand-lg navbar-dark sticky-top py-3 shadow-sm" style="background-color: #1e1b4b;">
      <div class="container">
        <!-- Logo -->
        <router-link class="navbar-brand fw-bold d-flex align-items-center" to="/home">
          <div class="bg-primary text-white rounded d-flex align-items-center justify-content-center me-2 shadow-sm" style="width: 35px; height: 35px;">
            <i class="fas fa-hotel"></i>
          </div>
          <span style="letter-spacing: 1px;">ITHotel</span>
        </router-link>
        
        <!-- Toggle Button for Mobile -->
        <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <!-- Navigation Links -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav mx-auto fw-semibold gap-1">
            <li class="nav-item"><router-link class="nav-link px-3 rounded-pill" to="/home">Trang chủ</router-link></li>
            <li class="nav-item"><router-link class="nav-link px-3 rounded-pill" to="/rooms">Phòng nghỉ</router-link></li>
            <li class="nav-item"><router-link class="nav-link px-3 rounded-pill" to="/services">Dịch vụ</router-link></li>
            <li class="nav-item"><router-link class="nav-link px-3 rounded-pill" to="/guide">Hướng dẫn</router-link></li>
            <li class="nav-item"><router-link class="nav-link px-3 rounded-pill" to="/about">Về chúng tôi</router-link></li>
          </ul>
          
          <!-- Auth Section -->
          <div class="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            <!-- CHƯA ĐĂNG NHẬP -->
            <template v-if="!authStore.isAuthenticated">
              <router-link to="/login" class="btn btn-outline-light rounded-pill px-4 fw-bold">Đăng nhập</router-link>
              <router-link to="/register" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">Đăng ký</router-link>
            </template>
            
            <!-- ĐÃ ĐĂNG NHẬP -->
            <template v-else>
              <div class="dropdown">
                <a class="btn btn-outline-light dropdown-toggle d-flex align-items-center rounded-pill px-2 py-1" href="#" role="button" data-bs-toggle="dropdown" style="gap: 8px;">
                  <span class="d-flex align-items-center justify-content-center rounded-circle overflow-hidden bg-white text-primary" style="width: 32px; height: 32px;">
                    <img v-if="authStore.user?.avatar" :src="getImageUrl(authStore.user.avatar)" alt="Avatar" class="w-100 h-100 object-fit-cover" @error="handleImageError">
                    <i v-else class="fas fa-user"></i>
                  </span>
                  <span class="fw-bold text-truncate" style="max-width: 120px;">
                    {{ authStore.user?.fullName || 'Tài khoản' }}
                  </span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 rounded-4">
                  <li><router-link class="dropdown-item py-2 fw-semibold" to="/customer/profile"><i class="fas fa-id-card me-2 text-primary"></i>Hồ sơ cá nhân</router-link></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item py-2 fw-bold text-danger" href="#" @click.prevent="handleLogout"><i class="fas fa-sign-out-alt me-2"></i>Đăng xuất</a></li>
                </ul>
              </div>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- MAIN CONTENT -->
    <main class="flex-grow-1 bg-light">
      <router-view /> 
    </main>

    <!-- FOOTER -->
    <footer class="text-white pt-5 pb-3 mt-auto border-top" style="background-color: #212529;">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4 col-md-6 text-center text-md-start">
            <h4 class="text-white fw-bold mb-3"><span class="text-primary">IT</span>Hotel</h4>
            <p class="text-secondary small">Hệ thống đặt phòng khách sạn đẳng cấp 5 sao.</p>
            <div class="mt-3">
              <a href="https://www.facebook.com/" target="_blank" class="btn btn-outline-primary btn-sm rounded-circle me-2 shadow-sm"><i class="fab fa-facebook-f"></i></a>
              <a href="#" class="btn btn-outline-primary btn-sm rounded-circle me-2 shadow-sm"><i class="fab fa-tiktok"></i></a>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 text-center text-md-start">
            <h5 class="fw-bold mb-3 text-info">Liên kết</h5>
            <ul class="list-unstyled small">
              <li class="mb-2"><router-link to="/home" class="text-decoration-none text-secondary custom-hover">Trang chủ</router-link></li>
              <li class="mb-2"><router-link to="/rooms" class="text-decoration-none text-secondary custom-hover">Phòng nghỉ</router-link></li>
              <li class="mb-2"><router-link to="/services" class="text-decoration-none text-secondary custom-hover">Dịch vụ</router-link></li>
              <li class="mb-2"><router-link to="/guide" class="text-decoration-none text-secondary custom-hover">Hướng dẫn sử dụng</router-link></li>
              <li class="mb-2"><router-link to="/about" class="text-decoration-none text-secondary custom-hover">Về chúng tôi</router-link></li>
              <li class="mb-2"><router-link to="/policy" class="text-decoration-none text-secondary custom-hover">Chính sách & Điều khoản</router-link></li>
            </ul>
          </div>

          <div class="col-lg-4 col-md-12 text-center text-md-start">
            <h5 class="fw-bold mb-3 text-info">Liên hệ</h5>
            <p class="small text-secondary mb-2"><i class="fas fa-map-marker-alt me-2 text-primary"></i> 3/2 Street, Can Tho</p>
            <p class="small text-secondary mb-2"><i class="fas fa-phone me-2 text-primary"></i> (+84) 0909 999 999</p>
            <p class="small text-secondary mb-2"><i class="fas fa-envelope me-2 text-primary"></i> support@ithotel.vn</p>
          </div>
        </div>

        <hr class="border-secondary my-4">
        <div class="text-center small text-secondary">&copy; 2026 ITHotel. Designed by IT Group</div>
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

// Cấu hình URL lấy ảnh Avatar từ Backend
const backendBaseUrl = 'https://api.ct296.id.vn'
const defaultAvatar = `${backendBaseUrl}/image/default_avatar_customer.jpg`

const getImageUrl = (path) => {
  if (!path) return defaultAvatar
  return path.startsWith('http') ? path : `${backendBaseUrl}${path}`
}

const handleImageError = (e) => {
  e.target.src = defaultAvatar
}

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
/* Hiệu ứng khi hover link trong Navbar */
.navbar-nav .nav-link {
  transition: all 0.2s ease-in-out;
}
.navbar-nav .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff !important;
}

/* Highlight menu đang được chọn (Active) */
.router-link-active {
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff !important;
}

/* Hiệu ứng hover link Footer */
.custom-hover:hover {
  color: #0d6efd !important;
  text-decoration: underline !important;
}

.object-fit-cover {
  object-fit: cover;
}
</style>