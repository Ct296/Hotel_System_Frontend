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
              <th class="py-3 text-center">Trạng thái</th>
              <th class="py-3 text-end">Tổng chi tiêu (VNĐ)</th>
              <th class="py-3 text-end px-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading"><td colspan="6" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>
            <tr v-else-if="!dashboardData.customers?.length"><td colspan="6" class="text-center py-5 text-muted">Chưa có khách hàng.</td></tr>
            <tr v-else v-for="c in dashboardData.customers" :key="c.id">
              <td class="px-4 fw-bold text-dark">
                {{ c.user?.lastName }} {{ c.user?.firstName }}
                <div class="text-muted small">ID: {{ c.id }}</div>
              </td>
              <td>
                <div class="small"><i class="fas fa-envelope text-secondary me-1"></i> {{ c.user?.email }}</div>
                <div class="small"><i class="fas fa-phone text-secondary me-1"></i> {{ c.user?.phoneNumber }}</div>
              </td>
              <td class="text-center">
                <span class="badge bg-primary" v-if="getTier(c.id)">{{ getTier(c.id).name }}</span>
                <span class="text-muted small" v-else>Chưa cấp</span>
              </td>
              <!-- ĐÃ SỬA: Gọi hàm getAccountStatus -->
              <td class="text-center">
                <span class="badge" :class="getAccountStatus(c.id) === 'ACTIVE' ? 'bg-success' : 'bg-danger'">
                  {{ getAccountStatus(c.id) === 'ACTIVE' ? 'Hoạt động' : 'Bị Khóa' }}
                </span>
              </td>
              <td class="text-end fw-bold text-success fs-5">
                {{ formatPrice(getSpending(c.id)) }}
              </td>
              <!-- ĐÃ SỬA: Gọi hàm getAccountStatus -->
              <td class="text-end px-4">
                <button 
                  @click="toggleLock(c.id)" 
                  class="btn btn-sm shadow-sm fw-bold"
                  :class="getAccountStatus(c.id) === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'">
                  <i class="fas" :class="getAccountStatus(c.id) === 'ACTIVE' ? 'fa-lock' : 'fa-unlock'"></i> 
                  {{ getAccountStatus(c.id) === 'ACTIVE' ? 'Khóa' : 'Mở Khóa' }}
                </button>
              </td>
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

const dashboardData = ref({})
const isLoading = ref(true)
const isSyncing = ref(false)

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0)
const getTier = (id) => dashboardData.value.currentTierByCustomerId?.[id]
const getSpending = (id) => dashboardData.value.totalSpendingByCustomerId?.[id] || 0

// THÊM: Lấy trạng thái từ map do backend trả về
const getAccountStatus = (id) => dashboardData.value.accountStatusByCustomerId?.[id] || 'ACTIVE'

const fetchDashboard = async () => {
  isLoading.value = true
  try { 
    dashboardData.value = (await api.get('/api/manager/customer/dashboard')).data 
  } 
  catch (error) { console.error(error) } 
  finally { isLoading.value = false }
}

const syncAllTiers = async () => {
  isSyncing.value = true
  try { 
    await api.post('/api/manager/customer/sync-tiers')
    fetchDashboard() 
  } 
  catch (error) { console.error(error) } 
  finally { isSyncing.value = false }
}

const toggleLock = async (customerId) => {
  if (!confirm('Bạn có chắc muốn thay đổi trạng thái tài khoản này?')) return;
  try {
    await api.put(`/api/manager/customer/${customerId}/toggle-lock`);
    fetchDashboard(); 
  } catch (error) {
    alert("Lỗi khi cập nhật trạng thái");
  }
}

onMounted(() => fetchDashboard())
</script>