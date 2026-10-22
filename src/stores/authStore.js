// src/stores/authStore.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    role: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isEmployee: (state) => state.role && state.role !== 'CUSTOMER',
    isAdmin: (state) => state.role === 'ADMIN',
    isManager: (state) => state.role === 'MANAGER',
    isStaff: (state) => state.role === 'STAFF',
    isCustomer: (state) => state.role === 'CUSTOMER'
  },
  
  actions: {
    setAuth(data) {
      this.token = data.token;
      this.role = data.role;
      this.user = data.user;
    },
    clearAuth() {
      this.token = null;
      this.role = null;
      this.user = null;
    }
  },
  
  // Tùy chọn này cấu hình pinia-plugin-persistedstate tự động lưu state vào localStorage
  persist: true 
})