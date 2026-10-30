<template>
  <div class="d-flex min-vh-100 bg-body">
    
    <!-- THANH MENU TRÁI (SIDEBAR) ĐÃ ĐƯỢC KHÓA ĐỨNG YÊN -->
    <div class="sidebar-container bg-dark text-white p-3 shadow-lg">
      <h4 class="text-center mb-4 fw-bold text-uppercase border-bottom border-secondary pb-3 mt-2">IT Hotel</h4>
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

        <!-- MENU CHỈ DÀNH CHO MANAGER: VẬN HÀNH (OPERATION) -->
        <template v-if="authStore.isManager && (authStore.user?.jobTitle === 'OPERATION_MANAGER' || authStore.user?.title === 'OPERATION_MANAGER')">
          <h6 class="text-uppercase text-muted fw-bold mt-4 mb-2 px-3" style="font-size: 0.8rem;">Vận Hành (Operation)</h6>
          <li class="nav-item">
            <router-link to="/employee/manager/dashboard" class="nav-link text-white rounded menu-item">
              <i class="fas fa-chart-line me-2"></i> Tổng Quan
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/employee/manager/room-types" class="nav-link text-white rounded menu-item">
              <i class="fas fa-layer-group me-2"></i> QL Loại phòng
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/employee/manager/rooms" class="nav-link text-white rounded menu-item">
              <i class="fas fa-door-open me-2"></i> QL Phòng Vật Lý
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/employee/manager/amenities" class="nav-link text-white rounded menu-item">
              <i class="fas fa-wifi me-2"></i> QL Tiện ích
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/employee/manager/pricing" class="nav-link text-white rounded menu-item">
              <i class="fas fa-tags me-2"></i> QL Giá & Ưu Đãi
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/employee/manager/services" class="nav-link text-white rounded menu-item">
              <i class="fas fa-concierge-bell me-2"></i> QL Dịch Vụ
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/employee/manager/incidents" class="nav-link text-white rounded menu-item text-warning">
              <i class="fas fa-exclamation-triangle me-2"></i> QL Sự Cố
            </router-link>
          </li>
        </template>

        <!-- MENU CHỈ DÀNH CHO MANAGER: NHÂN SỰ (HR) -->
        <template v-if="authStore.isManager && (authStore.user?.jobTitle === 'HR_MANAGER' || authStore.user?.title === 'HR_MANAGER')">
          <h6 class="text-uppercase text-muted fw-bold mt-4 mb-2 px-3" style="font-size: 0.8rem;">Nhân Sự (HR)</h6>
          
          <li class="nav-item">
            <router-link to="/employee/manager/hr-dashboard" class="nav-link text-white rounded menu-item">
              <i class="fas fa-calendar-check me-2"></i> Lịch & Phân Ca
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/employee/manager/staffs" class="nav-link text-white rounded menu-item">
              <i class="fas fa-users-cog me-2"></i> Hồ sơ Nhân sự
            </router-link>
          </li>
        </template>

        <!-- MENU CHỈ DÀNH CHO MANAGER: KHÁCH HÀNG (CUSTOMER) -->
        <template v-if="authStore.isManager && (authStore.user?.jobTitle === 'CUSTOMER_MANAGER' || authStore.user?.title === 'CUSTOMER_MANAGER')">
          <h6 class="text-uppercase text-muted fw-bold mt-4 mb-2 px-3" style="font-size: 0.8rem;">CRM (Khách Hàng)</h6>
          <li class="nav-item">
            <router-link to="/employee/manager/customer-dashboard" class="nav-link text-white rounded menu-item"><i class="fas fa-chart-pie me-2"></i> Tổng Quan CRM</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/employee/manager/customer-list" class="nav-link text-white rounded menu-item"><i class="fas fa-users-viewfinder me-2"></i> Quản Lý Tệp Khách</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/employee/manager/tier-config" class="nav-link text-white rounded menu-item"><i class="fas fa-gem me-2"></i> Cấu Hình Hạng Thẻ</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/employee/manager/reviews-ai" class="nav-link text-white rounded menu-item"><i class="fas fa-robot me-2"></i> Đánh Giá AI PhoBERT</router-link>
          </li>
        </template>


        <!-- MENU CHÍNH CHO STAFF (LỄ TÂN) -->
        <template v-if="authStore.isStaff">
          <h6 class="text-uppercase text-muted fw-bold mt-4 mb-2 px-3" style="font-size: 0.8rem;">Nghiệp vụ Lễ tân</h6>
          <li class="nav-item">
            <router-link to="/employee/staff/overview" class="nav-link text-white rounded menu-item">
              <i class="fas fa-chart-pie me-2"></i> Tổng quan
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/employee/staff/timeline" class="nav-link text-white rounded menu-item">
              <i class="fas fa-calendar-check me-2"></i> Timeline & Walk-in
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/employee/staff/bookings" class="nav-link text-white rounded menu-item">
              <i class="fas fa-list-check me-2"></i> Booking Online
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/employee/staff/stay" class="nav-link text-white rounded menu-item">
              <i class="fas fa-bed me-2"></i> Khách đang ở
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/employee/staff/history" class="nav-link text-white rounded menu-item">
              <i class="fas fa-clock-rotate-left me-2"></i> Lịch sử
            </router-link>
          </li>
        </template>

        <li class="nav-item mt-4">
          <router-link to="/employee/settings" class="nav-link text-white rounded menu-item">
            <i class="fas fa-cog me-2"></i> Cài đặt
          </router-link>
        </li>
        
        <li class="nav-item mt-5">
          <button @click="handleLogout" class="btn btn-danger w-100 fw-bold shadow-sm">
            <i class="fas fa-sign-out-alt me-2"></i> Đăng xuất
          </button>
        </li>
      </ul>
    </div>

    <!-- NỘI DUNG BÊN PHẢI (CHUYỂN SANG DARK MODE) -->
    <div class="content-area d-flex flex-column bg-body-tertiary">
      
      <!-- HEADER (TOPBAR) -->
      <header class="bg-body border-bottom border-secondary-subtle py-3 px-4 d-flex justify-content-end align-items-center shadow-sm sticky-top z-1">
        <div class="d-flex align-items-center gap-3">
          <span class="fw-semibold text-body-emphasis">Xin chào, {{ authStore.user?.fullName || 'Nhân sự' }}</span>
          
          <div class="rounded-circle d-flex justify-content-center align-items-center shadow-sm border border-2 border-primary bg-primary text-white overflow-hidden" style="width: 40px; height: 40px;">
            <img v-if="authStore.user?.avatar" :src="getImageUrl(authStore.user.avatar)" class="w-100 h-100 object-fit-cover" @error="handleImageError" alt="Avatar">
            <i v-else class="fas fa-user"></i>
          </div>
        </div>
      </header>
      
      <!-- MAIN RENDER VIEW -->
      <main class="p-4 flex-grow-1">
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

const getImageUrl = (path) => {
  if (!path) return ''
  return path.startsWith('http') ? path : `https://api.ct296.id.vn${path}`
}

const handleImageError = (e) => {
  e.target.style.display = 'none' 
}

const handleLogout = async () => {
  try {
    await api.post('/api/auth/logout')
  } catch (e) {} 
  authStore.clearAuth() 
  router.push('/employee/login')
}
</script>

<style scoped>
/* Khóa cuộn trang tổng thể */
.d-flex.min-vh-100 {
  height: 100vh !important;
  overflow: hidden; 
}

/* ÉP THANH MENU TRÁI ĐỨNG YÊN */
.sidebar-container {
  width: 260px; 
  min-width: 260px;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto; 
}

.sidebar-container::-webkit-scrollbar { width: 4px; }
.sidebar-container::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.2); border-radius: 4px; }

/* VÙNG NỘI DUNG PHẢI TỰ CUỘN ĐỘC LẬP */
.content-area {
  flex-grow: 1;
  height: 100vh;
  overflow-y: auto; 
  width: calc(100% - 260px);
}

.content-area::-webkit-scrollbar { width: 8px; }
.content-area::-webkit-scrollbar-thumb { background-color: var(--bs-secondary-bg); border-radius: 4px; }
.content-area::-webkit-scrollbar-thumb:hover { background-color: #adb5bd; }

/* HOVER MENU ITEM */
.menu-item { transition: all 0.2s; opacity: 0.85; }
.menu-item:hover { background-color: rgba(255, 255, 255, 0.1); opacity: 1; }
.menu-item.router-link-active { background-color: #6610f2; color: white !important; opacity: 1; box-shadow: 0 4px 6px rgba(102, 16, 242, 0.3); }

.object-fit-cover { object-fit: cover; }
</style>