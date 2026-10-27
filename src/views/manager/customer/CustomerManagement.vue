<template>
  <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
    <div class="card-header bg-white border-0 pt-4 pb-3 d-flex justify-content-between align-items-center">
      <h5 class="fw-bold mb-0 text-primary">Danh sách Khách hàng</h5>
      <button @click="syncAllTiers" class="btn btn-sm btn-success shadow-sm fw-bold" :disabled="isSyncing">
        <i class="fas fa-sync-alt me-1" :class="{'fa-spin': isSyncing}"></i> Đồng Bộ Hạng Thẻ
      </button>
    </div>
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="px-4 py-3">Khách hàng</th>
              <th class="py-3">Liên hệ</th>
              <th class="py-3 text-center">Hạng thẻ</th>
              <th class="py-3 text-end px-4">Tổng chi tiêu (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading"><td colspan="4" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>
            <tr v-else v-for="c in dashboardData.customers" :key="c.id">
              <td class="px-4 fw-bold text-dark">{{ c.user?.lastName }} {{ c.user?.firstName }}<div class="text-muted small">ID: {{ c.id }}</div></td>
              <td><div class="small"><i class="fas fa-envelope text-secondary me-1"></i> {{ c.user?.email }}</div><div class="small"><i class="fas fa-phone text-secondary me-1"></i> {{ c.user?.phoneNumber }}</div></td>
              <td class="text-center"><span class="badge bg-primary" v-if="getTier(c.id)">{{ getTier(c.id).name }}</span><span class="text-muted small" v-else>Chưa cấp</span></td>
              <td class="text-end px-4 fw-bold text-success fs-5">{{ formatPrice(getSpending(c.id)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../../utils/axios'

const dashboardData = ref({}); const isLoading = ref(true); const isSyncing = ref(false)
const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0)
const getTier = (id) => dashboardData.value.currentTierByCustomerId?.[id]
const getSpending = (id) => dashboardData.value.totalSpendingByCustomerId?.[id] || 0

const fetchDashboard = async () => {
  isLoading.value = true
  try { dashboardData.value = (await api.get('/api/manager/customer/dashboard')).data } 
  catch (error) { console.error(error) } finally { isLoading.value = false }
}

const syncAllTiers = async () => {
  isSyncing.value = true
  try { await api.post('/api/manager/customer/sync-tiers'); fetchDashboard() } 
  catch (error) { console.error(error) } finally { isSyncing.value = false }
}
onMounted(() => fetchDashboard())
</script>