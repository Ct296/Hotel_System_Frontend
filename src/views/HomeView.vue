<script setup>
import { ref, onMounted } from 'vue';
import RoomService from '../services/RoomService';

const rooms = ref([]);
const loading = ref(true);

// Chạy ngay khi component được mount
onMounted(async () => {
  try {
    const response = await RoomService.getPublicRooms();
    rooms.value = response.data; // Gán data từ Backend vào biến rooms
  } catch (error) {
    console.error("Lỗi khi tải danh sách phòng:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="container">
    <h1 class="title">Hệ thống Đặt phòng Khách sạn</h1>
    
    <div v-if="loading" class="loading">Đang tải danh sách phòng...</div>
    
    <div v-else class="room-grid">
      <!-- Duyệt qua mảng rooms để in ra từng thẻ phòng -->
      <div v-for="room in rooms" :key="room.id" class="room-card">
        <!-- Chú ý: Cần nối thêm localhost:8080 nếu ảnh đang lưu ở Backend -->
        <img :src="`http://localhost:8080${room.primaryImage}`" :alt="room.name" class="room-img" />
        
        <div class="room-info">
          <h2>Phòng {{ room.name }}</h2>
          <p class="type">{{ room.typeName }} - {{ room.bedType }}</p>
          <p class="capacity">👤 Tối đa: {{ room.adultMax }} người lớn, {{ room.childrenMax }} trẻ em</p>
          <p class="price">{{ room.basePrice.toLocaleString('vi-VN') }} VNĐ / đêm</p>
          <button class="btn-book">Xem chi tiết</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container { padding: 20px; font-family: sans-serif; }
.title { text-align: center; color: #2c3e50; margin-bottom: 30px; }
.loading { text-align: center; font-size: 1.2rem; color: #666; }

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  padding: 0 20px;
}

.room-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.room-card:hover { transform: translateY(-5px); box-shadow: 0 6px 12px rgba(0,0,0,0.1); }

.room-img { width: 100%; height: 200px; object-fit: cover; }

.room-info { padding: 15px; }
.room-info h2 { margin: 0 0 10px; font-size: 1.4rem; color: #333; }
.type { color: #666; font-size: 0.95rem; margin-bottom: 5px; }
.capacity { font-size: 0.85rem; color: #888; margin-bottom: 10px; }
.price { color: #e74c3c; font-weight: bold; font-size: 1.2rem; margin-bottom: 15px; }

.btn-book {
  width: 100%;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.btn-book:hover { background-color: #2980b9; }
</style>