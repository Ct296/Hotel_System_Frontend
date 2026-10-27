<template>
  <!-- Đã thêm class min-vh-100 vào đây -->
  <div class="d-flex min-vh-100" style="background-color: #f8f9fa;">
    
    <!-- Đã thêm class sidebar-container và bỏ width cứng -->
    <div class="sidebar-container bg-dark text-white p-3">
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

        <li class="nav-item mt-5">
          <button @click="handleLogout" class="btn btn-danger w-100 fw-bold shadow-sm">
            <i class="fas fa-sign-out-alt me-2"></i> Đăng xuất
          </button>
        </li>
      </ul>
    </div>

    <!-- Đã thêm class content-area vào thẻ Main Content -->
    <div class="content-area d-flex flex-column">
      <header class="bg-white shadow-sm py-3 px-4 d-flex justify-content-end align-items-center">
        <div class="d-flex align-items-center gap-3">
          <span class="fw-semibold text-secondary">Xin chào, {{ authStore.user?.fullName || 'Nhân sự' }}</span>
          <div class="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center shadow-sm" style="width: 40px; height: 40px;">
            <i class="fas fa-user"></i>
          </div>
        </div>
      </header>
      
      <main class="p-4">
        <!-- Nơi các trang con hiển thị -->
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
/* Reset cấu trúc cho trang Dashboard */
.d-flex.min-vh-100 {
  height: 100vh !important;
  overflow: hidden; /* Cắt đứt thanh cuộn mặc định của toàn trang */
}

/* Ép thanh Menu bên trái (Sidebar) đứng im và giữ nguyên độ rộng */
.sidebar-container {
  width: 250px; 
  min-width: 250px;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto; /* Chỉ menu cuộn nếu nội dung menu quá dài */
  background-color: #212529;
}

/* Làm đẹp thanh cuộn cho Menu */
.sidebar-container::-webkit-scrollbar {
  width: 4px;
}
.sidebar-container::-webkit-scrollbar-thumb {
  background-color: rgba(255,255,255,0.2);
  border-radius: 4px;
}

/* Phần nội dung bên phải (Content Area) sẽ cuộn độc lập */
.content-area {
  flex-grow: 1;
  height: 100vh;
  overflow-y: auto; /* Trả thanh cuộn lại cho riêng nội dung bên phải */
  width: calc(100% - 250px);
}

/* (Tùy chọn) Làm đẹp thanh cuộn cho phần nội dung */
.content-area::-webkit-scrollbar {
  width: 6px;
}
.content-area::-webkit-scrollbar-thumb {
  background-color: #dee2e6;
  border-radius: 4px;
}
.content-area::-webkit-scrollbar-thumb:hover {
  background-color: #adb5bd;
}

.menu-item {
  transition: all 0.2s;
}
.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.menu-item.router-link-active {
  background-color: #0d6efd;
  color: white !important;
}
</style>