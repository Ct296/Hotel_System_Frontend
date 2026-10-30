<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div v-if="errorMsg" class="alert alert-danger shadow-sm text-center fw-bold">
          <i class="fas fa-exclamation-triangle me-2"></i> {{ errorMsg }}
        </div>

        <div v-else class="card shadow-sm border-0 rounded-4 p-4 p-md-5 bg-body-tertiary">
          <div class="text-center mb-4">
            <div class="bg-primary bg-opacity-25 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
              <i class="fas fa-credit-card fa-2x"></i>
            </div>
            <h3 class="fw-bold text-body-emphasis">Thanh toán cọc Booking</h3>
            <p class="text-body-secondary fs-5">Mã đơn: <strong class="text-primary">{{ rentalId }}</strong></p>
            
            <div class="alert alert-warning text-dark py-2 small fw-semibold mt-3">
              <i class="fas fa-clock me-1"></i> Vui lòng hoàn tất thanh toán trong vòng 30 phút để giữ phòng.
            </div>
          </div>

          <div class="mb-4 text-center">
            <p class="text-body-secondary small">Hệ thống sẽ chuyển hướng bạn đến cổng thanh toán VNPay an toàn để tiến hành đặt cọc.</p>
          </div>

          <button @click="payVnPay" class="btn btn-success w-100 py-3 fw-bold fs-5 rounded-3 shadow" :disabled="isProcessing">
            <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fas fa-wallet me-2"></i> THANH TOÁN QUA VNPAY
          </button>
          
          <div class="text-center mt-4">
            <router-link to="/customer/profile" class="text-decoration-none text-body-secondary small fw-semibold">
              <i class="fas fa-arrow-right me-1"></i> Thanh toán sau (Quản lý tại Trang cá nhân)
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../utils/axios'

const route = useRoute()
const rentalId = ref(route.query.rentalId || '')
const isProcessing = ref(false)
const errorMsg = ref('')

const payVnPay = async () => {
  if (!rentalId.value) return
  isProcessing.value = true
  errorMsg.value = ''
  try {
    const res = await api.post('/api/customer/booking/payment/vnpay', { rentalId: rentalId.value })
    window.location.href = res.data.paymentUrl
  } catch (error) {
    errorMsg.value = error.response?.data?.error || 'Lỗi khởi tạo thanh toán VNPay.'
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => {
  if (!rentalId.value) {
    errorMsg.value = 'Không tìm thấy mã đặt phòng hợp lệ.'
  }
})
</script>