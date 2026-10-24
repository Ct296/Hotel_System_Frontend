import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { h } from 'vue'

import CustomerLayout from '../layouts/CustomerLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

const DummyComponent = { render: () => h('div', { class: 'p-5 text-center' }, h('h2', 'Trang này đang được xây dựng...')) }

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

      
      { path: 'manager', name: 'ManagerDashboard', component: DummyComponent, meta: { roles: ['MANAGER', 'ADMIN'] } },
      { path: 'staff', name: 'StaffDashboard', component: DummyComponent, meta: { roles: ['STAFF', 'MANAGER', 'ADMIN'] } }
    ]
  },

  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/common/Error404.vue') }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.role

  // Đang login rồi mà cố tình vào trang login nữa
  if (to.meta.guestOnly && isAuthenticated) {
    if (authStore.isEmployee) return next('/employee/admin')
    return next('/home')
  }

  // Chặn người lạ vào trang cần quyền
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) return to.meta.isEmployeeRoute ? next('/employee/login') : next('/login')
    
    // Check Role nội bộ
    if (to.meta.roles && !to.meta.roles.includes(userRole)) {
      return authStore.isEmployee ? next('/employee/admin') : next('/home')
    }
  }

  next()
})

export default router