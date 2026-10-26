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
  { 
    path: '/kiosk', 
    name: 'TimeclockKiosk', 
    component: () => import('../views/kiosk/Timeclock.vue') 
  },

  // --- CUSTOMER ROUTES ---
  {
    path: '/',
    component: CustomerLayout,
    children: [
      { path: '', redirect: '/home' },
      { path: 'home', name: 'Home', component: () => import('../views/public/Home.vue') },
      { path: 'rooms', name: 'Rooms', component: () => import('../views/public/Rooms.vue') }
    ]
  },

  // --- INTERNAL (DASHBOARD) ROUTES ---
  {
    path: '/employee',
    component: DashboardLayout,
    meta: { requiresAuth: true, isEmployeeRoute: true },
    children: [
      { path: '', redirect: '/employee/admin' },
      
      { path: 'admin', name: 'AdminDashboard', component: () => import('../views/admin/AdminDashboard.vue'), meta: { roles: ['ADMIN'] } },
      { path: 'accounts', name: 'AccountManagement', component: () => import('../views/admin/AccountManagement.vue'), meta: { roles: ['ADMIN'] } },
      

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
        path: 'manager/incidents',
        name: 'IncidentManagement',
        component: () => import('../views/manager/operation/IncidentManagement.vue'),
        meta: { roles: ['MANAGER'] }
      },
      
      {
          path: 'manager/hr-dashboard',
          name: 'HrDashboard',
          component: () => import('../views/manager/hr/HrDashboard.vue'),
          meta: { roles: ['MANAGER'] }
      },

      {
          path: 'manager/staffs',
          name: 'StaffManagement',
          component: () => import('../views/manager/hr/StaffManagement.vue'),
          meta: { roles: ['MANAGER'] }
        },


      { path: 'staff', name: 'StaffDashboard', component: DummyComponent, meta: { roles: ['STAFF'] } }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/common/Error404.vue') }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Cách dùng mới theo chuẩn Vue Router 4
router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.role
  const userTitle = authStore.user?.title // Lấy chức danh Manager

  // 1. Ngăn chặn người đã đăng nhập mà cố tình truy cập lại trang Login
  if (to.meta.guestOnly && isAuthenticated) {
    if (authStore.isEmployee) {
        if (userRole === 'ADMIN') return '/employee/admin'
        if (userRole === 'MANAGER') {
            return userTitle === 'HR_MANAGER' ? '/employee/manager/staffs' : '/employee/manager/dashboard'
        }
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
      if (userRole === 'MANAGER') {
          return userTitle === 'HR_MANAGER' ? '/employee/manager/staffs' : '/employee/manager/dashboard'
      }
      if (userRole === 'STAFF') return '/employee/staff'
      return '/home'
    }

    // 2.2. BẢO VỆ CHÉO: Ngăn chặn tuyệt đối HR vào Vận hành và ngược lại
    if (userRole === 'MANAGER' && to.path.includes('/manager/')) {
       // Cập nhật danh sách các đường dẫn hợp lệ của HR
       const isHrRoute = to.path.includes('/manager/staffs') || to.path.includes('/manager/hr-dashboard')
       
       if (userTitle === 'HR_MANAGER' && !isHrRoute) {
           return '/employee/manager/staffs' // HR thì chỉ được ở trong nhà HR
       }
       if (userTitle === 'OPERATION_MANAGER' && isHrRoute) {
           return '/employee/manager/dashboard' // OP thì không được rờ tới HR
       }
    }
  }
  
  // Hợp lệ tất cả thì cho phép qua cửa
  return true
})

export default router