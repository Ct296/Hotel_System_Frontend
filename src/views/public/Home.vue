<template>
  <div>
    <!-- HERO SECTION VỚI BACKGROUND ẢNH CỰC CHILL -->
    <section class="position-relative hero-section d-flex align-items-center justify-content-center">
      <div class="hero-overlay"></div>
      
      <div class="container position-relative z-2 text-center text-white">
        <span class="badge text-uppercase tracking-wider mb-4 px-4 py-2 rounded-pill" style="background-color: rgba(255, 215, 0, 0.15); color: #FFD700; border: 1px solid rgba(255, 215, 0, 0.4);">
          <i class="fas fa-star me-2"></i>Trải nghiệm thượng lưu
        </span>
        <h1 class="display-3 fw-bold mb-4 font-serif text-shadow-sm">Nơi khoảnh khắc <br> trở thành ký ức</h1>
        <p class="lead fw-light opacity-75 mb-0 mx-auto" style="max-width: 600px;">
          Tận hưởng không gian lưu trú đẳng cấp, tiện nghi bậc nhất và đặt phòng theo giờ nhanh chóng chỉ trong vài giây.
        </p>
      </div>
    </section>

    <!-- FLOATING BOOKING BAR -->
    <div class="container position-relative z-3" style="margin-top: -60px;">
      <div class="card border-0 shadow-lg rounded-4 p-2 bg-body">
        <form @submit.prevent="searchRooms" class="row g-2 align-items-center m-0">
          <div class="col-md-3 px-3 py-2 border-end border-secondary-subtle">
            <label class="form-label fw-bold small text-body-secondary mb-1 tracking-wider text-uppercase" style="font-size: 0.75rem;">Nhận phòng</label>
            <input type="datetime-local" v-model="searchForm.checkIn" class="form-control border-0 shadow-none px-0 bg-transparent fw-semibold" required>
          </div>
          <div class="col-md-3 px-3 py-2 border-end border-secondary-subtle">
            <label class="form-label fw-bold small text-body-secondary mb-1 tracking-wider text-uppercase" style="font-size: 0.75rem;">Trả phòng</label>
            <input type="datetime-local" v-model="searchForm.checkOut" class="form-control border-0 shadow-none px-0 bg-transparent fw-semibold" required>
          </div>
          <div class="col-md-3 px-3 py-2">
            <label class="form-label fw-bold small text-body-secondary mb-1 tracking-wider text-uppercase" style="font-size: 0.75rem;">Hạng phòng (Tùy chọn)</label>
            <select v-model="searchForm.typeId" class="form-select border-0 shadow-none px-0 bg-transparent fw-semibold text-truncate">
              <option value="">-- Tất cả hạng phòng --</option>
              <option v-for="type in homeData.roomTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
          </div>
          <div class="col-md-3 px-2">
            <button type="submit" class="btn btn-dark w-100 py-3 fw-bold rounded-3 text-uppercase tracking-wider shadow-sm transition-all custom-btn-search">
              <i class="fas fa-search me-2"></i>Tìm phòng
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DANH SÁCH PHÒNG CAO CẤP -->
    <section class="py-5 bg-body-tertiary mt-4" v-if="homeData.luxuryRoomTypes?.length > 0">
      <div class="container py-4">
        <div class="text-center mb-5">
          <span class="badge text-dark rounded-pill px-3 py-2 mb-3 tracking-wider text-uppercase" style="background-color: #f8e5c2;">Curated Collection</span>
          <h2 class="fw-bold text-body-emphasis font-serif display-6 text-uppercase">Phòng VIP & Cao Cấp</h2>
          <div class="mx-auto mt-3" style="width: 60px; height: 3px; background-color: #212529;"></div>
        </div>
        
        <div class="row g-4">
          <div class="col-md-6 col-lg-4" v-for="type in homeData.luxuryRoomTypes" :key="type.id">
            <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden room-card bg-body">
              <!-- KHUNG ẢNH KÈM NÚT CHUYỂN SLIDE -->
              <div class="position-relative overflow-hidden room-slider-container">
                <img :src="getCurrentImage(type)" class="card-img-top room-img" style="height: 250px; object-fit: cover;" @error="handleImageError">
                
                <!-- Nút chuyển ảnh Trái / Phải (Chỉ hiện khi có nhiều hơn 1 ảnh) -->
                <template v-if="getImageList(type).length > 1">
                  <button type="button" class="slider-btn slider-btn-prev" @click.stop.prevent="prevImage(type)" title="Ảnh trước">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <button type="button" class="slider-btn slider-btn-next" @click.stop.prevent="nextImage(type)" title="Ảnh tiếp">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                  <span class="slider-counter badge bg-dark bg-opacity-75 rounded-pill px-2 py-1">
                    {{ (activeImageIndex[type.id] || 0) + 1 }} / {{ getImageList(type).length }}
                  </span>
                </template>
              </div>

              <div class="card-body p-4 d-flex flex-column h-100">
                <h5 class="fw-bold text-body-emphasis mb-2 font-serif fs-4">{{ type.name }}</h5>
                
                <!-- Thông số cơ bản (Hiển thị rõ Người lớn & Trẻ em) -->
                <div class="d-flex flex-wrap gap-2 mb-3 mt-1">
                  <span class="text-body-secondary small"><i class="fas fa-bed text-secondary me-1"></i>{{ type.bed || '1 Giường' }}</span>
                  <span class="text-body-secondary small border-start border-secondary-subtle ps-2"><i class="fas fa-ruler-combined text-secondary me-1"></i>{{ type.area }}m&sup2;</span>
                  <span class="text-body-secondary small border-start border-secondary-subtle ps-2">
                    <i class="fas fa-user-friends text-secondary me-1"></i>{{ type.adultMax || 0 }} NL, {{ type.childrenMax || 0 }} TE
                  </span>
                </div>

                <!-- Tiện ích -->
                <div class="small text-body-secondary mb-2">
                  <div v-if="type.roomAmenities && type.roomAmenities.length > 0">
                    <span v-for="ra in type.roomAmenities.slice(0, 4)" :key="ra.amenity?.id" class="me-3 d-inline-block mb-1">
                      <i class="fas fa-check text-success me-1"></i> {{ ra.amenity?.name }}
                    </span>
                    <span v-if="type.roomAmenities.length > 4" class="fst-italic opacity-75">+{{ type.roomAmenities.length - 4 }} tiện ích</span>
                  </div>
                  <div v-else class="fst-italic opacity-50">Đang cập nhật tiện ích...</div>
                </div>

                <!-- Mô tả -->
                <p class="small text-body-secondary mb-4 flex-grow-1 border-top border-secondary-subtle pt-2 mt-1">
                  <i class="fas fa-info-circle text-primary me-1"></i> {{ type.description || 'Không gian lưu trú sang trọng, đẳng cấp với nội thất hiện đại và tiện nghi bậc nhất.' }}
                </p>
                
                <!-- GIÁ & NÚT CHỌN (CẬP NHẬT HIỂN THỊ QUA ĐÊM) -->
                <div class="mt-auto pt-3 border-top border-secondary-subtle">
                  <div v-if="type.surchargeAmount && type.surchargeAmount !== 0" class="mb-2">
                    <span class="badge mb-2 px-2 py-1" :class="type.surchargeAmount < 0 ? 'bg-success' : 'bg-warning text-dark'">
                      <i class="fas fa-tag me-1"></i> {{ type.eventName }}
                    </span>
                    <div class="d-flex flex-column">
                      <span class="text-body-secondary text-decoration-line-through fw-semibold mb-2" style="font-size: 0.85rem;">
                        Gốc: {{ formatPrice(type.basePrice) }}/h | {{ formatPrice(getDailyPrice(type)) }}/đêm/22h
                      </span>
                      <div class="d-flex justify-content-between align-items-end mt-1">
                        <div class="d-flex flex-column">
                          <div class="mb-1">
                            <span class="text-danger fw-bold fs-4" style="letter-spacing: -1px;">{{ formatPrice(type.displayPrice) }}</span>
                            <span class="text-body-secondary ms-1 fw-semibold small">/ giờ</span>
                          </div>
                          <div>
                            <span class="text-danger fw-bold fs-5" style="letter-spacing: -1px;">{{ formatPrice(getDiscountedDailyPrice(type)) }}</span>
                            <span class="text-body-secondary ms-1 fw-semibold small">/ đêm/22h</span>
                          </div>
                        </div>
                        <router-link :to="`/rooms?typeId=${type.id}`" class="btn btn-sm btn-dark rounded-pill fw-bold px-4 py-2 shadow-sm transition-all mb-1">Chi tiết</router-link>
                      </div>
                    </div>
                  </div>

                  <div v-else class="d-flex justify-content-between align-items-end">
                    <div class="d-flex flex-column">
                      <div class="mb-1">
                        <span class="text-body-emphasis fw-bold fs-4" style="letter-spacing: -1px;">{{ formatPrice(type.displayPrice || type.basePrice) }}</span>
                        <span class="text-body-secondary ms-1 fw-semibold small">/ giờ</span>
                      </div>
                      <div>
                        <span class="text-body-emphasis fw-bold fs-5" style="letter-spacing: -1px;">{{ formatPrice(getDailyPrice(type)) }}</span>
                        <span class="text-body-secondary ms-1 fw-semibold small">/ đêm/22h</span>
                      </div>
                    </div>
                    <router-link :to="`/rooms?typeId=${type.id}`" class="btn btn-sm btn-dark rounded-pill fw-bold px-4 py-2 shadow-sm transition-all mb-1">Chi tiết</router-link>
                  </div>
                </div>

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
import { formatPrice, handleImageError, getDailyPrice, getDiscountedDailyPrice } from '../../utils/formatters'
import { useRoomImageSlider } from '../../composables/useRoomImageSlider'
const { activeImageIndex, getImageList, getCurrentImage, prevImage, nextImage } = useRoomImageSlider()


const router = useRouter()
const homeData = ref({ roomTypes: [], luxuryRoomTypes: [], budgetRoomTypes: [] })
const searchForm = ref({ checkIn: '', checkOut: '', typeId: '' })


const fetchHomeData = async () => {
  try {
    const res = await api.get('/api/public/home')
    homeData.value = res.data
  } catch (error) { 
    console.error(error) 
  }
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

onMounted(() => {
  fetchHomeData()
})
</script>

<style scoped>
.tracking-wider {
  letter-spacing: 1.5px;
}

/* Background ảnh */
.hero-section {
  min-height: auto;
  padding: 120px 0;
  background: url('https://images.unsplash.com/photo-1542314831-c6a4d1409e1c?auto=format&fit=crop&w=1920&q=80') center center / cover no-repeat;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.75));
  z-index: 1;
}

.text-shadow-sm {
  text-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.5;
  transition: 0.2s;
}
input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}
.form-control:focus, .form-select:focus {
  outline: none;
  box-shadow: none;
}

.custom-btn-search {
  background-color: #1a1a1a;
  color: #fff;
  border: none;
}
.custom-btn-search:hover {
  background-color: #333;
  transform: translateY(-2px);
}
[data-bs-theme="dark"] .custom-btn-search {
  background-color: #0d6efd;
}
[data-bs-theme="dark"] .custom-btn-search:hover {
  background-color: #0b5ed7;
}

.transition-all {
  transition: all 0.3s ease;
}

.room-card {
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}
.room-img {
  transition: transform 0.6s ease;
}
.room-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
}
.room-card:hover .room-img {
  transform: scale(1.05);
}
[data-bs-theme="dark"] .room-card:hover {
  box-shadow: 0 20px 40px rgba(0,0,0,0.5) !important;
}

/* NÚT SLIDER ẢNH */
.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 5;
}
.room-slider-container:hover .slider-btn {
  opacity: 1;
}
.slider-btn:hover {
  background: rgba(0, 0, 0, 0.85);
  transform: translateY(-50%) scale(1.1);
}
.slider-btn-prev { left: 10px; }
.slider-btn-next { right: 10px; }
.slider-counter {
  position: absolute;
  bottom: 10px;
  right: 12px;
  font-size: 0.72rem;
  z-index: 4;
}
</style>