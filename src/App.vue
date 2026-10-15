<template>
  <nav class="main-nav">
    <router-link to="/">Trang chủ</router-link>
    <router-link to="/login">Đăng nhập</router-link>
  </nav>
  
  <!-- Nơi Router sẽ render các trang HomeView, LoginView... -->
  <router-view></router-view> 
</template>

<style scoped>
.main-nav {
  padding: 15px 20px;
  background-color: #2c3e50;
  margin-bottom: 20px;
}
.main-nav a {
  color: white;
  text-decoration: none;
  margin-right: 20px;
  font-weight: bold;
}
.main-nav a.router-link-active {
  color: #3498db;
}
</style>