<template>
  <div v-if="!isLoading && weatherData" class="d-flex align-items-center bg-white rounded-pill px-3 py-1 shadow-sm border border-secondary-subtle">
    <!-- Icon trả về từ API -->
    <span class="fs-5 me-2">{{ weatherData.iconText }}</span>
    <div class="d-flex flex-column lh-1 text-start">
      <span class="fw-bold text-primary" style="font-size: 0.9rem;">{{ weatherData.temperature }}°C</span>
      <span class="text-secondary" style="font-size: 0.75rem;">{{ weatherData.location }} - {{ weatherData.description }}</span>
    </div>
  </div>
  <div v-else-if="isLoading" class="spinner-border spinner-border-sm text-white" role="status"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/axios'

const weatherData = ref(null)
const isLoading = ref(true)

const fetchWeather = async () => {
  try {
    const res = await api.get('/api/public/weather/current')
    weatherData.value = res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu thời tiết', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchWeather()
})
</script>