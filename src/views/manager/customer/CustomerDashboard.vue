<template>
  <div class="position-relative pb-4">
    <h3 class="fw-bold text-body-emphasis mb-4">Tổng quan Khách hàng & Đánh giá</h3>
    
    <!-- KPI -->
    <div class="row g-3 mb-4">
      <div class="col-md-3"><div class="card border-0 shadow-sm bg-primary text-white h-100 rounded-4"><div class="card-body"><h6 class="text-uppercase mb-2 opacity-75 small fw-bold">Tổng Khách Hàng</h6><h3 class="mb-0 fw-bold">{{ dashboardData.customerCount || 0 }} <i class="fas fa-users float-end opacity-50"></i></h3></div></div></div>
      <div class="col-md-3"><div class="card border-0 shadow-sm bg-success text-white h-100 rounded-4"><div class="card-body"><h6 class="text-uppercase mb-2 opacity-75 small fw-bold">Hạng Thẻ Đã Cấu Hình</h6><h3 class="mb-0 fw-bold">{{ dashboardData.tierCustomerCount || 0 }} <i class="fas fa-medal float-end opacity-50"></i></h3></div></div></div>
      <div class="col-md-3"><div class="card border-0 shadow-sm bg-warning text-dark h-100 rounded-4"><div class="card-body"><h6 class="text-uppercase mb-2 opacity-75 small fw-bold">Thành Viên Active</h6><h3 class="mb-0 fw-bold">{{ dashboardData.activeMemberCount || 0 }} <i class="fas fa-id-card float-end opacity-50"></i></h3></div></div></div>
      <div class="col-md-3"><div class="card border-0 shadow-sm bg-danger text-white h-100 rounded-4"><div class="card-body"><h6 class="text-uppercase mb-2 opacity-75 small fw-bold">Điểm Đánh Giá TB</h6><h3 class="mb-0 fw-bold">{{ dashboardData.averageReviewRate || 0 }} <i class="fas fa-star float-end opacity-50"></i></h3></div></div></div>
    </div>

    <!-- AI CHARTS -->
    <div class="row g-4 mb-4">
      <!-- Biểu đồ tròn -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-0 pt-4 pb-0"><h6 class="fw-bold text-body-emphasis"><i class="fas fa-chart-pie text-primary me-2"></i>Tỷ lệ Hài lòng Tổng thể</h6></div>
          <div class="card-body d-flex justify-content-center align-items-center">
            <div style="width: 100%; height: 250px;" v-if="pieChartData"><Pie :data="pieChartData" :options="pieOptions" /></div>
            <div v-else class="text-body-secondary">Chưa có dữ liệu</div>
          </div>
        </div>
      </div>
      
      <!-- Biểu đồ cột -->
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h6 class="fw-bold text-body-emphasis"><i class="fas fa-chart-bar text-warning me-2"></i>Chi tiết Tích cực / Tiêu cực</h6>
            <button @click="exportAiAnalysis" class="btn btn-sm btn-outline-primary fw-bold" :disabled="isExporting">
              <span v-if="isExporting" class="spinner-border spinner-border-sm me-1"></span> Cập nhật Dữ liệu
            </button>
          </div>
          <div class="card-body">
            <div style="height: 250px;" v-if="barChartData"><Bar :data="barChartData" :options="barOptions" /></div>
            <div v-else class="text-body-secondary text-center mt-5">Chưa có dữ liệu</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '../../../utils/axios'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js'
import { Pie, Bar } from 'vue-chartjs'
import { useThemeStore } from '../../../stores/themeStore'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const dashboardData = ref({})
const isExporting = ref(false)
const themeStore = useThemeStore()

// --- Hỗ trợ Dark Mode cho Chart.js ---
const getChartTextColor = computed(() => themeStore.isDarkMode ? '#e9ecef' : '#212529')
const getGridColor = computed(() => themeStore.isDarkMode ? '#495057' : '#e9ecef')

const fetchDashboard = async () => {
  try {
    const res = await api.get('/api/manager/customer/dashboard')
    dashboardData.value = res.data
  } catch (error) { console.error(error) }
}

const exportAiAnalysis = async () => {
  isExporting.value = true
  try {
    await api.post('/api/manager/customer/ai/export')
    fetchDashboard()
  } catch (error) { console.error(error) } finally { isExporting.value = false }
}

// Cấu hình Biểu đồ Tròn (Pie)
const pieChartData = computed(() => {
  const summary = dashboardData.value.aiSummary
  if (!summary) return null
  return {
    labels: ['Tích cực', 'Tiêu cực', 'Trung tính'],
    datasets: [{ backgroundColor: ['#198754', '#dc3545', '#6c757d'], data: [summary.positiveCount, summary.negativeCount, summary.neutralCount] }]
  }
})
const pieOptions = ref({
  responsive: true, maintainAspectRatio: false, 
  plugins: { legend: { position: 'bottom', labels: { color: getChartTextColor.value } } }
})

// Cấu hình Biểu đồ Cột (Bar)
const barChartData = computed(() => {
  const summary = dashboardData.value.aiSummary
  if (!summary) return null
  const pos = summary.positiveAspectSummary || {}; const neg = summary.negativeAspectSummary || {}
  const labels = Array.from(new Set([...Object.keys(pos), ...Object.keys(neg)]))
  return {
    labels: labels.map(l => l.replace('#', ' - ')),
    datasets: [
      { label: 'Khen (Tích cực)', backgroundColor: '#198754', borderRadius: 4, data: labels.map(l => pos[l] || 0) },
      { label: 'Chê (Tiêu cực)', backgroundColor: '#dc3545', borderRadius: 4, data: labels.map(l => neg[l] || 0) }
    ]
  }
})
const barOptions = ref({ 
  responsive: true, maintainAspectRatio: false, 
  plugins: { legend: { labels: { color: getChartTextColor.value } } },
  scales: { 
    x: { ticks: { color: getChartTextColor.value }, grid: { color: getGridColor.value } },
    y: { beginAtZero: true, ticks: { color: getChartTextColor.value }, grid: { color: getGridColor.value } } 
  } 
})

// Cập nhật lại màu Chart khi Theme thay đổi
watch(() => themeStore.isDarkMode, () => {
  pieOptions.value = { ...pieOptions.value, plugins: { legend: { position: 'bottom', labels: { color: getChartTextColor.value } } } }
  barOptions.value = { ...barOptions.value, plugins: { legend: { labels: { color: getChartTextColor.value } } }, scales: { x: { ticks: { color: getChartTextColor.value }, grid: { color: getGridColor.value } }, y: { beginAtZero: true, ticks: { color: getChartTextColor.value }, grid: { color: getGridColor.value } } } }
})

onMounted(() => fetchDashboard())
</script>