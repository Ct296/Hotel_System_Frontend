<template>
  <div>
    <h3 class="fw-bold text-dark mb-4">Bảng Điều Khiển Quản Trị</h3>

    <!-- Trạng thái Loading -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted fw-semibold">Đang tổng hợp dữ liệu hệ thống...</p>
    </div>

    <div v-else>
      <!-- HÀNG 1: 5 Ô THỐNG KÊ -->
      <div class="row g-3 mb-4">
        <div class="col">
          <div class="card border-0 shadow-sm border-start border-primary border-4 h-100">
            <div class="card-body py-3">
              <div class="text-xs fw-bold text-primary text-uppercase mb-1">Tổng Tài Khoản</div>
              <div class="h4 mb-0 fw-bold text-dark">{{ stats.totalAccounts }}</div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card border-0 shadow-sm border-start border-danger border-4 h-100">
            <div class="card-body py-3">
              <div class="text-xs fw-bold text-danger text-uppercase mb-1">Admin</div>
              <div class="h4 mb-0 fw-bold text-dark">{{ stats.adminCount }}</div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card border-0 shadow-sm border-start border-warning border-4 h-100">
            <div class="card-body py-3">
              <div class="text-xs fw-bold text-warning text-uppercase mb-1">Manager</div>
              <div class="h4 mb-0 fw-bold text-dark">{{ stats.managerCount }}</div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card border-0 shadow-sm border-start border-info border-4 h-100">
            <div class="card-body py-3">
              <div class="text-xs fw-bold text-info text-uppercase mb-1">Staff</div>
              <div class="h4 mb-0 fw-bold text-dark">{{ stats.staffCount }}</div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card border-0 shadow-sm border-start border-success border-4 h-100">
            <div class="card-body py-3">
              <div class="text-xs fw-bold text-success text-uppercase mb-1">Khách Đang H.Động</div>
              <div class="h4 mb-0 fw-bold text-dark">{{ stats.activeCustomerCount }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- HÀNG 2: BIỂU ĐỒ CỘT (VAI TRÒ) & TRÒN (KHÁCH HÀNG) -->
      <div class="row g-4 mb-4">
        <!-- Biểu đồ Cột: Số lượng theo vai trò -->
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3">
              <h6 class="m-0 fw-bold text-dark">Phân bổ Tài khoản theo Vai trò</h6>
            </div>
            <div class="card-body d-flex justify-content-center align-items-center">
              <apexchart type="bar" height="300" width="100%" :options="roleBarOptions" :series="roleBarSeries"></apexchart>
            </div>
          </div>
        </div>

        <!-- Biểu đồ Tròn: Trạng thái khách hàng -->
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3">
              <h6 class="m-0 fw-bold text-dark">Trạng thái Tài khoản Khách hàng</h6>
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
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3">
              <h6 class="m-0 fw-bold text-dark">Lượng Khách hàng đăng ký mới trong năm nay</h6>
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
import { ref, onMounted } from 'vue'
import api from '../../utils/axios'
import VueApexCharts from 'vue3-apexcharts'

// Đăng ký component cục bộ cho Vue 3
const apexchart = VueApexCharts

const isLoading = ref(true)

// Dữ liệu cho 5 ô trên cùng
const stats = ref({
  totalAccounts: 0,
  adminCount: 0,
  managerCount: 0,
  staffCount: 0,
  activeCustomerCount: 0
})

// === CẤU HÌNH BIỂU ĐỒ CỘT (VAI TRÒ) ===
const roleBarSeries = ref([{ name: 'Số lượng', data: [] }])
const roleBarOptions = ref({
  chart: { toolbar: { show: false } },
  colors: ['#dc3545', '#ffc107', '#0dcaf0', '#198754'], // Màu tương ứng Admin, Manager, Staff, Customer
  plotOptions: { bar: { distributed: true, borderRadius: 4, dataLabels: { position: 'top' } } },
  dataLabels: { enabled: true, offsetY: -20, style: { fontSize: '14px', colors: ['#304758'] } },
  xaxis: { categories: ['Admin', 'Manager', 'Staff', 'Khách hàng'] },
  legend: { show: false }
})

// === CẤU HÌNH BIỂU ĐỒ TRÒN (TRẠNG THÁI KHÁCH HÀNG) ===
const customerPieSeries = ref([])
const customerPieOptions = ref({
  labels: ['Đang hoạt động', 'Bị khóa'],
  colors: ['#198754', '#dc3545'],
  dataLabels: {
    enabled: true,
    // Hiển thị cả Số lượng thật và % (Ví dụ: 150 (90.5%))
    formatter: function (val, opts) {
      const realNumber = opts.w.globals.seriesTotals[opts.seriesIndex]
      return realNumber + " (" + val.toFixed(1) + "%)"
    },
    style: { fontSize: '14px' }
  },
  legend: { position: 'bottom' }
})

// === CẤU HÌNH BIỂU ĐỒ ĐƯỜNG (KHÁCH MỚI THEO THÁNG) ===
const monthlyLineSeries = ref([{ name: 'Khách hàng mới', data: [] }])
const monthlyLineOptions = ref({
  chart: { toolbar: { show: false } },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#0d6efd'],
  markers: { size: 5, hover: { size: 7 } },
  dataLabels: {
    enabled: true,
    background: { borderRadius: 2 },
    style: { fontSize: '12px' }
  },
  xaxis: { categories: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'] },
  yaxis: { min: 0, forceNiceScale: true }
})

// Xử lý logic bóc tách dữ liệu từ API
const fetchDashboard = async () => {
  try {
    const response = await api.get('/api/admin/dashboard')
    const accounts = response.data.accounts || []
    
    let adminCount = 0, managerCount = 0, staffCount = 0, customerCount = 0
    let lockedCustomerCount = 0
    
    // Mảng đếm số lượng khách đăng ký theo 12 tháng (index 0 -> 11)
    const currentYear = new Date().getFullYear()
    const monthlyCustomers = Array(12).fill(0)

    // Duyệt danh sách accounts để phân loại
    accounts.forEach(acc => {
      if (acc.role === 'ADMIN') adminCount++
      else if (acc.role === 'MANAGER') managerCount++
      else if (acc.role === 'STAFF') staffCount++
      else if (acc.role === 'CUSTOMER') {
        customerCount++
        if (acc.state === 'LOCKED') lockedCustomerCount++
        
        // Tính số khách mới theo tháng
        if (acc.createDate) {
          const date = new Date(acc.createDate)
          if (date.getFullYear() === currentYear) {
            monthlyCustomers[date.getMonth()]++
          }
        }
      }
    })

    const activeCustomerCount = customerCount - lockedCustomerCount

    // Cập nhật 5 ô trên cùng
    stats.value = {
      totalAccounts: response.data.totalUsers,
      adminCount,
      managerCount,
      staffCount,
      activeCustomerCount
    }

    // Cập nhật Biểu đồ Cột
    roleBarSeries.value[0].data = [adminCount, managerCount, staffCount, customerCount]

    // Cập nhật Biểu đồ Tròn
    // Xử lý trường hợp không có khách nào để biểu đồ không bị lỗi
    if (customerCount === 0) {
      customerPieSeries.value = [0, 0]
    } else {
      customerPieSeries.value = [activeCustomerCount, lockedCustomerCount]
    }

    // Cập nhật Biểu đồ Đường
    monthlyLineSeries.value[0].data = monthlyCustomers

  } catch (error) {
    console.error('Lỗi lấy dữ liệu dashboard admin', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
})
</script>