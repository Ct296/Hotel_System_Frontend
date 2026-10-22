<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const userEmail = localStorage.getItem('userEmail')

const logout = () => {
  localStorage.clear()
  router.push('/login')
}
</script>

<template>
  <div class="admin-wrapper">
    <!-- Sidebar bên trái -->
    <aside class="sidebar">
      <div class="logo">
        <h2>IT Hotel Admin</h2>
      </div>
      <nav class="side-nav">
        <router-link to="/admin" exact-active-class="active">📊 Tổng quan (Dashboard)</router-link>
        <router-link to="/admin/rooms" active-class="active">🛏️ Quản lý Phòng</router-link>
        <router-link to="/admin/services" active-class="active">🍽️ Dịch vụ</router-link>
        <router-link to="/admin/staff" active-class="active">👥 Nhân sự</router-link>
      </nav>
      <div class="sidebar-footer">
        <p>{{ userEmail }}</p>
        <button @click="logout" class="btn-logout">Đăng xuất</button>
      </div>
    </aside>

    <!-- Nội dung chính bên phải -->
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.admin-wrapper { display: flex; min-height: 100vh; background-color: #f4f6f9; }
.sidebar { width: 250px; background-color: #2c3e50; color: white; display: flex; flex-direction: column; }
.logo { padding: 20px; text-align: center; border-bottom: 1px solid #34495e; }
.side-nav { display: flex; flex-direction: column; flex-grow: 1; padding: 20px 0; }
.side-nav a { padding: 15px 20px; color: #bdc3c7; text-decoration: none; transition: 0.3s; }
.side-nav a:hover, .side-nav a.active { background-color: #34495e; color: white; border-left: 4px solid #3498db; }
.sidebar-footer { padding: 20px; text-align: center; border-top: 1px solid #34495e; font-size: 0.9rem; }
.btn-logout { margin-top: 10px; width: 100%; padding: 8px; background: #e74c3c; border: none; color: white; cursor: pointer; border-radius: 4px; }
.main-content { flex-grow: 1; padding: 30px; overflow-y: auto; }
</style>