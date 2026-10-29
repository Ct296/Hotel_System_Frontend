<template>
  <div class="card border-0 shadow-sm rounded-4 mb-4">
    <div class="card-header bg-white border-0 pt-4 pb-0">
      <h5 class="fw-bold mb-1"><i class="fas fa-file-invoice-dollar me-2 text-primary"></i>Lịch sử Giao dịch & Hóa đơn</h5>
    </div>
    
    <div class="card-body">
      <!-- Dùng Vue State cho Tabs thay vì data-bs-target của Bootstrap -->
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <button class="nav-link fw-bold" :class="{ 'active text-dark': activeTab === 'bill' }" @click="activeTab = 'bill'">
            <i class="fas fa-receipt me-1"></i>Hóa đơn
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold" :class="{ 'active text-success': activeTab === 'payment' }" @click="activeTab = 'payment'">
            <i class="fas fa-money-bill-wave me-1"></i>Thanh toán
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold" :class="{ 'active text-primary': activeTab === 'service' }" @click="activeTab = 'service'">
            <i class="fas fa-concierge-bell me-1"></i>Dịch vụ
          </button>
        </li>
      </ul>

      <div v-if="isLoading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
      
      <div v-else class="tab-content border rounded bg-white">
        <!-- Hóa đơn -->
        <div v-if="activeTab === 'bill'" class="table-responsive p-2" style="max-height: 400px; overflow-y: auto;">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light position-sticky top-0"><tr><th class="px-3">Thời gian</th><th>Mã hóa đơn</th><th>Phân loại</th><th class="text-end px-3">Tổng tiền</th></tr></thead>
            <tbody><tr v-for="b in bills" :key="b.id"><td class="px-3 small text-muted">{{ formatDate(b.createDate) }}</td><td class="fw-bold">{{ b.id }}</td><td><span class="badge" :class="b.type === 'DEPOSIT' ? 'bg-info text-dark' : 'bg-danger'">{{ b.type }}</span></td><td class="text-end px-3 fw-bold text-danger">{{ formatPrice(b.totalAmount) }}</td></tr></tbody>
          </table>
        </div>

        <!-- Thanh toán -->
        <div v-if="activeTab === 'payment'" class="table-responsive p-2" style="max-height: 400px; overflow-y: auto;">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light position-sticky top-0"><tr><th class="px-3">Thời gian</th><th>Mã Giao dịch</th><th>Phương thức</th><th>Mã Hóa đơn</th></tr></thead>
            <tbody><tr v-for="p in payments" :key="p.id"><td class="px-3 small text-muted">{{ formatDate(p.date) }}</td><td class="fw-bold text-success">{{ p.transaction }}</td><td><span class="badge bg-success-subtle text-success border border-success">{{ p.method }}</span></td><td class="small text-muted">{{ p.bill?.id }}</td></tr></tbody>
          </table>
        </div>

        <!-- Dịch vụ -->
        <div v-if="activeTab === 'service'" class="table-responsive p-2" style="max-height: 400px; overflow-y: auto;">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light position-sticky top-0"><tr><th class="px-3">Thời gian</th><th>Dịch vụ</th><th>SL</th><th class="text-end px-3">Thành tiền</th></tr></thead>
            <tbody><tr v-for="u in serviceUsages" :key="u.id"><td class="px-3 small text-muted">{{ formatDate(u.time) }}</td><td><span class="badge bg-light text-primary border border-primary">{{ u.service?.name }}</span></td><td class="fw-bold text-secondary">{{ u.count }}</td><td class="text-end px-3 fw-bold text-danger">{{ formatPrice(u.unitPrice * u.count) }}</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../utils/axios'

const activeTab = ref('bill') // Quản lý Tab bằng Vue
const bills = ref([])
const payments = ref([])
const serviceUsages = ref([])
const isLoading = ref(true)

const formatDate = (val) => val ? new Date(val).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0) + ' đ'

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/staff/history')
    bills.value = res.data.bills || []
    payments.value = res.data.payments || []
    serviceUsages.value = res.data.serviceUsages || []
  } catch (error) { console.error(error) }
  finally { isLoading.value = false }
}

onMounted(() => fetchData())
</script>

<style scoped>
.nav-tabs .nav-link { cursor: pointer; color: #6c757d; }
.nav-tabs .nav-link.active { border-bottom-color: transparent; }
</style>