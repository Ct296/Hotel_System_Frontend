<template>
  <div>
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    
    <div v-else>
      <!-- HÀNG 1: 4 THẺ KPI -->
      <div class="row g-4 mb-4">
        <div class="col-lg-3 col-sm-6">
          <div class="card border-0 shadow-sm rounded-4 h-100 bg-warning text-dark">
            <div class="card-body p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-uppercase mb-1 fw-bold opacity-75">Booking chờ cọc</h6>
                <h2 class="fw-bold mb-0">{{ overviewData.pendingBookingCount || 0 }}</h2>
              </div>
              <div class="fs-1 opacity-50"><i class="fas fa-hourglass-half"></i></div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-sm-6">
          <div class="card border-0 shadow-sm rounded-4 h-100 bg-primary text-white">
            <div class="card-body p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-uppercase mb-1 fw-bold opacity-75">Khách đến hôm nay</h6>
                <h2 class="fw-bold mb-0">{{ overviewData.todayArrivalsCount || 0 }}</h2>
              </div>
              <div class="fs-1 opacity-50"><i class="fas fa-door-open"></i></div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-sm-6">
          <div class="card border-0 shadow-sm rounded-4 h-100 bg-success text-white">
            <div class="card-body p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-uppercase mb-1 fw-bold opacity-75">Đang lưu trú</h6>
                <h2 class="fw-bold mb-0">{{ overviewData.checkedInCount || 0 }}</h2>
              </div>
              <div class="fs-1 opacity-50"><i class="fas fa-bed"></i></div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-sm-6">
          <div class="card border-0 shadow-sm rounded-4 h-100 bg-danger text-white">
            <div class="card-body p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-uppercase mb-1 fw-bold opacity-75">Phòng cần dọn</h6>
                <h2 class="fw-bold mb-0">{{ overviewData.checkedOutCount || 0 }}</h2>
              </div>
              <div class="fs-1 opacity-50"><i class="fas fa-broom"></i></div>
            </div>
          </div>
        </div>
      </div>

      <!-- HÀNG 2: BIỂU ĐỒ & BẢNG KHÁCH ĐẾN -->
      <div class="row g-4">
        <!-- Biểu đồ -->
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h6 class="fw-bold"><i class="fas fa-chart-pie text-primary me-2"></i>Trạng thái phòng hiện tại</h6>
            </div>
            <div class="card-body d-flex justify-content-center align-items-center p-4">
              <div style="width: 250px; height: 250px;" v-if="chartData">
                <Doughnut :data="chartData" :options="chartOptions" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Bảng danh sách khách chuẩn bị đến -->
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between">
              <h6 class="fw-bold"><i class="fas fa-user-clock text-warning me-2"></i>Khách chuẩn bị Check-in hôm nay</h6>
              <router-link to="/employee/staff/bookings" class="btn btn-sm btn-outline-primary">Xem tất cả</router-link>
            </div>
            <div class="card-body p-4">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr><th>Khách hàng</th><th>Phòng</th><th class="text-end">Giờ nhận</th></tr>
                  </thead>
                  <tbody>
                    <tr v-if="!overviewData.todayArrivalsList || overviewData.todayArrivalsList.length === 0">
                      <td colspan="3" class="text-center text-muted py-3">Không có lịch khách đến.</td>
                    </tr>
                    <tr v-else v-for="a in overviewData.todayArrivalsList.slice(0, 5)" :key="a.id">
                      <td class="fw-semibold">{{ a.customer?.user?.lastName }} {{ a.customer?.user?.firstName }}</td>
                      <td><span class="badge bg-secondary">{{ a.rentalDetails[0]?.room?.name }}</span></td>
                      <td class="text-end fw-bold text-primary">{{ formatTime(a.rentalDetails[0]?.checkinDate) }}</td>
                    </tr>
                  </tbody>
                </table>
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
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const overviewData = ref({})
const isLoading = ref(true)

const formatTime = (val) => val ? new Date(val).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''

const chartData = computed(() => {
  if (!overviewData.value.roomStatusCounts) return null
  return {
    labels: ['Trống', 'Đang ở', 'Đang dọn', 'Bảo trì'],
    datasets: [{
      backgroundColor: ['#198754', '#ffc107', '#0dcaf0', '#dc3545'],
      data: overviewData.value.roomStatusCounts
    }]
  }
})

const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }

const fetchOverview = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/staff/overview')
    overviewData.value = res.data
  } catch (error) { console.error('Lỗi tải tổng quan:', error) } 
  finally { isLoading.value = false }
}

onMounted(() => fetchOverview())
</script>