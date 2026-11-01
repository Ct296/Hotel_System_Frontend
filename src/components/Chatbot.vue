<template>
  <div class="chatbot-container">
    <!-- Cửa sổ Chat -->
    <div v-if="isOpen" class="card shadow-lg chat-window border-0 rounded-4 overflow-hidden mb-3">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
        <h6 class="mb-0 fw-bold"><i class="fas fa-robot me-2"></i>ITHotel Assistant</h6>
        <button class="btn-close btn-close-white" @click="isOpen = false"></button>
      </div>
      
      <div class="card-body chat-body bg-body-tertiary d-flex flex-column gap-2" ref="chatBody">
        <div v-for="(msg, idx) in messages" :key="idx" 
             class="p-2 rounded-3" 
             :class="msg.role === 'user' ? 'bg-primary text-white align-self-end ms-4' : 'bg-white border align-self-start me-4'">
          <div class="small" style="white-space: pre-wrap;">{{ msg.text }}</div>
        </div>
        <div v-if="isLoading" class="align-self-start text-muted small mt-1">
          <div class="spinner-grow spinner-grow-sm text-primary" role="status"></div> AI đang nhập...
        </div>
      </div>

      <div class="card-footer bg-white border-top-0 p-2">
        <form @submit.prevent="sendMessage" class="input-group">
          <input type="text" v-model="userInput" class="form-control rounded-start-pill" placeholder="Nhập câu hỏi..." :disabled="isLoading">
          <button class="btn btn-primary rounded-end-pill px-3" type="submit" :disabled="isLoading || !userInput.trim()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>

    <!-- Nút Toggle Bong bóng Chat -->
    <button @click="isOpen = !isOpen" class="btn btn-primary btn-lg rounded-circle shadow-lg chat-toggle-btn d-flex justify-content-center align-items-center">
      <i :class="isOpen ? 'fas fa-times' : 'fas fa-comments'"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import api from '../utils/axios'

const isOpen = ref(false)
const userInput = ref('')
const isLoading = ref(false)
const chatBody = ref(null)

const messages = ref([
  { role: 'bot', text: 'Xin chào! Tôi là trợ lý ảo của ITHotel. Tôi có thể giúp gì cho bạn về việc đặt phòng hoặc dịch vụ?' }
])

const scrollToBottom = async () => {
  await nextTick()
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!userInput.value.trim()) return
  
  messages.value.push({ role: 'user', text: userInput.value })
  const messageToSend = userInput.value
  userInput.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    const res = await api.post('/api/chat', { message: messageToSend })
    messages.value.push({ role: 'bot', text: res.data.reply })
  } catch (error) {
    messages.value.push({ role: 'bot', text: 'Xin lỗi, kết nối đến hệ thống gặp sự cố.' })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.chat-window {
  width: 350px;
  height: 450px;
  display: flex;
  flex-direction: column;
}
.chat-body {
  overflow-y: auto;
  flex-grow: 1;
}
.chat-toggle-btn {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
  transition: transform 0.2s;
}
.chat-toggle-btn:hover {
  transform: scale(1.1);
}
</style>