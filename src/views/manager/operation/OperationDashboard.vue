<template>
  <div class="position-relative pb-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-body-emphasis mb-1">Tổng quan Vận hành</h3>
        <p class="text-body-secondary small mb-0">Theo dõi doanh thu, hoạt động trong ngày và các chỉ số kinh doanh.</p>
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

    <!-- HÀNG 2: 3 BIỂU ĐỒ TRÒN -->
    <div class="row g-4 mb-4">
      <!-- 1. Trạng thái phòng -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h6 class="fw-bold text-body-emphasis mb-0"><i class="fas fa-chart-pie text-primary me-2"></i>Trạng thái phòng</h6>
            <button @click="exportRoomStatusExcel" class="btn btn-sm btn-outline-success" title="Xuất Excel"><i class="fas fa-file-excel"></i></button>
          </div>
          <div class="card-body d-flex justify-content-center align-items-center p-3">
            <div class="position-relative w-100 d-flex justify-content-center" style="height: 220px;">
              <Doughnut :data="roomStatusData" :options="donutOptions" />
              <!-- Text ở giữa biểu đồ -->
              <div class="position-absolute top-50 start-50 translate-middle text-center" style="pointer-events: none;">
                <h4 class="fw-bold mb-0 text-body-emphasis">{{ totalRooms }}</h4>
                <span class="text-body-secondary small">Phòng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 2. Cơ cấu doanh thu Loại phòng -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h6 class="fw-bold text-body-emphasis mb-0"><i class="fas fa-bed text-success me-2"></i>Doanh thu loại phòng</h6>
            <button @click="exportRoomTypeRevExcel" class="btn btn-sm btn-outline-success" title="Xuất Excel"><i class="fas fa-file-excel"></i></button>
          </div>
          <div class="card-body d-flex justify-content-center align-items-center p-3">
            <div class="position-relative w-100 d-flex justify-content-center" style="height: 220px;">
              <Doughnut :data="roomTypeRevenueData" :options="donutOptionsRightLegend" />
              <div class="position-absolute top-50 start-50 translate-middle text-center" style="pointer-events: none;">
                <h5 class="fw-bold mb-0 text-body-emphasis text-truncate" style="max-width: 90px;" :title="formatPrice(totalRoomTypeRev)">{{ formatShortPrice(totalRoomTypeRev) }}</h5>
                <span class="text-body-secondary" style="font-size: 0.7rem;">VNĐ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Cơ cấu doanh thu Dịch vụ -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h6 class="fw-bold text-body-emphasis mb-0"><i class="fas fa-concierge-bell text-warning me-2"></i>Doanh thu dịch vụ</h6>
            <button @click="exportServiceRevExcel" class="btn btn-sm btn-outline-success" title="Xuất Excel"><i class="fas fa-file-excel"></i></button>
          </div>
          <div class="card-body d-flex justify-content-center align-items-center p-3">
            <div class="position-relative w-100 d-flex justify-content-center" style="height: 220px;">
              <Doughnut :data="serviceRevenueData" :options="donutOptionsRightLegend" />
              <div class="position-absolute top-50 translate-middle-y text-center" style="left: 30%; pointer-events: none;">
                <h5 class="fw-bold mb-0 text-body-emphasis text-truncate" style="max-width: 90px;" :title="formatPrice(totalServiceRev)">{{ formatShortPrice(totalServiceRev) }}</h5>
                <span class="text-body-secondary" style="font-size: 0.7rem;">VNĐ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- HÀNG 3: BẢNG XẾP HẠNG TOP (Chia 2) -->
    <div class="row g-4 mb-4">
      <!-- TOP PHÒNG ĐẶT NHIỀU NHẤT -->
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h6 class="fw-bold text-body-emphasis mb-0"><i class="fas fa-door-open text-primary me-2"></i>Top Loại phòng đặt nhiều</h6>
            <div class="d-flex gap-2">
              <select v-model="topRoomFilter.month" class="form-select form-select-sm bg-body">
                <option v-for="m in 12" :key="m" :value="m">T{{ m }}</option>
              </select>
              <select v-model="topRoomFilter.year" class="form-select form-select-sm bg-body">
                <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
              </select>
              <button @click="exportTopRoomsTable" class="btn btn-sm btn-outline-success px-2" title="Xuất Excel"><i class="fas fa-file-excel"></i></button>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-secondary small">
                  <tr><th class="px-4">Hạng</th><th>Loại phòng</th><th class="text-center">Số lượt</th><th class="text-end px-4">Doanh thu</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(room, idx) in topRoomsList" :key="idx">
                    <td class="px-4 fw-bold" :class="idx < 3 ? 'text-danger' : 'text-body-secondary'">#{{ idx + 1 }}</td>
                    <td class="fw-semibold text-body-emphasis">{{ room.name }}</td>
                    <td class="text-center">{{ room.count }}</td>
                    <td class="text-end px-4 fw-bold text-success">{{ formatPrice(room.revenue) }}</td>
                  </tr>
                  <tr v-if="topRoomsList.length === 0"><td colspan="4" class="text-center py-3 text-body-secondary">Chưa có dữ liệu</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- TOP DỊCH VỤ BÁN CHẠY -->
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h6 class="fw-bold text-body-emphasis mb-0"><i class="fas fa-star text-warning me-2"></i>Top Dịch vụ bán chạy</h6>
            <div class="d-flex gap-2">
              <select v-model="topServiceFilter.month" class="form-select form-select-sm bg-body">
                <option v-for="m in 12" :key="m" :value="m">T{{ m }}</option>
              </select>
              <select v-model="topServiceFilter.year" class="form-select form-select-sm bg-body">
                <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
              </select>
              <button @click="exportTopServicesTable" class="btn btn-sm btn-outline-success px-2" title="Xuất Excel"><i class="fas fa-file-excel"></i></button>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-secondary small">
                  <tr><th class="px-4">Hạng</th><th>Dịch vụ</th><th class="text-center">Số lượng</th><th class="text-end px-4">Doanh thu</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(svc, idx) in topServicesList" :key="idx">
                    <td class="px-4 fw-bold" :class="idx < 3 ? 'text-warning text-dark' : 'text-body-secondary'">#{{ idx + 1 }}</td>
                    <td class="fw-semibold text-body-emphasis">{{ svc.name }}</td>
                    <td class="text-center">{{ svc.count }}</td>
                    <td class="text-end px-4 fw-bold text-success">{{ formatPrice(svc.revenue) }}</td>
                  </tr>
                  <tr v-if="topServicesList.length === 0"><td colspan="4" class="text-center py-3 text-body-secondary">Chưa có dữ liệu</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- HÀNG 4: BIỂU ĐỒ 12 THÁNG (DOANH THU) -->
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

    <!-- HÀNG 5: BIỂU ĐỒ 12 THÁNG (DỊCH VỤ) -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h6 class="fw-bold mb-0 text-body-emphasis"><i class="fas fa-chart-line text-primary me-2"></i>Số lượng sử dụng Dịch vụ (12 Tháng)</h6>
            <div class="d-flex gap-2 flex-wrap">
              <select v-model="filterServiceId" class="form-select form-select-sm fw-bold border-primary text-primary bg-body" style="width: 200px;">
                <option value="ALL">-- Tất cả dịch vụ --</option>
                <option v-for="svc in dbServicesList" :key="svc.id" :value="svc.id">{{ svc.name }}</option>
              </select>
              <select v-model="filterServiceYear" class="form-select form-select-sm fw-bold border-primary text-primary bg-body" style="width: 120px;">
                <option v-for="year in availableYears" :key="year" :value="year">Năm {{ year }}</option>
              </select>
              <button @click="exportServiceExcel" class="btn btn-sm btn-outline-success fw-bold" title="Xuất dữ liệu dịch vụ">
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

    <!-- HÀNG 6: BẢNG LỊCH TRÌNH HÔM NAY -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h6 class="fw-bold text-body-emphasis mb-0"><i class="fas fa-clipboard-list text-warning me-2"></i>Lịch trình nhận/trả phòng hôm nay</h6>
            <button @click="exportTodayTasksExcel" class="btn btn-sm btn-outline-success fw-bold"><i class="fas fa-file-excel me-1"></i> Xuất Excel</button>
          </div>
          <div class="card-body p-0 mt-2">
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

    <!-- HÀNG 7: SỐ LƯỢT THUÊ THEO TUẦN (MỚI) -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h6 class="fw-bold mb-0 text-body-emphasis"><i class="fas fa-calendar-week text-info me-2"></i>Số lượt thuê theo Tuần</h6>
            <button @click="exportWeeklyBookingsExcel" class="btn btn-sm btn-outline-success fw-bold">
              <i class="fas fa-file-excel me-1"></i> Xuất Excel
            </button>
          </div>
          <div class="card-body p-4">
            <div style="height: 300px;">
              <Bar :data="weeklyChartData" :options="barOptions" />
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
import { useThemeStore } from '../../../stores/themeStore'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Filler)
const themeStore = useThemeStore()

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price)
const formatShortPrice = (price) => {
  if (price >= 1000000000) return (price / 1000000000).toFixed(1) + ' Tỷ'
  if (price >= 1000000) return (price / 1000000).toFixed(1) + ' Tr'
  if (price >= 1000) return (price / 1000).toFixed(1) + ' K'
  return price
}

const kpi = ref({ occupancyRate: 0, todayRevenue: 0, arrivals: 0, departures: 0, maintenanceRooms: 0 })
const todayTasks = ref([])
const dbServicesList = ref([])
const dbRevenue = ref({})
const dbServices = ref({})
const roomTypeRevLabels = ref([])
const roomTypeRevValues = ref([])
const serviceRevLabels = ref([])
const serviceRevValues = ref([])

const topRoomsList = ref([])
const topServicesList = ref([])
const weeklyBookingsRaw = ref([0, 0, 0, 0, 0, 0, 0])

const currentMonth = new Date().getMonth() + 1
const currentYear = new Date().getFullYear()

const topRoomFilter = ref({ month: currentMonth, year: currentYear })
const topServiceFilter = ref({ month: currentMonth, year: currentYear })

const getChartTextColor = computed(() => themeStore.isDarkMode ? '#e9ecef' : '#212529')
const getGridColor = computed(() => themeStore.isDarkMode ? '#495057' : '#e9ecef')

const donutOptions = computed(() => ({
  responsive: true, maintainAspectRatio: false, cutout: '75%',
  plugins: { legend: { position: 'bottom', labels: { color: getChartTextColor.value, boxWidth: 12 } } }
}))

const donutOptionsRightLegend = computed(() => ({
  responsive: true, maintainAspectRatio: false, cutout: '75%',
  plugins: { legend: { position: 'bottom', labels: { color: getChartTextColor.value, boxWidth: 12 } } }
}))

const barOptions = computed(() => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: getChartTextColor.value }, grid: { color: getGridColor.value } },
    y: { beginAtZero: true, ticks: { color: getChartTextColor.value }, grid: { color: getGridColor.value } }
  }
}))

const lineOptions = computed(() => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { position: 'top', labels: { color: getChartTextColor.value } } },
  scales: {
    x: { ticks: { color: getChartTextColor.value }, grid: { color: getGridColor.value } },
    y: { beginAtZero: true, ticks: { color: getChartTextColor.value }, grid: { color: getGridColor.value } }
  }
}))

// CẤU HÌNH BIỂU ĐỒ TRÒN
const roomStatusCounts = ref([0, 0, 0, 0])
const totalRooms = computed(() => roomStatusCounts.value.reduce((a,b) => a+b, 0))
const roomStatusData = computed(() => ({
  labels: ['Trống', 'Đang ở', 'Đang dọn', 'Bảo trì'],
  datasets: [{ backgroundColor: ['#198754', '#dc3545', '#0dcaf0', '#ffc107'], data: roomStatusCounts.value }]
}))

const totalRoomTypeRev = computed(() => roomTypeRevValues.value.reduce((a,b) => a+b, 0))
const roomTypeRevenueData = computed(() => ({
  labels: roomTypeRevLabels.value,
  datasets: [{ backgroundColor: ['#0d6efd', '#20c997', '#ffc107', '#ff8787', '#6f42c1', '#fd7e14'], data: roomTypeRevValues.value }]
}))

const totalServiceRev = computed(() => serviceRevValues.value.reduce((a,b) => a+b, 0))
const serviceRevenueData = computed(() => ({
  labels: serviceRevLabels.value,
  datasets: [{ backgroundColor: ['#e83e8c', '#17a2b8', '#28a745', '#ffc107', '#6610f2', '#fd7e14'], data: serviceRevValues.value }]
}))

//CẤU HÌNH BIỂU ĐỒ 12 THÁNG
const availableYears = ref([currentYear, currentYear - 1, currentYear - 2])
const monthsLabel = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']

const filterRevenueYear = ref(currentYear)
const revenueChartData = computed(() => ({
  labels: monthsLabel,
  datasets: [{ label: 'Doanh thu (VNĐ)', backgroundColor: '#198754', borderRadius: 4, data: dbRevenue.value[filterRevenueYear.value] || Array(12).fill(0) }]
}))

const filterServiceYear = ref(currentYear)
const filterServiceId = ref('ALL')
const serviceChartData = computed(() => {
  const yearData = dbServices.value[filterServiceYear.value]
  const dataArray = yearData ? (yearData[filterServiceId.value] || Array(12).fill(0)) : Array(12).fill(0)
  let chartLabel = filterServiceId.value !== 'ALL' ? `Lượt sử dụng: ${dbServicesList.value.find(s => s.id === filterServiceId.value)?.name || ''}` : 'Tổng lượt sử dụng tất cả dịch vụ'
  return {
    labels: monthsLabel,
    datasets: [{ label: chartLabel, borderColor: '#0d6efd', backgroundColor: 'rgba(13, 110, 253, 0.1)', borderWidth: 3, pointBackgroundColor: '#fff', pointBorderColor: '#0d6efd', pointRadius: 4, fill: true, tension: 0.3, data: dataArray }]
  }
})

// CẤU HÌNH BIỂU ĐỒ THEO TUẦN
const weeklyChartData = computed(() => ({
  labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  datasets: [{ label: 'Số lượt thuê', backgroundColor: '#0dcaf0', borderRadius: 4, data: weeklyBookingsRaw.value }]
}))

// FETCH DATA
const fetchData = async () => {
  try {
    const resBase = await api.get('/api/manager/operation/dashboard')
    dbServicesList.value = resBase.data.services || []
    
    // Gửi kèm thông số tháng/năm từ droplist
    const params = new URLSearchParams()
    params.append('topRoomMonth', topRoomFilter.value.month)
    params.append('topRoomYear', topRoomFilter.value.year)
    params.append('topServiceMonth', topServiceFilter.value.month)
    params.append('topServiceYear', topServiceFilter.value.year)
    
    const resStats = await api.get(`/api/manager/operation/dashboard-stats?${params.toString()}`)
    const stats = resStats.data
    
    kpi.value = stats.kpi
    roomStatusCounts.value = stats.roomStatusCounts
    todayTasks.value = stats.todayTasks
    dbRevenue.value = stats.monthlyRevenue || {}
    dbServices.value = stats.monthlyServices || {}
    
    if (stats.roomTypeRevLabels && stats.roomTypeRevValues) {
      roomTypeRevLabels.value = stats.roomTypeRevLabels
      roomTypeRevValues.value = stats.roomTypeRevValues
    }
    if (stats.serviceRevLabels && stats.serviceRevValues) {
      serviceRevLabels.value = stats.serviceRevLabels
      serviceRevValues.value = stats.serviceRevValues
    }
    if (stats.topRoomsList) {
      topRoomsList.value = stats.topRoomsList
    }
    if (stats.topServices) {
       topServicesList.value = stats.topServices.map(s => ({ name: s.name, count: s.sold, revenue: s.revenue }))
    }
    if (stats.weeklyBookings) {
      weeklyBookingsRaw.value = stats.weeklyBookings
    }
  } catch (error) {
    console.error("Lỗi tải dữ liệu", error)
  }
}

// Bổ sung lệnh này để gọi lại API mỗi khi chọn lại droplist
import { watch } from 'vue'
watch([topRoomFilter, topServiceFilter], () => {
  fetchData()
}, { deep: true })

// HÀM XUẤT EXCEL DÙNG CHUNG
const executeExcelExport = (data, filename, sheetName) => {
  if (!data || data.length === 0) return alert('Không có dữ liệu để xuất!')
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

// CÁC HÀM XUẤT EXCEL CỤ THỂ
const exportRoomStatusExcel = () => {
  const data = roomStatusData.value.labels.map((label, idx) => ({ 'Trạng thái': label, 'Số lượng': roomStatusCounts.value[idx] }))
  executeExcelExport(data, 'Trang_Thai_Phong', 'Trạng Thái')
}

const exportRoomTypeRevExcel = () => {
  const data = roomTypeRevLabels.value.map((label, idx) => ({ 'Loại phòng': label, 'Doanh thu (VNĐ)': roomTypeRevValues.value[idx] }))
  executeExcelExport(data, 'Doanh_Thu_Loai_Phong', 'DT Loại Phòng')
}

const exportServiceRevExcel = () => {
  const data = serviceRevLabels.value.map((label, idx) => ({ 'Dịch vụ': label, 'Doanh thu (VNĐ)': serviceRevValues.value[idx] }))
  executeExcelExport(data, 'Doanh_Thu_Dich_Vu', 'DT Dịch Vụ')
}

const exportTopRoomsTable = () => {
  const data = topRoomsList.value.map((r, idx) => ({ 'Hạng': idx+1, 'Loại phòng': r.name, 'Số lượt': r.count, 'Doanh thu': r.revenue }))
  executeExcelExport(data, `Top_Loai_Phong_T${topRoomFilter.value.month}_${topRoomFilter.value.year}`, 'Top Phòng')
}

const exportTopServicesTable = () => {
  const data = topServicesList.value.map((s, idx) => ({ 'Hạng': idx+1, 'Dịch vụ': s.name, 'Số lượng': s.count, 'Doanh thu': s.revenue }))
  executeExcelExport(data, `Top_Dich_Vu_T${topServiceFilter.value.month}_${topServiceFilter.value.year}`, 'Top Dịch Vụ')
}

const exportRevenueExcel = () => {
  const dataArray = dbRevenue.value[filterRevenueYear.value] || Array(12).fill(0)
  const data = monthsLabel.map((month, idx) => ({ 'Tháng': month, 'Doanh Thu (VNĐ)': dataArray[idx] }))
  executeExcelExport(data, `Doanh_Thu_${filterRevenueYear.value}`, 'Doanh Thu')
}

const exportServiceExcel = () => {
  const dataArray = serviceChartData.value.datasets[0].data
  const data = monthsLabel.map((month, idx) => ({ 'Tháng': month, 'Số Lượt Sử Dụng': dataArray[idx] }))
  executeExcelExport(data, `Dich_Vu_${filterServiceYear.value}`, 'Sử Dụng DV')
}

const exportTodayTasksExcel = () => {
  const data = todayTasks.value.map(t => ({ 'Khách hàng': t.customerName, 'Phòng': t.roomName, 'Loại': t.type === 'CHECK_IN' ? 'Check-in' : 'Check-out', 'Thời gian': t.time, 'Trạng thái': t.status === 'PENDING' ? 'Chờ xử lý' : 'Hoàn tất' }))
  executeExcelExport(data, 'Lich_Trinh_Hom_Nay', 'Lịch Trình')
}

const exportWeeklyBookingsExcel = () => {
  const labels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật']
  const data = labels.map((day, idx) => ({ 'Ngày': day, 'Số lượt thuê': weeklyBookingsRaw.value[idx] }))
  executeExcelExport(data, 'So_Luot_Thue_Tuan', 'Theo Tuần')
}

onMounted(() => {
  fetchData() 
})
</script>

<style scoped>
.form-select { cursor: pointer; box-shadow: none !important; }
.form-select:focus { border-color: currentColor; }
</style>
