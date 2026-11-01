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
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
  --bs-primary: #0d6efd; 
  --bs-primary-rgb: 13, 110, 253;
}

.btn {
  transition: all 0.2s ease-in-out;
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