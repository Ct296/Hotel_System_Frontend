<template>
  <router-view />
</template>

<script setup>
// Không cần import component thủ công.
// vue-router sẽ tự động bắt URL và ném component tương ứng vào <router-view>.
</script>

<style>
/* Reset CSS và cấu hình hiển thị toàn cục */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f4f6f9;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 
  Bạn có thể import các thư viện CSS dùng chung ở đây nếu chưa import ở main.js
  Ví dụ: @import 'bootstrap/dist/css/bootstrap.min.css'; 
*/
</style>