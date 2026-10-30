<template>
  <div>
    <!-- HERO SECTION & TÌM KIẾM -->
    <section class="position-relative pt-5 pb-4 overflow-hidden hero-section">
      <div class="container position-relative z-1">
        <div class="row align-items-center g-4">
          <div class="col-lg-6">
            <span class="badge bg-primary rounded-pill px-3 py-2 mb-3 shadow-sm"><i class="fas fa-sparkles me-2"></i>ITHotel Experience</span>
            <h1 class="display-4 fw-bold text-body-emphasis mb-3" style="line-height: 1.1;">Đặt phòng nhanh,<br>trải nghiệm hạng sang</h1>
            <p class="text-body-secondary fs-5 mb-4">Tìm phòng theo giờ trong vài giây. Xem hạng phòng chi tiết và tận hưởng không gian lưu trú hiện đại.</p>
          </div>
          
          <div class="col-lg-6">
            <div class="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-body-tertiary">
              <h3 class="fw-bold text-body-emphasis mb-1">Tìm phòng nhanh</h3>
              <p class="text-body-secondary small mb-4">Chọn thời gian để kiểm tra phòng trống</p>
              
              <form @submit.prevent="searchRooms" class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-body-secondary text-uppercase">Giờ nhận phòng</label>
                  <input type="datetime-local" v-model="searchForm.checkIn" class="form-control form-control-lg bg-body" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-body-secondary text-uppercase">Giờ trả phòng</label>
                  <input type="datetime-local" v-model="searchForm.checkOut" class="form-control form-control-lg bg-body" required>
                </div>
                <div class="col-12">
                  <label class="form-label fw-bold small text-body-secondary text-uppercase">Hạng phòng (Tùy chọn)</label>
                  <select v-model="searchForm.typeId" class="form-select form-select-lg bg-body">
                    <option value="">-- Tất cả hạng phòng --</option>
                    <option v-for="type in homeData.roomTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
                  </select>
                </div>
                <div class="col-12 mt-4">
                  <button type="submit" class="btn btn-primary btn-lg w-100 fw-bold shadow"><i class="fas fa-search me-2"></i> TÌM PHÒNG NGAY</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- DANH SÁCH PHÒNG CAO CẤP -->
    <section class="py-5 bg-body-tertiary" v-if="homeData.luxuryRoomTypes?.length > 0">
      <div class="container py-4">
        <div class="text-center mb-5">
          <span class="badge bg-warning text-dark rounded-pill px-3 py-2 mb-2">CURATED COLLECTION</span>
          <h2 class="fw-bold text-body-emphasis">PHÒNG VIP & CAO CẤP</h2>
          <div class="mx-auto bg-primary mt-3" style="width: 60px; height: 3px;"></div>
        </div>
        <div class="row g-4">
          <div class="col-md-4" v-for="type in homeData.luxuryRoomTypes" :key="type.id">
            <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden room-card bg-body">
              <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80" class="card-img-top" style="height: 250px; object-fit: cover;">
              <div class="card-body p-4">
                <h5 class="fw-bold text-body-emphasis">{{ type.name }}</h5>
                <p class="text-body-secondary small mb-3">{{ type.description || 'Không gian sang trọng, đẳng cấp.' }}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-primary fw-bold fs-5">{{ formatPrice(type.basePrice) }}<small class="text-body-secondary fs-6">/giờ</small></span>
                  <div class="d-flex gap-2">
                    <span class="badge bg-body-secondary text-body-emphasis border"><i class="fas fa-user me-1 text-secondary"></i>{{ type.adultMax + type.childrenMax }}</span>
                    <span class="badge bg-body-secondary text-body-emphasis border"><i class="fas fa-vector-square me-1 text-secondary"></i>{{ type.area }}m&sup2;</span>
                  </div>
                </div>
              </div>
              <div class="card-footer bg-body border-0 p-4 pt-0">
                <router-link :to="`/rooms?typeId=${type.id}`" class="btn btn-outline-primary w-100 fw-bold">Xem chi tiết</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../utils/axios'

const router = useRouter()
const homeData = ref({ roomTypes: [], luxuryRoomTypes: [], budgetRoomTypes: [] })
const searchForm = ref({ checkIn: '', checkOut: '', typeId: '' })

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0) + ' đ'

const fetchHomeData = async () => {
  try {
    const res = await api.get('/api/public/home')
    homeData.value = res.data
  } catch (error) { console.error(error) }
}

const searchRooms = () => {
  router.push({
    path: '/rooms',
    query: { 
      checkIn: searchForm.value.checkIn, 
      checkOut: searchForm.value.checkOut, 
      typeId: searchForm.value.typeId 
    }
  })
}

onMounted(() => fetchHomeData())
</script>

<style scoped>
/* Gradient nền linh hoạt theo Theme */
.hero-section {
  background: linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.84)), linear-gradient(135deg, #0d6efd, #0a58ca);
}

[data-bs-theme="dark"] .hero-section {
  background: linear-gradient(135deg, rgba(18, 18, 18, 0.92), rgba(18, 18, 18, 0.84)), linear-gradient(135deg, #0d6efd, #0a58ca);
}

.room-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.room-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
</style>