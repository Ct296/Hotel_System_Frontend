<template>
  <div class="kiosk-container d-flex flex-column align-items-center justify-content-center min-vh-100 bg-dark text-white">
    <div class="clock-display mb-5 text-center">
      <h1 class="display-1 fw-bold text-primary">{{ time }}</h1>
      <h4 class="text-secondary text-uppercase tracking-wide">{{ date }}</h4>
    </div>

    <div class="card bg-secondary border-0 shadow-lg p-5 rounded-5" style="width: 450px; max-width: 90%;">
      <div class="text-center mb-4">
        <i class="fas fa-id-badge fa-3x text-light mb-3 opacity-75"></i>
        <h3 class="fw-bold text-white">Máy Chấm Công</h3>
        <p class="text-light opacity-50 small">Vui lòng quét thẻ hoặc nhập mã nhân viên</p>
      </div>

      <!-- Khung hiển thị thông báo -->
      <div v-if="notification.message" :class="`alert alert-${notification.type} fw-bold text-center`">
        <i :class="notification.type === 'success' ? 'fas fa-check-circle me-1' : 'fas fa-exclamation-triangle me-1'"></i>
        {{ notification.message }}
      </div>

      <form @submit.prevent="handleSwipe">
        <div class="mb-4">
          <input 
            type="text" 
            v-model="staffId" 
            class="form-control form-control-lg text-center fw-bold text-uppercase kiosk-input" 
            placeholder="VD: USR0000006"
            ref="inputField"
            autofocus
            :disabled="isLoading"
          >
        </div>
        <button type="submit" class="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow" :disabled="isLoading || !staffId">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          {{ isLoading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN CHẤM CÔNG' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '../../utils/axios' // Hoặc đường dẫn file axios của bạn

const time = ref('')
const date = ref('')
const staffId = ref('')
const isLoading = ref(false)
const notification = ref({ type: '', message: '' })
const inputField = ref(null)

let timer;

const updateClock = () => {
  const now = new Date();
  time.value = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  date.value = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const showNotification = (type, message) => {
  notification.value = { type, message }
  setTimeout(() => {
    notification.value.message = ''
  }, 4000)
}

const handleSwipe = async () => {
  if (!staffId.value) return;
  isLoading.value = true;
  notification.value.message = ''; // Reset
  
  try {
    const res = await api.post('/api/kiosk/swipe', { staffId: staffId.value });
    showNotification('success', res.data.message);
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi kết nối máy chủ.');
  } finally {
    isLoading.value = false;
    staffId.value = ''; // Xóa trắng ô input để người tiếp theo nhập
    // Giữ focus lại vào ô input
    setTimeout(() => { if(inputField.value) inputField.value.focus() }, 100);
  }
}

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
  // Ép focus vào ô input khi vừa mở màn hình
  if(inputField.value) inputField.value.focus();
})

onUnmounted(() => {
  clearInterval(timer);
})
</script>

<style scoped>
.kiosk-container {
  background-color: #121212 !important;
}
.clock-display h1 {
  font-family: 'Courier New', Courier, monospace;
  font-size: 5rem;
  text-shadow: 0 0 20px rgba(13, 110, 253, 0.5);
}
.tracking-wide {
  letter-spacing: 2px;
}
.kiosk-input {
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.5rem;
  letter-spacing: 3px;
}
.kiosk-input:focus {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: #0d6efd;
  box-shadow: 0 0 15px rgba(13, 110, 253, 0.5);
  color: white;
}
</style>