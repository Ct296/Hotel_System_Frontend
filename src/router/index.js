import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

// Khai báo các route (Component sẽ được Lazy Load để tối ưu hiệu suất)
const routes = [
  // ==========================================
  // 1. PUBLIC ROUTES (Ai cũng vào được)
  // ==========================================
  { path: '/', redirect: '/home' },
  { path: '/home', name: 'Home', component: () => import('../views/public/Home.vue') },
  { path: '/rooms', name: 'Rooms', component: () => import('../views/public/Rooms.vue') },
  { path: '/services', name: 'Services', component: () => import('../views/public/Services.vue') },
  { path: '/about', name: 'About', component: () => import('../views/public/About.vue') },
  { path: '/guide', name: 'Guide', component: () => import('../views/public/Guide.vue') },
  
  // Auth Routes
  { path: '/login', name: 'Login', component: () => import('../views/auth/Login.vue'), meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: () => import('../views/auth/Register.vue'), meta: { guestOnly: true } },
  { path: '/employee/login', name: 'EmployeeLogin', component: () => import('../views/auth/EmployeeLogin.vue'), meta: { guestOnly: true, isEmployeeRoute: true } },

  // ==========================================
  // 2. CUSTOMER ROUTES (Chỉ Khách hàng đăng nhập)
  // ==========================================
  { 
    path: '/customer/profile', 
    name: 'CustomerProfile', 
    component: () => import('../views/customer/CustomerProfile.vue'),
    meta: { requiresAuth: true, role: 'CUSTOMER' }
  },
  { 
    path: '/customer/booking', 
    name: 'Booking', 
    component: () => import('../views/customer/Booking.vue'),
    meta: { requiresAuth: true, role: 'CUSTOMER' }
  },
  { 
    path: '/customer/booking/payment', 
    name: 'BookingPayment', 
    component: () => import('../views/customer/BookingPayment.vue'),
    meta: { requiresAuth: true, role: 'CUSTOMER' }
  },

  // ==========================================
  // 3. EMPLOYEE ROUTES (Nội bộ)
  // ==========================================
  // Lễ tân
  { 
    path: '/staff/dashboard', 
    name: 'StaffDashboard', 
    component: () => import('../views/staff/StaffDashboard.vue'),
    meta: { requiresAuth: true, isEmployeeRoute: true, roles: ['STAFF', 'MANAGER', 'ADMIN'] }
  },
  
  // Quản lý
  { 
    path: '/manager/dashboard', 
    name: 'ManagerDashboard', 
    component: () => import('../views/manager/ManagerDashboard.vue'), // Trang gốc điều hướng
    meta: { requiresAuth: true, isEmployeeRoute: true, roles: ['MANAGER', 'ADMIN'] }
  },
  { 
    path: '/manager/hr', 
    name: 'HrManager', 
    component: () => import('../views/manager/HrManager.vue'),
    meta: { requiresAuth: true, isEmployeeRoute: true, roles: ['MANAGER', 'ADMIN'] }
  },
  { 
    path: '/manager/operation', 
    name: 'OperationManager', 
    component: () => import('../views/manager/OperationManager.vue'),
    meta: { requiresAuth: true, isEmployeeRoute: true, roles: ['MANAGER', 'ADMIN'] }
  },
  { 
    path: '/manager/customer', 
    name: 'CustomerManager', 
    component: () => import('../views/manager/CustomerManager.vue'),
    meta: { requiresAuth: true, isEmployeeRoute: true, roles: ['MANAGER', 'ADMIN'] }
  },
  { 
    path: '/manager/report', 
    name: 'ReportDashboard', 
    component: () => import('../views/manager/ReportDashboard.vue'),
    meta: { requiresAuth: true, isEmployeeRoute: true, roles: ['MANAGER', 'ADMIN'] }
  },

  // Admin
  { 
    path: '/admin/dashboard', 
    name: 'AdminDashboard', 
    component: () => import('../views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, isEmployeeRoute: true, roles: ['ADMIN'] }
  },

  // Profile dùng chung cho nội bộ
  { 
    path: '/employee/profile', 
    name: 'EmployeeProfile', 
    component: () => import('../views/common/OtherProfile.vue'),
    meta: { requiresAuth: true, isEmployeeRoute: true, roles: ['STAFF', 'MANAGER', 'ADMIN'] }
  },

  // ==========================================
  // 4. BẮT LỖI 404
  // ==========================================
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/common/Error404.vue') }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Cuộn lên đầu trang mỗi khi chuyển route
  scrollBehavior() {
    return { top: 0 }
  }
})

// ==========================================
// NAVIGATION GUARDS (Kẻ gác cổng)
// ==========================================
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.role

  // 1. Chặn user đã đăng nhập nhưng cố tình vào lại trang Login / Register
  if (to.meta.guestOnly && isAuthenticated) {
    if (authStore.isEmployee) return next('/staff/dashboard') // Có thể làm hàm resolveDashboard linh hoạt hơn
    return next('/home')
  }

  // 2. Chặn các trang yêu cầu đăng nhập
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      // Đá về đúng cổng đăng nhập
      return to.meta.isEmployeeRoute ? next('/employee/login') : next('/login')
    }

    // 3. Kiểm tra phân quyền Role cụ thể
    if (to.meta.roles && !to.meta.roles.includes(userRole)) {
      return next('/home') // Không đủ quyền thì đá về trang chủ (hoặc trang 403)
    }

    if (to.meta.role && to.meta.role !== userRole) {
      return next('/home')
    }
  }

  // Hợp lệ -> Cho đi tiếp
  next()
})

export default router