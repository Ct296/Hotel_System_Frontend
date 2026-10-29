<template>
  <div class="bg-light min-vh-100 pb-5">
    <!-- Banner -->
    <div class="bg-primary text-white py-5 text-center shadow-sm">
      <div class="container py-4">
        <h1 class="fw-bold text-uppercase mb-3">Dịch vụ & Tiện ích</h1>
        <p class="lead mb-0 opacity-75">Nâng tầm trải nghiệm nghỉ dưỡng của bạn tại IT Hotel</p>
      </div>
    </div>

    <div class="container mt-5">
      <div class="row g-4">
        
        <!-- CỘT TRÁI: DANH SÁCH DỊCH VỤ -->
        <div class="col-lg-8">
          <!-- Loading -->
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted fw-semibold">Đang tải danh sách dịch vụ...</p>
          </div>

          <!-- Danh sách Dịch vụ -->
          <div v-else class="row g-3">
            <div v-for="(svc, index) in services" :key="index" class="col-md-6">
              <div class="card h-100 border-0 shadow-sm service-card overflow-hidden">
                <!-- Sử dụng imagePath theo đúng định dạng Entity của Backend -->
                <img :src="getImageUrl(svc.imagePath)" class="card-img-top object-fit-cover" style="height: 180px;" alt="Service Image" @error="handleImageError">
                <div class="card-body d-flex flex-column p-3">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="fw-bold text-dark mb-0">{{ svc.name }}</h6>
                    <!-- Sử dụng basePrice theo đúng định dạng Entity của Backend -->
                    <span v-if="svc.basePrice > 0" class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                      {{ formatPrice(svc.basePrice) }}
                    </span>
                    <span v-else class="badge bg-info-subtle text-info border border-info-subtle px-2 py-1">Miễn phí</span>
                  </div>
                  <p class="text-muted small flex-grow-1 mb-0">{{ svc.description }}</p>
                </div>
              </div>
            </div>

            <!-- Trống -->
            <div v-if="services.length === 0" class="col-12 text-center py-5 text-muted bg-white rounded-4 shadow-sm">
              <i class="fas fa-concierge-bell fs-1 text-secondary mb-3 mt-3"></i>
              <h5 class="fw-semibold">Đang cập nhật dịch vụ</h5>
              <p class="mb-3">Danh sách dịch vụ đang được chúng tôi chuẩn bị và sẽ sớm ra mắt.</p>
            </div>
          </div>
        </div>

        <!-- CỘT PHẢI: HƯỚNG DẪN GỌI DỊCH VỤ -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 sticky-top" style="top: 90px;">
            <div class="card-body p-4">
              <h5 class="fw-bold text-primary mb-4"><i class="fas fa-info-circle me-2"></i>Hướng dẫn gọi dịch vụ</h5>
              <ul class="list-unstyled text-muted small">
                <li class="mb-3 d-flex align-items-start">
                  <div class="bg-success bg-opacity-10 text-success rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;">
                    <i class="fas fa-phone-alt"></i>
                  </div>
                  <div>
                    <strong class="d-block text-dark">Bước 1: Liên hệ Lễ tân</strong>
                    Sử dụng điện thoại bàn trong phòng, nhấc máy và bấm số <strong>0</strong>.
                  </div>
                </li>
                <li class="mb-3 d-flex align-items-start">
                  <div class="bg-warning bg-opacity-10 text-warning rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;">
                    <i class="fas fa-concierge-bell"></i>
                  </div>
                  <div>
                    <strong class="d-block text-dark">Bước 2: Yêu cầu dịch vụ</strong>
                    Đọc tên dịch vụ và số lượng bạn mong muốn cho nhân viên.
                  </div>
                </li>
                <li class="mb-3 d-flex align-items-start">
                  <div class="bg-info bg-opacity-10 text-info rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;">
                    <i class="fas fa-door-open"></i>
                  </div>
                  <div>
                    <strong class="d-block text-dark">Bước 3: Nhận tại phòng</strong>
                    Nhân viên sẽ chuẩn bị và mang đến tận phòng cho bạn trong ít phút.
                  </div>
                </li>
                <li class="d-flex align-items-start">
                  <div class="bg-danger bg-opacity-10 text-danger rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;">
                    <i class="fas fa-file-invoice-dollar"></i>
                  </div>
                  <div>
                    <strong class="d-block text-dark">Thanh toán tiện lợi</strong>
                    Chi phí sẽ được cộng dồn vào hóa đơn phòng và thanh toán một lần khi Check-out.
                  </div>
                </li>
              </ul>
              <hr class="my-4 border-light">
              <div class="text-center">
                <p class="mb-0 fw-semibold text-dark">Chúc quý khách có kỳ nghỉ tuyệt vời!</p>
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

// Cấu hình URL lấy ảnh mặc định từ Backend
const backendBaseUrl = 'https://api.ct296.id.vn'
const defaultServiceImage = `${backendBaseUrl}/image/default_service.jpg`

const getImageUrl = (path) => {
  if (!path) return defaultServiceImage
  return path.startsWith('http') ? path : `${backendBaseUrl}${path}`
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
.service-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
}
.object-fit-cover {
  object-fit: cover;
}
</style>