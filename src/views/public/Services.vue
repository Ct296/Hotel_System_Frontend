<template>
  <div class="bg-body-tertiary min-vh-100 pb-5">
    
    <!-- BANNER CHÍNH ĐỒNG BỘ -->
    <div class="position-relative hero-section d-flex align-items-center justify-content-center text-center text-white shadow-sm">
      <div class="hero-overlay"></div>
      <div class="container py-4 position-relative z-2">
        <h1 class="fw-bold text-uppercase mb-3 font-serif display-4 text-shadow-sm">Dịch vụ & Tiện ích</h1>
        <p class="lead mb-0 opacity-75 text-shadow-sm">Nâng tầm trải nghiệm nghỉ dưỡng của bạn tại ITHotel</p>
      </div>
    </div>

    <div class="container mt-5">
      <div class="row g-4">
        
        <!-- CỘT TRÁI (9 CỘT): DANH SÁCH DỊCH VỤ DẠNG THẺ NHỎ GỌN (3 CỘT/HÀNG) -->
        <div class="col-lg-9">
          <!-- Thanh tìm kiếm nhanh dịch vụ -->
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 bg-body p-3 rounded-4 shadow-sm border border-secondary-subtle">
            <div class="fw-bold text-body-emphasis">
              <i class="fas fa-concierge-bell text-primary me-2"></i>Danh mục dịch vụ phục vụ tại phòng ({{ filteredServices.length }})
            </div>
            <div class="input-group input-group-sm" style="max-width: 260px;">
              <span class="input-group-text bg-body-tertiary border-secondary-subtle"><i class="fas fa-search text-secondary"></i></span>
              <input type="text" v-model="searchQuery" class="form-control bg-body border-secondary-subtle" placeholder="Tìm tên dịch vụ...">
              <button v-if="searchQuery" class="btn btn-outline-secondary border-secondary-subtle" type="button" @click="searchQuery = ''">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-dark" role="status"></div>
            <p class="mt-3 text-body-secondary fw-bold tracking-wider text-uppercase small">Đang tải danh sách dịch vụ...</p>
          </div>

          <!-- Lưới 3 cột nhỏ gọn -->
          <div v-else class="row g-3">
            <div v-for="(svc, index) in filteredServices" :key="svc.id || index" class="col-6 col-md-4">
              <div class="card h-100 border-0 shadow-sm service-card rounded-4 overflow-hidden bg-body">
                <div class="position-relative overflow-hidden">
                  <img :src="resolveImageUrl(svc.imagePath, DEFAULT_IMAGES.SERVICE)" 
                       class="card-img-top object-fit-cover service-img" 
                       style="height: 135px;" 
                       alt="Service Image" 
                       @error="handleImageError($event, DEFAULT_IMAGES.SERVICE)">
                  <span class="badge bg-dark bg-opacity-75 position-absolute bottom-0 end-0 m-2 rounded-pill px-2 py-1" style="font-size: 0.7rem;">
                    Đơn vị: {{ svc.unit }}
                  </span>
                </div>

                <div class="card-body d-flex flex-column p-3">
                  <div class="flex-grow-1">
                    <h6 class="fw-bold text-body-emphasis mb-1 font-serif text-truncate" style="font-size: 1.02rem;" :title="svc.name">
                      {{ svc.name }}
                    </h6>
                    <p class="text-body-secondary mb-0 line-clamp-2" style="font-size: 0.8rem; line-height: 1.45;" :title="svc.description">
                      {{ svc.description || 'Đang cập nhật chi tiết dịch vụ.' }}
                    </p>
                  </div>
                  
                  <div class="mt-2 pt-2 border-top border-secondary-subtle d-flex justify-content-between align-items-center">
                    <span v-if="svc.basePrice > 0" class="fw-bold text-danger" style="font-size: 0.95rem; letter-spacing: -0.5px;">
                      {{ formatPrice(svc.basePrice) }}<small class="text-body-secondary fw-normal ms-1" style="font-size: 0.75rem;">/{{ svc.unit }}</small>
                    </span>
                    <span v-else class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-bold text-uppercase" style="font-size: 0.7rem;">
                      Miễn phí
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Trống -->
            <div v-if="filteredServices.length === 0" class="col-12 text-center py-5 text-body-secondary bg-body rounded-4 shadow-sm">
              <i class="fas fa-concierge-bell fs-2 opacity-50 mb-2 mt-2"></i>
              <h6 class="fw-bold font-serif">Không tìm thấy dịch vụ phù hợp</h6>
              <p class="small mb-2">Vui lòng thử lại với từ khóa khác.</p>
            </div>
          </div>
        </div>

        <!-- CỘT PHẢI (3 CỘT): HƯỚNG DẪN ĐẶT DỊCH VỤ -->
        <div class="col-lg-3">
          <div class="sticky-top" style="top: 95px; z-index: 10;">
            <div class="card border-0 shadow-sm rounded-4 bg-body">
              <div class="card-body p-3 p-xl-4">
                <h6 class="fw-bold text-body-emphasis mb-3 font-serif text-uppercase border-bottom pb-2">
                  <i class="fas fa-info-circle me-2 text-primary"></i>Hướng dẫn gọi món
                </h6>
                
                <ul class="list-unstyled text-body-secondary small mb-0">
                  <li class="mb-3 d-flex align-items-start">
                    <div class="bg-body-tertiary border border-secondary-subtle rounded-circle p-2 me-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width: 32px; height: 32px;">
                      <i class="fas fa-phone-alt text-primary" style="font-size: 0.8rem;"></i>
                    </div>
                    <div>
                      <strong class="d-block text-body-emphasis">Bước 1: Liên hệ Lễ tân</strong>
                      Nhấc điện thoại bàn trong phòng và bấm phím <strong class="text-primary">0</strong>.
                    </div>
                  </li>
                  <li class="mb-3 d-flex align-items-start">
                    <div class="bg-body-tertiary border border-secondary-subtle rounded-circle p-2 me-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width: 32px; height: 32px;">
                      <i class="fas fa-concierge-bell text-warning" style="font-size: 0.8rem;"></i>
                    </div>
                    <div>
                      <strong class="d-block text-body-emphasis">Bước 2: Yêu cầu Dịch vụ</strong>
                      Đọc tên dịch vụ và số lượng bạn mong muốn cho nhân viên.
                    </div>
                  </li>
                  <li class="mb-3 d-flex align-items-start">
                    <div class="bg-body-tertiary border border-secondary-subtle rounded-circle p-2 me-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width: 32px; height: 32px;">
                      <i class="fas fa-door-open text-success" style="font-size: 0.8rem;"></i>
                    </div>
                    <div>
                      <strong class="d-block text-body-emphasis">Bước 3: Nhận tại phòng</strong>
                      Nhân viên sẽ chuẩn bị và mang đến tận phòng trong ít phút.
                    </div>
                  </li>
                  <li class="d-flex align-items-start">
                    <div class="bg-body-tertiary border border-secondary-subtle rounded-circle p-2 me-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width: 32px; height: 32px;">
                      <i class="fas fa-file-invoice-dollar text-danger" style="font-size: 0.8rem;"></i>
                    </div>
                    <div>
                      <strong class="d-block text-body-emphasis">Thanh toán khi Check-out</strong>
                      Chi phí tự động cộng vào hóa đơn phòng và tất toán khi trả phòng.
                    </div>
                  </li>
                </ul>
                
                <hr class="my-3 border-secondary-subtle">
                <div class="text-center small">
                  <span class="fw-semibold text-body-emphasis font-serif">Hotline hỗ trợ 24/7: </span>
                  <strong class="text-primary">0901 000 001</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../utils/axios'
import { formatPrice, resolveImageUrl, handleImageError, DEFAULT_IMAGES } from '../../utils/formatters'

const services = ref([])
const isLoading = ref(true)
const searchQuery = ref('')

const filteredServices = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return services.value
  return services.value.filter(s =>
    (s.name || '').toLowerCase().includes(q) ||
    (s.description || '').toLowerCase().includes(q)
  )
})

const fetchServices = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/public/services')
    services.value = res.data || []
  } catch (error) {
    console.error('Lỗi tải dịch vụ:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchServices()
})
</script>

<style scoped>
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
.font-serif {
  font-family: 'Playfair Display', serif !important;
}
.tracking-wider {
  letter-spacing: 1.5px;
}
.service-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.service-img {
  transition: transform 0.4s ease;
}
.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.1) !important;
}
.service-card:hover .service-img {
  transform: scale(1.04);
}
[data-bs-theme="dark"] .service-card:hover {
  box-shadow: 0 10px 24px rgba(0,0,0,0.45) !important;
}
.object-fit-cover {
  object-fit: cover;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>