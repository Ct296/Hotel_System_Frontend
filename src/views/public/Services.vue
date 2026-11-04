<template>
  <div class="bg-body-tertiary min-vh-100 pb-5">
    <!-- Banner -->
    <div class="bg-primary text-white py-5 text-center shadow-sm" style="background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);">
      <div class="container py-4">
        <h1 class="fw-bold text-uppercase mb-3 font-serif">Dịch vụ & Tiện ích</h1>
        <p class="lead mb-0 opacity-75">Nâng tầm trải nghiệm nghỉ dưỡng của bạn tại IT Hotel</p>
      </div>
    </div>

    <div class="container mt-5">
      <div class="row g-4">
        
        <!-- CỘT TRÁI: DANH SÁCH DỊCH VỤ -->
        <div class="col-lg-8">
          <!-- Loading -->
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-dark" role="status"></div>
            <p class="mt-3 text-body-secondary fw-bold tracking-wider text-uppercase small">Đang tải danh sách dịch vụ...</p>
          </div>

          <!-- Danh sách Dịch vụ -->
          <div v-else class="row g-3">
            <div v-for="(svc, index) in services" :key="index" class="col-md-6">
              <div class="card h-100 border-0 shadow-sm service-card overflow-hidden bg-body">
                <img :src="getImageUrl(svc.imagePath)" class="card-img-top object-fit-cover" style="height: 200px;" alt="Service Image" @error="handleImageError">
                <div class="card-body d-flex flex-column p-4">
                  <!-- KHỐI CHỨA NỘI DUNG FLEX-GROW -->
                  <div class="flex-grow-1">
                    <h5 class="fw-bold text-body-emphasis mb-2 font-serif fs-4">{{ svc.name }}</h5>
                    <!-- Đã gỡ flex-grow-1 ở thẻ <p> này -->
                    <p class="text-body-secondary small mb-0">{{ svc.description || 'Đang cập nhật chi tiết dịch vụ.' }}</p>
                  </div>
                  
                  <div class="mt-3 pt-3 border-top border-secondary-subtle d-flex justify-content-between align-items-center">
                    <span v-if="svc.basePrice > 0" class="fw-bold text-danger fs-5" style="letter-spacing: -1px;">
                      {{ formatPrice(svc.basePrice) }}<small class="text-body-secondary fw-normal fs-6 ms-1">/ {{ svc.unit }}</small>
                    </span>
                    <span v-else class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-bold text-uppercase tracking-wider">Miễn phí</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Trống -->
            <div v-if="services.length === 0" class="col-12 text-center py-5 text-body-secondary bg-body rounded-4 shadow-sm">
              <i class="fas fa-concierge-bell fs-1 opacity-50 mb-3 mt-3"></i>
              <h5 class="fw-bold font-serif">Đang cập nhật dịch vụ</h5>
              <p class="mb-3">Danh sách dịch vụ đang được chúng tôi chuẩn bị ra mắt.</p>
            </div>
          </div>
        </div>

        <!-- CỘT PHẢI: HƯỚNG DẪN DỊCH VỤ -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 sticky-top bg-body" style="top: 90px;">
            <div class="card-body p-4">
              <h5 class="fw-bold text-body-emphasis mb-4 font-serif text-uppercase"><i class="fas fa-info-circle me-2 text-primary"></i>Hướng dẫn</h5>
              
              <ul class="list-unstyled text-body-secondary small">
                <li class="mb-3 d-flex align-items-start">
                  <div class="bg-body-tertiary border border-secondary-subtle rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;">
                    <i class="fas fa-phone-alt text-secondary"></i>
                  </div>
                  <div>
                    <strong class="d-block text-body-emphasis">Bước 1: Liên hệ Lễ tân</strong>
                    Sử dụng điện thoại bàn trong phòng, nhấc máy và bấm số <strong class="text-primary">0</strong>.
                  </div>
                </li>
                <li class="mb-3 d-flex align-items-start">
                  <div class="bg-body-tertiary border border-secondary-subtle rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;">
                    <i class="fas fa-concierge-bell text-secondary"></i>
                  </div>
                  <div>
                    <strong class="d-block text-body-emphasis">Bước 2: Yêu cầu Dịch vụ</strong>
                    Đọc tên dịch vụ và số lượng bạn mong muốn cho nhân viên.
                  </div>
                </li>
                <li class="mb-3 d-flex align-items-start">
                  <div class="bg-body-tertiary border border-secondary-subtle rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;">
                    <i class="fas fa-door-open text-secondary"></i>
                  </div>
                  <div>
                    <strong class="d-block text-body-emphasis">Bước 3: Nhận tại phòng</strong>
                    Nhân viên sẽ chuẩn bị và mang đến tận phòng cho bạn trong ít phút.
                  </div>
                </li>
                <li class="d-flex align-items-start">
                  <div class="bg-body-tertiary border border-secondary-subtle rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;">
                    <i class="fas fa-file-invoice-dollar text-secondary"></i>
                  </div>
                  <div>
                    <strong class="d-block text-body-emphasis">Thanh toán tiện lợi</strong>
                    Chi phí sẽ được cộng dồn vào hóa đơn phòng và thanh toán một lần khi Check-out.
                  </div>
                </li>
              </ul>
              
              <hr class="my-4 border-secondary-subtle">
              <div class="text-center">
                <p class="mb-0 fw-semibold text-body-emphasis font-serif fs-6">Chúc quý khách có kỳ nghỉ tuyệt vời!</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../utils/axios'

const services = ref([])
const isLoading = ref(true)

// Sử dụng link ảnh mặc định từ Backend cho dịch vụ
const defaultServiceImage = 'https://api.ct296.id.vn/image/default_service.jpg'

const getImageUrl = (path) => {
  if (!path) return defaultServiceImage
  return path.startsWith('http') ? path : `https://api.ct296.id.vn${path}`
}
const handleImageError = (e) => {
  e.target.src = defaultServiceImage
}

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0) + ' đ'

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
.font-serif {
  font-family: 'Playfair Display', serif;
}

.tracking-wider {
  letter-spacing: 1.5px;
}

.service-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
}
[data-bs-theme="dark"] .service-card:hover {
  box-shadow: 0 15px 30px rgba(0,0,0,0.5) !important;
}
.object-fit-cover {
  object-fit: cover;
}
</style>