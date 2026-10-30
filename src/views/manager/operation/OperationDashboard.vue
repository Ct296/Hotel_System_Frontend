<template>
  <div class="position-relative pb-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-body-emphasis mb-1">Tổng quan Vận hành</h3>
        <p class="text-body-secondary small mb-0">Theo dõi doanh thu 12 tháng và hoạt động trong ngày.</p>
      </div>
    </div>

    <!-- HÀNG 1: THẺ KPI BÁO CÁO NHANH -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-primary text-white">
          <div class="card-body p-4 d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-white-50 fw-semibold mb-1">TỶ LỆ LẤP ĐẦY</h6>
              <h3 class="fw-bold mb-0">{{ kpi.occupancyRate }}%</h3>
            </div>
            <div class="fs-1 text-white-50"><i class="fas fa-bed"></i></div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-success text-white">
          <div class="card-body p-4 d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-white-50 fw-semibold mb-1">DOANH THU HÔM NAY</h6>
              <h3 class="fw-bold mb-0">{{ formatPrice(kpi.todayRevenue) }}</h3>
            </div>
            <div class="fs-1 text-white-50"><i class="fas fa-hand-holding-usd"></i></div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-warning text-dark">
          <div class="card-body p-4 d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-dark-50 fw-semibold mb-1 opacity-75">CHECK-IN / OUT (NAY)</h6>
              <h3 class="fw-bold mb-0">{{ kpi.arrivals }} <span class="fs-5 opacity-50">/</span> {{ kpi.departures }}</h3>
            </div>
            <div class="fs-1 opacity-50"><i class="fas fa-exchange-alt"></i></div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-danger text-white">
          <div class="card-body p-4 d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-white-50 fw-semibold mb-1">PHÒNG BẢO TRÌ</h6>
              <h3 class="fw-bold mb-0">{{ kpi.maintenanceRooms }}</h3>
            </div>
            <div class="fs-1 text-white-50"><i class="fas fa-tools"></i></div>
          </div>
        </div>
      </div>
    </div>

    <!-- HÀNG 2: BÁO CÁO NHANH (Tròn + Danh sách Top 5) -->
    <div class="row g-4 mb-4">
      <!-- BIỂU ĐỒ TRÒN TRẠNG THÁI -->
      <div class="col-lg-5">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-0">
            <h6 class="fw-bold text-body-emphasis"><i class="fas fa-chart-pie text-primary me-2"></i>Trạng thái phòng hiện tại</h6>
          </div>
          <div class="card-body d-flex justify-content-center align-items-center p-4">
            <div style="width: 250px; height: 250px;">
              <Doughnut :data="roomStatusData" :options="pieOptions" />
            </div>
          </div>
        </div>
      </div>
      <!-- TOP 5 DỊCH VỤ -->
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-0">
            <h6 class="fw-bold text-body-emphasis"><i class="fas fa-concierge-bell text-warning me-2"></i>Top Dịch vụ bán chạy (Tháng)</h6>
          </div>
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-3" v-for="(svc, idx) in topServices" :key="idx">
              <div class="d-flex align-items-center">
                <div class="bg-body rounded text-center fw-bold me-3 border border-secondary-subtle text-body-emphasis" style="width: 35px; height: 35px; line-height: 35px;">#{{ idx + 1 }}</div>
                <div>
                  <h6 class="mb-0 fw-semibold text-body-emphasis">{{ svc.name }}</h6>
                  <small class="text-body-secondary">{{ svc.sold }} lượt sử dụng</small>
                </div>
              </div>
              <div class="fw-bold text-success">{{ formatPrice(svc.revenue) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- HÀNG 3: BIỂU ĐỒ 12 THÁNG (DOANH THU) -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h6 class="fw-bold mb-0 text-body-emphasis"><i class="fas fa-chart-bar text-success me-2"></i>Doanh thu 12 Tháng (VNĐ)</h6>
            <div class="d-flex gap-2">
              <select v-model="filterRevenueYear" class="form-select form-select-sm fw-bold border-success text-success bg-body" style="width: 120px;">
                <option v-for="year in availableYears" :key="year" :value="year">Năm {{ year }}</option>
              </select>
              <button @click="exportRevenueExcel" class="btn btn-sm btn-outline-success fw-bold" title="Xuất báo cáo doanh thu">
                <i class="fas fa-file-excel me-1"></i> Xuất Excel
              </button>
            </div>
          </div>
          <div class="card-body p-4">
            <div style="height: 300px;">
              <Bar :data="revenueChartData" :options="barOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- HÀNG 4: BIỂU ĐỒ 12 THÁNG (DỊCH VỤ) -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h6 class="fw-bold mb-0 text-body-emphasis"><i class="fas fa-chart-line text-primary me-2"></i>Số lượng sử dụng Dịch vụ (12 Tháng)</h6>
            <div class="d-flex gap-2 flex-wrap">
              <!-- Danh sách Dropdown Dịch Vụ Gọi Từ API -->
              <select v-model="filterServiceId" class="form-select form-select-sm fw-bold border-primary text-primary bg-body" style="width: 200px;">
                <option value="ALL">-- Tất cả dịch vụ --</option>
                <option v-for="svc in dbServicesList" :key="svc.id" :value="svc.id">{{ svc.name }}</option>
              </select>
              <select v-model="filterServiceYear" class="form-select form-select-sm fw-bold border-primary text-primary bg-body" style="width: 120px;">
                <option v-for="year in availableYears" :key="year" :value="year">Năm {{ year }}</option>
              </select>
              <button @click="exportServiceExcel" class="btn btn-sm btn-outline-primary fw-bold" title="Xuất dữ liệu dịch vụ">
                <i class="fas fa-file-excel me-1"></i> Xuất Excel
              </button>
            </div>
          </div>
          <div class="card-body p-4">
            <div style="height: 300px;">
              <Line :data="serviceChartData" :options="lineOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- HÀNG 5: BẢNG LỊCH TRÌNH -->
    <div class="row">
      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-0">
            <h6 class="fw-bold text-body-emphasis"><i class="fas fa-clipboard-list text-warning me-2"></i>Lịch trình nhận/trả phòng hôm nay</h6>
          </div>
          <div class="card-body p-0 mt-3">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-secondary">
                  <tr>
                    <th class="px-4 py-3">Khách hàng</th>
                    <th class="py-3">Phòng</th>
                    <th class="py-3">Loại</th>
                    <th class="py-3">Thời gian</th>
                    <th class="px-4 py-3 text-end">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="todayTasks.length === 0">
                    <td colspan="5" class="text-center py-4 text-body-secondary">Không có lịch trình nào hôm nay.</td>
                  </tr>
                  <tr v-else v-for="task in todayTasks" :key="task.id">
                    <td class="px-4 fw-semibold text-body-emphasis">{{ task.customerName }}</td>
                    <td class="fw-bold text-primary">{{ task.roomName }}</td>
                    <td>
                      <span :class="task.type === 'CHECK_IN' ? 'text-success' : 'text-danger'" class="fw-bold">
                        <i :class="task.type === 'CHECK_IN' ? 'fas fa-sign-in-alt' : 'fas fa-sign-out-alt'" class="me-1"></i>
                        {{ task.type === 'CHECK_IN' ? 'Check-in' : 'Check-out' }}
                      </span>
                    </td>
                    <td class="text-body-secondary">{{ task.time }}</td>
                    <td class="px-4 text-end">
                      <span class="badge bg-warning text-dark" v-if="task.status === 'PENDING'">Chờ xử lý</span>
                      <span class="badge bg-success" v-else>Hoàn tất</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../../utils/axios'
import * as XLSX from 'xlsx'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Filler } from 'chart.js'
import { Bar, Line, Doughnut } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Filler)

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price)

const kpi = ref({ occupancyRate: 0, todayRevenue: 0, arrivals: 0, departures: 0, maintenanceRooms: 0 })
const topServices = ref([])
const todayTasks = ref([])
const dbServicesList = ref([])
const dbRevenue = ref({})
const dbServices = ref({})

// --- CẤU HÌNH BIỂU ĐỒ TRÒN (Trạng thái phòng) ---
const roomStatusCounts = ref([0, 0, 0, 0])
const roomStatusData = computed(() => ({
  labels: ['Trống', 'Đang ở', 'Đang dọn', 'Bảo trì'],
  datasets: [{ backgroundColor: ['#198754', '#dc3545', '#0dcaf0', '#ffc107'], data: roomStatusCounts.value }]
}))
const pieOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }

// --- CẤU HÌNH BIỂU ĐỒ CỘT (Doanh thu) ---
const availableYears = ref([2026, 2025, 2024])
const monthsLabel = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']

const filterRevenueYear = ref(new Date().getFullYear())
const revenueChartData = computed(() => {
  const dataArray = dbRevenue.value[filterRevenueYear.value] || Array(12).fill(0)
  return {
    labels: monthsLabel,
    datasets: [{ label: 'Doanh thu (VNĐ)', backgroundColor: '#198754', borderRadius: 4, data: dataArray }]
  }
})
const barOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }

// --- CẤU HÌNH BIỂU ĐỒ ĐƯỜNG (Dịch vụ) ---
const filterServiceYear = ref(new Date().getFullYear())
const filterServiceId = ref('ALL')

const serviceChartData = computed(() => {
  const yearData = dbServices.value[filterServiceYear.value]
  const dataArray = yearData ? (yearData[filterServiceId.value] || Array(12).fill(0)) : Array(12).fill(0)
  
  let chartLabel = 'Tổng lượt sử dụng tất cả dịch vụ'
  if (filterServiceId.value !== 'ALL') {
    const svc = dbServicesList.value.find(s => s.id === filterServiceId.value)
    if (svc) chartLabel = `Lượt sử dụng: ${svc.name}`
  }
  
  return {
    labels: monthsLabel,
    datasets: [{
      label: chartLabel, borderColor: '#0d6efd', backgroundColor: 'rgba(13, 110, 253, 0.1)',
      borderWidth: 3, pointBackgroundColor: '#fff', pointBorderColor: '#0d6efd', pointRadius: 4,
      fill: true, tension: 0.3, data: dataArray
    }]
  }
})
const lineOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }

// --- FETCH DATA TỪ BACKEND ---
const fetchData = async () => {
  try {
    const resBase = await api.get('/api/manager/operation/dashboard')
    dbServicesList.value = resBase.data.services || []

    const resStats = await api.get('/api/manager/operation/dashboard-stats')
    const stats = resStats.data

    kpi.value = stats.kpi
    roomStatusCounts.value = stats.roomStatusCounts
    topServices.value = stats.topServices
    todayTasks.value = stats.todayTasks
    dbRevenue.value = stats.monthlyRevenue || {}
    dbServices.value = stats.monthlyServices || {}

  } catch (error) {
    console.error("Lỗi tải dữ liệu", error)
  }
}

// --- HÀM XUẤT EXCEL ---
const exportRevenueExcel = () => {
  const dataArray = dbRevenue.value[filterRevenueYear.value] || Array(12).fill(0)
  const exportData = monthsLabel.map((month, index) => ({ 'Tháng': month, 'Doanh Thu (VNĐ)': dataArray[index] }))
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, `Doanh Thu ${filterRevenueYear.value}`)
  XLSX.writeFile(wb, `Bao_Cao_Doanh_Thu_${filterRevenueYear.value}.xlsx`)
}

const exportServiceExcel = () => {
  const dataArray = serviceChartData.value.datasets[0].data
  const exportData = monthsLabel.map((month, index) => ({ 'Tháng': month, 'Số Lượt Sử Dụng': dataArray[index] }))
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, `Dịch Vụ ${filterServiceYear.value}`)
  const fileName = filterServiceId.value === 'ALL' ? `Tong_Dich_Vu_${filterServiceYear.value}.xlsx` : `Dich_Vu_${filterServiceId.value}_${filterServiceYear.value}.xlsx`
  XLSX.writeFile(wb, fileName)
}

onMounted(() => {
  fetchData() 
})
</script>

<style scoped>
.form-select { cursor: pointer; box-shadow: none !important; }
.form-select:focus { border-color: currentColor; }
</style>