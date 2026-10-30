<template>
  <div class="bg-body-tertiary min-vh-100 pb-5">
    <!-- Header Banner -->
    <div class="bg-primary text-white py-5" style="background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);">
      <div class="container py-4 text-center">
        <h1 class="fw-bold mb-3">Đánh giá từ Khách hàng</h1>
        <p class="lead mb-0 opacity-75">Trải nghiệm thực tế của quý khách là thước đo thành công của ITHotel.</p>
      </div>
    </div>

    <div class="container my-5">
      <!-- Thông báo -->
      <div v-if="notification.message" :class="`alert alert-${notification.type} shadow-sm fw-bold alert-dismissible fade show text-center`">
        <i :class="notification.type === 'success' ? 'fas fa-check-circle me-1' : 'fas fa-exclamation-triangle me-1'"></i>
        {{ notification.message }}
        <button type="button" class="btn-close" @click="notification.message = ''"></button>
      </div>

      <div class="row g-4">
        <!-- CỘT TRÁI: FORM ĐÁNH GIÁ CỦA USER -->
        <div class="col-lg-4">
          <div class="sticky-top" style="top: 100px; z-index: 10;">
            <div class="card border-0 shadow-sm rounded-4 bg-body">
              <div class="card-body p-4">
                <!-- TH 1: Chưa đăng nhập -->
                <div v-if="!authStore.isAuthenticated" class="text-center py-3">
                  <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                    <i class="fas fa-lock fs-4"></i>
                  </div>
                  <h5 class="fw-bold text-body-emphasis mb-2">Bạn đã từng lưu trú?</h5>
                  <p class="text-body-secondary small mb-4">Vui lòng đăng nhập để chia sẻ trải nghiệm của bạn với chúng tôi.</p>
                  <router-link to="/login" class="btn btn-primary w-100 fw-bold rounded-pill shadow-sm">Đăng nhập ngay</router-link>
                </div>

                <!-- TH 2: Đã đăng nhập nhưng không phải là Khách hàng (VD: Admin/Staff) -->
                <div v-else-if="authStore.role !== 'CUSTOMER'" class="text-center py-3">
                  <i class="fas fa-info-circle text-body-secondary fs-1 mb-3"></i>
                  <h6 class="fw-bold text-body-emphasis">Tính năng dành cho Khách hàng</h6>
                  <p class="text-body-secondary small mb-0">Tài khoản nhân viên không thể gửi đánh giá.</p>
                </div>

                <!-- TH 3: Khách hàng (Đã có đánh giá hoặc chưa có đánh giá) -->
                <div v-else>
                  <h5 class="fw-bold text-body-emphasis mb-3 border-bottom border-secondary-subtle pb-2">
                    <i class="fas fa-pen-nib text-primary me-2"></i> 
                    {{ hasMyReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá' }}
                  </h5>
                  <form @submit.prevent="submitFeedback">
                    <div class="mb-3 text-center">
                      <label class="form-label fw-bold text-body-secondary small d-block">Trải nghiệm của bạn</label>
                      <div class="d-inline-flex gap-2 fs-3 cursor-pointer text-warning">
                        <i v-for="n in 5" :key="n" 
                           class="fas fa-star transition-all" 
                           :class="n <= reviewForm.rate ? 'text-warning' : 'text-secondary opacity-25'"
                           @click="reviewForm.rate = n"
                           @mouseenter="hoverRate = n"
                           @mouseleave="hoverRate = 0"
                           :style="n <= hoverRate ? 'transform: scale(1.2)' : ''">
                        </i>
                      </div>
                    </div>
                    
                    <div class="mb-4">
                      <label class="form-label fw-bold text-body-secondary small">Nội dung đánh giá</label>
                      <textarea v-model="reviewForm.description" class="form-control bg-body-tertiary border-secondary-subtle" rows="4" required placeholder="Chia sẻ cảm nhận của bạn về phòng nghỉ, dịch vụ..."></textarea>
                    </div>
                    
                    <button type="submit" class="btn w-100 fw-bold rounded-pill shadow-sm" 
                            :class="hasMyReview ? 'btn-primary' : 'btn-success'" 
                            :disabled="isSubmitting || reviewForm.rate === 0">
                      <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                      <i v-else :class="hasMyReview ? 'fas fa-save me-2' : 'fas fa-paper-plane me-2'"></i> 
                      {{ hasMyReview ? 'Lưu thay đổi' : 'Gửi đánh giá' }}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CỘT PHẢI: DANH SÁCH ĐÁNH GIÁ TỪ SERVER -->
        <div class="col-lg-8">
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-body-secondary fw-semibold">Đang tải đánh giá...</p>
          </div>
          
          <div v-else-if="reviews.length === 0" class="card border-0 shadow-sm rounded-4 bg-body text-center py-5">
            <div class="card-body">
              <i class="fas fa-comments fs-1 text-body-secondary opacity-50 mb-3"></i>
              <h5 class="fw-bold text-body-emphasis">Chưa có đánh giá nào</h5>
              <p class="text-body-secondary mb-0">Hãy là người đầu tiên chia sẻ trải nghiệm tại ITHotel.</p>
            </div>
          </div>

          <div v-else class="row g-3">
            <div v-for="review in reviews" :key="review.id" class="col-12">
              <div class="card border-0 shadow-sm rounded-4 bg-body review-card">
                <div class="card-body p-4">
                  <div class="d-flex align-items-center mb-3">
                    <img :src="getImageUrl(review.customer?.user?.avatar)" 
                         class="rounded-circle border border-2 border-secondary-subtle object-fit-cover me-3" 
                         style="width: 50px; height: 50px;" 
                         @error="handleImageError" alt="Avatar">
                    <div>
                      <h6 class="fw-bold text-body-emphasis mb-1">
                        {{ review.customer?.user?.lastName }} {{ review.customer?.user?.firstName }}
                      </h6>
                      <div class="text-warning small">
                        <i v-for="n in 5" :key="n" class="fas fa-star" :class="n <= review.rate ? '' : 'text-secondary opacity-25'"></i>
                        <span class="text-body-secondary ms-2 opacity-75" style="font-size: 0.8rem;">{{ formatDate(review.updateDate) }}</span>
                      </div>
                    </div>
                  </div>
                  <p class="text-body-secondary mb-0" style="line-height: 1.6;">
                    "{{ review.description }}"
                  </p>
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
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import api from '../../utils/axios'

const authStore = useAuthStore()
const reviews = ref([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const notification = ref({ type: '', message: '' })

// State cho Form
const hoverRate = ref(0)
const hasMyReview = ref(false)
const reviewForm = ref({
  rate: 0,
  description: ''
})

const backendBaseUrl = 'https://api.ct296.id.vn'
const defaultAvatar = `${backendBaseUrl}/image/default_avatar_customer.jpg`

const getImageUrl = (path) => {
  if (!path || path.trim() === '') return defaultAvatar
  return path.startsWith('http') ? path : `${backendBaseUrl}${path}`
}

const handleImageError = (e) => {
  e.target.src = defaultAvatar
}

const showNotification = (type, message) => {
  notification.value = { type, message }
  setTimeout(() => notification.value.message = '', 5000)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const fetchReviews = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/public/feedback')
    reviews.value = res.data || []
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đánh giá:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchMyReview = async () => {
  if (!authStore.isAuthenticated || authStore.role !== 'CUSTOMER') return
  try {
    const res = await api.get('/api/customer/feedback/my')
    if (res.data.myReview && res.data.myReview !== "") {
      hasMyReview.value = true
      reviewForm.value.rate = res.data.myReview.rate
      reviewForm.value.description = res.data.myReview.description
    }
  } catch (error) {
    console.error('Lỗi khi lấy đánh giá cá nhân:', error)
  }
}

const submitFeedback = async () => {
  if (reviewForm.value.rate === 0) {
    return showNotification('danger', 'Vui lòng chọn số sao đánh giá.')
  }
  isSubmitting.value = true
  try {
    if (hasMyReview.value) {
      await api.put('/api/customer/feedback', reviewForm.value)
      showNotification('success', 'Đã cập nhật đánh giá thành công.')
    } else {
      await api.post('/api/customer/feedback', reviewForm.value)
      showNotification('success', 'Cảm ơn bạn đã gửi đánh giá.')
      hasMyReview.value = true
    }
    // Load lại danh sách bài đánh giá
    fetchReviews()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Không thể gửi đánh giá lúc này.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchReviews()
  fetchMyReview()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.transition-all {
  transition: all 0.2s ease-in-out;
}
.object-fit-cover {
  object-fit: cover;
}
.review-card {
  transition: transform 0.2s ease;
}
.review-card:hover {
  transform: translateX(5px);
}
</style>