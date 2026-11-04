<template>
  <router-view />
  
  <Chatbot v-if="isPublicPage" />
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from './stores/themeStore'
import Chatbot from './components/Chatbot.vue'

const themeStore = useThemeStore()
const route = useRoute()

const isPublicPage = computed(() => {
  if (!route.path) return false
  return !route.path.startsWith('/employee') && !route.path.startsWith('/kiosk')
})

onMounted(() => {
  themeStore.applyTheme()
})
</script>

<style>
/* Import phông chữ Playfair Display - Bản nâng cấp sang trọng của Times New Roman */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  /* Đổi phông chữ chính toàn hệ thống sang Serif */
  font-family: 'Playfair Display', 'Times New Roman', Times, serif;
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

:root {
  /* Đổi màu chủ đạo (Primary) sang tone Xám Than (Charcoal Gray) */
  --bs-primary: #545b62; 
  --bs-primary-rgb: 84, 91, 98;
}

/* Tùy chỉnh hiệu ứng cho các nút bấm */
.btn {
  transition: all 0.2s ease-in-out;
}

/* Nút Primary (Màu chủ đạo mới) */
.btn-primary {
  background-color: var(--bs-primary) !important;
  border-color: var(--bs-primary) !important;
  color: #ffffff !important;
}

.btn-primary:hover {
  background-color: #43494e !important; /* Xám đậm hơn khi hover */
  border-color: #43494e !important;
}

.btn-success {
  background-color: #198754 !important;
  border-color: #198754 !important;
  color: #fff !important;
}

.btn-danger {
  background-color: #dc3545 !important;
  border-color: #dc3545 !important;
  color: #fff !important;
}

.card, .sidebar-container, .navbar, .modal-content {
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
</style>