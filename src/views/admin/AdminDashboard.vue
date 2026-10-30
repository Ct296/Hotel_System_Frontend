<template>
  <div>
    <h3 class="fw-bold text-body-emphasis mb-4">Bảng Điều Khiển Quản Trị</h3>

    <!-- Trạng thái Loading -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-body-secondary fw-semibold">Đang tổng hợp dữ liệu hệ thống...</p>
    </div>

    <div v-else>
      <!-- HÀNG 1: 5 Ô THỐNG KÊ -->
      <div class="row g-3 mb-4">
        <div class="col">
          <div class="card border-0 shadow-sm border-start border-primary border-4 h-100 bg-body-tertiary">
            <div class="card-body py-3">
              <div class="text-xs fw-bold text-primary text-uppercase mb-1">Tổng Tài Khoản</div>
              <div class="h4 mb-0 fw-bold text-body-emphasis">{{ stats.totalAccounts }}</div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card border-0 shadow-sm border-start border-danger border-4 h-100 bg-body-tertiary">
            <div class="card-body py-3">
              <div class="text-xs fw-bold text-danger text-uppercase mb-1">Admin</div>
              <div class="h4 mb-0 fw-bold text-body-emphasis">{{ stats.adminCount }}</div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card border-0 shadow-sm border-start border-warning border-4 h-100 bg-body-tertiary">
            <div class="card-body py-3">
              <div class="text-xs fw-bold text-warning text-uppercase mb-1">Manager</div>
              <div class="h4 mb-0 fw-bold text-body-emphasis">{{ stats.managerCount }}</div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card border-0 shadow-sm border-start border-info border-4 h-100 bg-body-tertiary">
            <div class="card-body py-3">
              <div class="text-xs fw-bold text-info text-uppercase mb-1">Staff</div>
              <div class="h4 mb-0 fw-bold text-body-emphasis">{{ stats.staffCount }}</div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card border-0 shadow-sm border-start border-success border-4 h-100 bg-body-tertiary">
            <div class="card-body py-3">
              <div class="text-xs fw-bold text-success text-uppercase mb-1">Khách Đang H.Động</div>
              <div class="h4 mb-0 fw-bold text-body-emphasis">{{ stats.activeCustomerCount }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- HÀNG 2: BIỂU ĐỒ CỘT (VAI TRÒ) & TRÒN (KHÁCH HÀNG) -->
      <div class="row g-4 mb-4">
        <!-- Biểu đồ Cột: Số lượng theo vai trò -->
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm h-100 bg-body-tertiary">
            <div class="card-header bg-transparent border-bottom-0 py-3">
              <h6 class="m-0 fw-bold text-body-emphasis">Phân bổ Tài khoản theo Vai trò</h6>
            </div>
            <div class="card-body d-flex justify-content-center align-items-center">
              <apexchart type="bar" height="300" width="100%" :options="roleBarOptions" :series="roleBarSeries"></apexchart>
            </div>
          </div>
        </div>

        <!-- Biểu đồ Tròn: Trạng thái khách hàng -->
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm h-100 bg-body-tertiary">
            <div class="card-header bg-transparent border-bottom-0 py-3">
              <h6 class="m-0 fw-bold text-body-emphasis">Trạng thái Tài khoản Khách hàng</h6>
            </div>
            <div class="card-body d-flex justify-content-center align-items-center">
              <apexchart type="pie" height="320" width="100%" :options="customerPieOptions" :series="customerPieSeries"></apexchart>
            </div>
          </div>
        </div>
      </div>

      <!-- HÀNG 3: BIỂU ĐỒ ĐƯỜNG (KHÁCH HÀNG MỚI THEO THÁNG) -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm bg-body-tertiary">
            <div class="card-header bg-transparent border-bottom-0 py-3">
              <h6 class="m-0 fw-bold text-body-emphasis">Lượng Khách hàng đăng ký mới trong năm nay</h6>
            </div>
            <div class="card-body">
              <apexchart type="line" height="350" width="100%" :options="monthlyLineOptions" :series="monthlyLineSeries"></apexchart>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '../../utils/axios'
import VueApexCharts from 'vue3-apexcharts'
import { useThemeStore } from '../../stores/themeStore'

const apexchart = VueApexCharts
const themeStore = useThemeStore()

const isLoading = ref(true)

const stats = ref({
  totalAccounts: 0, adminCount: 0, managerCount: 0, staffCount: 0, activeCustomerCount: 0
})

// DÙNG COMPUTED ĐỂ TỰ ĐỘNG LẤY MÀU CHỮ & MÀU KẺ
const getChartTextColor = computed(() => themeStore.isDarkMode ? '#e9ecef' : '#212529')
const getGridColor = computed(() => themeStore.isDarkMode ? '#495057' : '#e9ecef')

// === CẤU HÌNH BIỂU ĐỒ CỘT (VAI TRÒ) ===
const roleBarSeries = ref([{ name: 'Số lượng', data: [] }])
const roleBarOptions = computed(() => ({
  chart: { 
    background: 'transparent', // Xóa khung xám
    toolbar: { show: false }, 
    foreColor: getChartTextColor.value 
  },
  colors: ['#dc3545', '#ffc107', '#0dcaf0', '#198754'],
  plotOptions: { bar: { distributed: true, borderRadius: 4, dataLabels: { position: 'top' } } },
  dataLabels: { enabled: true, offsetY: -20, style: { fontSize: '14px', colors: [getChartTextColor.value] } },
  xaxis: { categories: ['Admin', 'Manager', 'Staff', 'Khách hàng'] },
  legend: { show: false },
  theme: { mode: themeStore.isDarkMode ? 'dark' : 'light' }
}))

// === CẤU HÌNH BIỂU ĐỒ TRÒN (TRẠNG THÁI KHÁCH HÀNG) ===
const customerPieSeries = ref([])
const customerPieOptions = computed(() => ({
  chart: { 
    background: 'transparent', // Xóa khung xám
    foreColor: getChartTextColor.value 
  },
  labels: ['Đang hoạt động', 'Bị khóa'],
  colors: ['#198754', '#dc3545'],
  stroke: { show: false },
  dataLabels: {
    enabled: true,
    formatter: function (val, opts) {
      const realNumber = opts.w.globals.seriesTotals[opts.seriesIndex]
      return realNumber + " (" + val.toFixed(1) + "%)"
    },
    style: { fontSize: '14px' },
    dropShadow: { enabled: false }
  },
  legend: { position: 'bottom' },
  theme: { mode: themeStore.isDarkMode ? 'dark' : 'light' }
}))

// === CẤU HÌNH BIỂU ĐỒ ĐƯỜNG (KHÁCH MỚI THEO THÁNG) ===
const monthlyLineSeries = ref([{ name: 'Khách hàng mới', data: [] }])
const monthlyLineOptions = computed(() => ({
  chart: { 
    background: 'transparent', // Xóa khung xám
    toolbar: { show: false }, 
    foreColor: getChartTextColor.value 
  },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#0d6efd'],
  markers: { size: 5, hover: { size: 7 } },
  dataLabels: {
    enabled: true,
    background: { borderRadius: 2, foreColor: '#000' },
    style: { fontSize: '12px' }
  },
  xaxis: { categories: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'] },
  yaxis: { min: 0, forceNiceScale: true },
  grid: { borderColor: getGridColor.value },
  theme: { mode: themeStore.isDarkMode ? 'dark' : 'light' }
}))

const fetchDashboard = async () => {
  try {
    const response = await api.get('/api/admin/dashboard')
    const accounts = response.data.accounts || []
    
    let adminCount = 0, managerCount = 0, staffCount = 0, customerCount = 0
    let lockedCustomerCount = 0
    const currentYear = new Date().getFullYear()
    const monthlyCustomers = Array(12).fill(0)

    accounts.forEach(acc => {
      if (acc.role === 'ADMIN') adminCount++
      else if (acc.role === 'MANAGER') managerCount++
      else if (acc.role === 'STAFF') staffCount++
      else if (acc.role === 'CUSTOMER') {
        customerCount++
        if (acc.state === 'LOCKED') lockedCustomerCount++
        if (acc.createDate) {
          const date = new Date(acc.createDate)
          if (date.getFullYear() === currentYear) {
            monthlyCustomers[date.getMonth()]++
          }
        }
      }
    })

    const activeCustomerCount = customerCount - lockedCustomerCount

    stats.value = { totalAccounts: response.data.totalUsers, adminCount, managerCount, staffCount, activeCustomerCount }
    roleBarSeries.value[0].data = [adminCount, managerCount, staffCount, customerCount]
    customerPieSeries.value = customerCount === 0 ? [0, 0] : [activeCustomerCount, lockedCustomerCount]
    monthlyLineSeries.value[0].data = monthlyCustomers

  } catch (error) {} finally {
    isLoading.value = false
  }
}

onMounted(() => fetchDashboard())
</script>