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
        path: 'manager/room-types', 
        name: 'RoomTypeManagement', 
        component: () => import('../views/manager/operation/RoomTypeManagement.vue'), 
        meta: { roles: ['MANAGER'] } 
      },

      { 
        path: 'manager/amenities', 
        name: 'AmenityManagement', 
        component: () => import('../views/manager/operation/AmenityManagement.vue'), 
        meta: { roles: ['MANAGER'] } 
      },

      { 
        path: 'manager/rooms', 
        name: 'RoomManagement', 
        component: () => import('../views/manager/operation/RoomManagement.vue'), 
        meta: { roles: ['MANAGER'] } 
      },
      
      { 
        path: 'manager/pricing', 
        name: 'PricingManagement', 
        component: () => import('../views/manager/operation/PricingManagement.vue'), 
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

  if (to.meta.guestOnly && isAuthenticated) {
    if (authStore.isEmployee) return '/employee/admin'
    return '/home'
  }

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) return to.meta.isEmployeeRoute ? '/employee/login' : '/login'
    
    // Kiểm tra Role cơ bản
    if (to.meta.roles && !to.meta.roles.includes(userRole)) {
      if (userRole === 'ADMIN') return '/employee/admin'
      if (userRole === 'MANAGER') return '/employee/manager/room-types'
      if (userRole === 'STAFF') return '/employee/staff'
      return '/home'
    }
  }
  
  // Trả về true hoặc không return gì để cho phép chuyển trang
  return true
})

export default router