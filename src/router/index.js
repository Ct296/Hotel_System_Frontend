import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { h } from 'vue'
import CustomerLayout from '../layouts/CustomerLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

const DummyComponent = { render: () => h('div', { class: 'p-5 text-center' }, h('h2', 'Trang này đang xây dựng...')) }

const routes = [
  // --- AUTH ROUTES ---
  { path: '/login', name: 'Login', component: () => import('../views/auth/Login.vue'), meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: () => import('../views/auth/Register.vue'), meta: { guestOnly: true } },
  { path: '/employee/login', name: 'EmployeeLogin', component: () => import('../views/auth/EmployeeLogin.vue'), meta: { guestOnly: true, isEmployeeRoute: true } },

  // --- KIOSK CHẤM CÔNG ---
  {  path: '/kiosk', name: 'TimeclockKiosk', component: () => import('../views/kiosk/Timeclock.vue')},

  // --- CUSTOMER ROUTES (Public & Private) ---
  {
    path: '/',
    component: CustomerLayout,
    children: [
      { path: '', redirect: '/home' },
      
      // 1. CÁC TRANG PUBLIC (Không cần đăng nhập)
      { path: 'home', name: 'Home', component: () => import('../views/public/Home.vue') },
      { path: 'rooms', name: 'Rooms', component: () => import('../views/public/Rooms.vue') },
      { path: 'services', name: 'Services', component: () => import('../views/public/Services.vue') },
      { path: 'about', name: 'About', component: () => import('../views/public/About.vue') },
      { path: 'guide', name: 'Guide', component: () => import('../views/public/Guide.vue') },
      { path: 'reviews', name: 'Reviews', component: () => import('../views/public/Reviews.vue') },
      { path: 'policy', name: 'Policy', component: () => import('../views/public/Policy.vue') },
      
      // 2. CÁC TRANG PRIVATE (Yêu cầu đăng nhập tài khoản Khách Hàng)
      { 
        path: 'customer/profile', name: 'CustomerProfile', 
        component: () => import('../views/customer/CustomerProfile.vue'),
        meta: { requiresAuth: true, roles: ['CUSTOMER'] } 
      },
      { 
        path: 'customer/booking', name: 'CustomerBooking', 
        component: () => import('../views/customer/Booking.vue'),
        meta: { requiresAuth: true, roles: ['CUSTOMER'] } 
      },
      { 
        path: 'customer/booking/payment', name: 'BookingPayment', 
        component: () => import('../views/customer/BookingPayment.vue'),
        meta: { requiresAuth: true, roles: ['CUSTOMER'] } 
      },
      { 
        path: 'customer/settings', name: 'CustomerSettings', 
        component: () => import('../views/customer/CustomerSettings.vue'),
        meta: { requiresAuth: true, roles: ['CUSTOMER'] } 
      }
    ]
  },

  // --- INTERNAL (DASHBOARD) ROUTES ---
  {
    path: '/employee',
    component: DashboardLayout,
    meta: { requiresAuth: true, isEmployeeRoute: true },
    children: [
      { 
        path: 'settings', name: 'EmployeeSettings',
        component: () => import('../views/common/EmployeeSettings.vue'),
        meta: { roles: ['ADMIN', 'MANAGER', 'STAFF'] }
      },

      // Admin
      { path: '', redirect: '/employee/admin' },
      { path: 'admin', name: 'AdminDashboard', 
        component: () => import('../views/admin/AdminDashboard.vue'), 
        meta: { roles: ['ADMIN'] } 
      },
      { path: 'accounts', name: 'AccountManagement', 
        component: () => import('../views/admin/AccountManagement.vue'), 
        meta: { roles: ['ADMIN'] } 
      },
      
      // OP (Operation Manager)
      { 
        path: 'manager/dashboard', name: 'OperationDashboard', 
        component: () => import('../views/manager/operation/OperationDashboard.vue'), 
        meta: { roles: ['MANAGER'] } 
      },
      { 
        path: 'manager/room-types', name: 'RoomTypeManagement', 
        component: () => import('../views/manager/operation/RoomTypeManagement.vue'), 
        meta: { roles: ['MANAGER'] } 
      },
      { 
        path: 'manager/amenities', name: 'AmenityManagement', 
        component: () => import('../views/manager/operation/AmenityManagement.vue'), 
        meta: { roles: ['MANAGER'] } 
      },
      { 
        path: 'manager/rooms', name: 'RoomManagement', 
        component: () => import('../views/manager/operation/RoomManagement.vue'), 
        meta: { roles: ['MANAGER'] } 
      },
      { 
        path: 'manager/pricing', name: 'PricingManagement', 
        component: () => import('../views/manager/operation/PricingManagement.vue'), 
        meta: { roles: ['MANAGER'] } 
      },
      { 
        path: 'manager/services', name: 'ServiceManagement', 
        component: () => import('../views/manager/operation/ServiceManagement.vue'), 
        meta: { roles: ['MANAGER'] } 
      },
      {
        path: 'manager/incidents',  name: 'IncidentManagement',
        component: () => import('../views/manager/operation/IncidentManagement.vue'),
        meta: { roles: ['MANAGER'] }
      },
      
      // HR (HR Manager)
      {
          path: 'manager/hr-dashboard', name: 'HrDashboard',
          component: () => import('../views/manager/hr/HrDashboard.vue'),
          meta: { roles: ['MANAGER'] }
      },
      {
        path: 'manager/staffs', name: 'StaffManagement',
        component: () => import('../views/manager/hr/StaffManagement.vue'),
        meta: { roles: ['MANAGER'] }
      },

      // Cus Manager (Customer Manager)
      { path: 'manager/customer-dashboard', name: 'CustomerDashboard', 
        component: () => import('../views/manager/customer/CustomerDashboard.vue'), 
        meta: { roles: ['MANAGER'] } 
      },
      { path: 'manager/customer-list', name: 'CustomerManagement', 
        component: () => import('../views/manager/customer/CustomerManagement.vue'), 
        meta: { roles: ['MANAGER'] } 
      },
      { path: 'manager/tier-config', name: 'TierManagement', 
        component: () => import('../views/manager/customer/TierManagement.vue'), 
        meta: { roles: ['MANAGER'] } 
      },
      { path: 'manager/reviews-ai', name: 'ReviewAiManagement', 
        component: () => import('../views/manager/customer/ReviewAiManagement.vue'), 
        meta: { roles: ['MANAGER'] } 
      },

      // Staff (Lễ tân)
      { path: 'staff', redirect: '/employee/staff/overview' },
      { path: 'staff/overview', name: 'StaffOverview', 
        component: () => import('../views/staff/StaffOverview.vue'), 
        meta: { roles: ['STAFF'] } 
      },
      { path: 'staff/timeline', name: 'StaffTimeline', 
        component: () => import('../views/staff/StaffTimelineWalkIn.vue'), 
        meta: { roles: ['STAFF'] } 
      },
      { path: 'staff/bookings', name: 'StaffBookings', 
        component: () => import('../views/staff/StaffBookings.vue'), 
        meta: { roles: ['STAFF'] } 
      },
      { path: 'staff/stay', name: 'StaffStay', 
        component: () => import('../views/staff/StaffStay.vue'), 
        meta: { roles: ['STAFF'] } 
      },
      { path: 'staff/history', name: 'StaffHistory', 
        component: () => import('../views/staff/StaffHistory.vue'), 
        meta: { roles: ['STAFF'] } 
      }
    ]
  },

  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/common/Error404.vue') }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation Guard
router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.role
  const userTitle = authStore.user?.title 

  const getManagerRedirect = (title) => {
    if (title === 'HR_MANAGER') return '/employee/manager/staffs'
    if (title === 'CUSTOMER_MANAGER') return '/employee/manager/customer-dashboard'
    return '/employee/manager/dashboard'
  }

  // 1. Ngăn chặn người đã đăng nhập mà cố tình truy cập lại trang Login
  if (to.meta.guestOnly && isAuthenticated) {
    if (authStore.isEmployee) {
        if (userRole === 'ADMIN') return '/employee/admin'
        if (userRole === 'MANAGER') return getManagerRedirect(userTitle)
        return '/employee/staff'
    }
    return '/home'
  }

  // 2. Bảo vệ các route cần đăng nhập
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) return to.meta.isEmployeeRoute ? '/employee/login' : '/login'
    
    // 2.1. Đẩy người dùng về đúng khu vực nếu cố tình truy cập sai Role
    if (to.meta.roles && !to.meta.roles.includes(userRole)) {
      if (userRole === 'ADMIN') return '/employee/admin'
      if (userRole === 'MANAGER') return getManagerRedirect(userTitle)
      if (userRole === 'STAFF') return '/employee/staff'
      return '/home'
    }

    // 2.2. BẢO VỆ CHÉO MANAGER: Quản lý bộ phận nào chỉ được xem bộ phận đó
    if (userRole === 'MANAGER' && to.path.includes('/manager/')) {
       const isHrRoute = to.path.includes('/manager/staffs') || to.path.includes('/manager/hr-dashboard')
       
       const isCustomerRoute = to.path.includes('/manager/customer-dashboard') || 
                               to.path.includes('/manager/customer-list') || 
                               to.path.includes('/manager/tier-config') || 
                               to.path.includes('/manager/reviews-ai')
                               
       const isOpRoute = !isHrRoute && !isCustomerRoute 
       
       if (userTitle === 'HR_MANAGER' && !isHrRoute) return '/employee/manager/staffs'
       if (userTitle === 'CUSTOMER_MANAGER' && !isCustomerRoute) return '/employee/manager/customer-dashboard'
       if (userTitle === 'OPERATION_MANAGER' && !isOpRoute) return '/employee/manager/dashboard'
    }
  }
  
  return true
})

export default router