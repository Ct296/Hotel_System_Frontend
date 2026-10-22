import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { h } from 'vue'

// Import Layouts
import CustomerLayout from '../layouts/CustomerLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

const DummyComponent = { render: () => h('div', { class: 'p-5 text-center' }, h('h2', 'Trang này đang được xây dựng...')) }

const routes = [
// CÁC TRANG KHÔNG DÙNG LAYOUT CHUNG (Auth)
  { path: '/login', name: 'Login', component: () => import('../views/auth/Login.vue'), meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: () => import('../views/auth/Register.vue'), meta: { guestOnly: true } },
  { path: '/employee/login', name: 'EmployeeLogin', component: () => import('../views/auth/EmployeeLogin.vue'), meta: { guestOnly: true, isEmployeeRoute: true } },
  // CÁC TRANG DÙNG CUSTOMER LAYOUT
  {
    path: '/',
    component: CustomerLayout,
    children: [
      { path: '', redirect: '/home' },
      { path: 'home', name: 'Home', component: DummyComponent }, // Sẽ thay bằng import Home.vue sau
      { path: 'customer/profile', name: 'CustomerProfile', component: DummyComponent, meta: { requiresAuth: true, role: 'CUSTOMER' } }
      // Các route public khác: rooms, services, guide... sẽ nằm trong đây
    ]
  },

  // CÁC TRANG DÙNG DASHBOARD LAYOUT (Nội bộ)
  {
    path: '/employee',
    component: DashboardLayout,
    meta: { requiresAuth: true, isEmployeeRoute: true },
    children: [
      { path: '/admin/dashboard', name: 'Admin Dashboard', component: DummyComponent, meta: { roles: ['ADMIN'] } },
      { path: '/manager/dashboard', name: 'Manager Dashboard', component: DummyComponent, meta: { roles: ['MANAGER', 'ADMIN'] } },
      { path: '/staff/dashboard', name: 'Staff Dashboard', component: DummyComponent, meta: { roles: ['STAFF', 'MANAGER', 'ADMIN'] } },
      { path: '/employee/profile', name: 'Employee Profile', component: DummyComponent, meta: { roles: ['STAFF', 'MANAGER', 'ADMIN'] } }
    ]
  },

  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/common/Error404.vue') }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// NAVIGATION GUARDS (GIỮ NGUYÊN NHƯ CŨ)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.role

  if (to.meta.guestOnly && isAuthenticated) {
    if (authStore.isEmployee) return next('/manager/dashboard') 
    return next('/home')
  }

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) return to.meta.isEmployeeRoute ? next('/employee/login') : next('/login')
    if (to.meta.roles && !to.meta.roles.includes(userRole)) return next('/home')
    if (to.meta.role && to.meta.role !== userRole) return next('/home')
  }

  next()
})

export default router