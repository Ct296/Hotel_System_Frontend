<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../utils/axios'

const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  try {
    const response = await api.post('/api/auth/login', {
      email: email.value,
      password: password.value
    })
    
    // Lưu token và thông tin user vào localStorage
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('userRole', response.data.role)
    localStorage.setItem('userEmail', response.data.email)
    
    alert('Đăng nhập thành công!')
    
    // Chuyển hướng dựa theo Role
    if(response.data.role === 'ADMIN' || response.data.role === 'MANAGER') {
      router.push('/admin') // Sau này mình sẽ tạo trang này
    } else {
      router.push('/')
    }
    
  } catch (error) {
    errorMessage.value = error.response?.data || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.'
  }
}
</script>

<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin" class="login-form">
      <h2>Đăng nhập Hệ thống</h2>
      
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <div class="form-group">
        <label>Email:</label>
        <input type="email" v-model="email" required placeholder="admin@ithotel.vn" />
      </div>

      <div class="form-group">
        <label>Mật khẩu:</label>
        <input type="password" v-model="password" required />
      </div>

      <button type="submit">Đăng nhập</button>
    </form>
  </div>
</template>

<style scoped>
.login-container { display: flex; justify-content: center; margin-top: 50px; }
.login-form { width: 350px; padding: 30px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.login-form h2 { text-align: center; margin-bottom: 20px; color: #2c3e50; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
.form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
button { width: 100%; padding: 10px; background-color: #27ae60; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
button:hover { background-color: #2ecc71; }
.error { color: #e74c3c; text-align: center; font-size: 14px; margin-bottom: 15px; }
</style>