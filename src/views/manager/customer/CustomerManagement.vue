<template>
  <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-body-tertiary">
    <div class="card-header bg-transparent border-bottom-0 pt-4 pb-2 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
      <h5 class="fw-bold mb-0 text-primary"><i class="fas fa-users-viewfinder me-2"></i>Danh sách Khách hàng</h5>
      
      <!-- Thanh Công cụ (Tìm kiếm, Lọc, Sắp xếp) -->
      <div class="d-flex flex-wrap gap-2">
        <div class="input-group input-group-sm flex-grow-1" style="min-width: 220px; max-width: 280px;">
          <span class="input-group-text bg-body border-secondary-subtle"><i class="fas fa-search text-body-secondary"></i></span>
          <input type="text" v-model="searchQuery" class="form-control bg-body border-secondary-subtle text-body-emphasis" placeholder="Tìm theo Tên, SĐT, Email...">
        </div>
        
        <select v-model="filterTier" class="form-select form-select-sm bg-body border-secondary-subtle text-body-emphasis" style="width: 140px;">
          <option value="ALL">Mọi hạng thẻ</option>
          <option value="NONE">Chưa có thẻ</option>
          <option v-for="t in dashboardData.tierCustomers" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
        
        <select v-model="filterStatus" class="form-select form-select-sm bg-body border-secondary-subtle text-body-emphasis" style="width: 130px;">
          <option value="ALL">Mọi trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="LOCKED">Bị Khóa</option>
        </select>
        
        <select v-model="sortOption" class="form-select form-select-sm bg-body border-secondary-subtle text-body-emphasis" style="width: 150px;">
          <option value="SPENDING_DESC">Chi tiêu cao nhất</option>
          <option value="SPENDING_ASC">Chi tiêu thấp nhất</option>
          <option value="NAME_ASC">Tên: A-Z</option>
        </select>

        <button @click="syncAllTiers" class="btn btn-sm btn-success shadow-sm fw-bold ms-2" :disabled="isSyncing" title="Đồng Bộ Lại Hạng Thẻ Theo Tổng Chi Tiêu Mới Nhất">
          <i class="fas fa-sync-alt" :class="{'fa-spin': isSyncing}"></i>
        </button>
      </div>
    </div>
    
    <div class="card-body p-0 mt-2">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-secondary">
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
            <tr v-if="isLoading"><td colspan="6" class="text-center py-5 text-body-secondary"><div class="spinner-border text-primary spinner-border-sm me-2"></div> Đang tải...</td></tr>
            <tr v-else-if="filteredAndSortedCustomers.length === 0"><td colspan="6" class="text-center py-5 text-body-secondary"><i class="fas fa-search-minus fs-2 mb-3 opacity-50"></i><p class="mb-0">Không tìm thấy khách hàng.</p></td></tr>
            
            <tr v-else v-for="c in filteredAndSortedCustomers" :key="c.id">
              <td class="px-4 fw-bold text-body-emphasis">
                {{ c.user?.lastName }} {{ c.user?.firstName }}
                <div class="text-body-secondary small fw-normal">ID: {{ c.id }}</div>
              </td>
              <td>
                <div class="text-body-secondary small"><i class="fas fa-envelope me-1"></i> {{ c.user?.email }}</div>
                <div class="text-body-secondary small"><i class="fas fa-phone me-1"></i> {{ c.user?.phoneNumber }}</div>
              </td>
              <td class="text-center">
                <span class="badge bg-primary shadow-sm" v-if="getTier(c.id)">{{ getTier(c.id).name }}</span>
                <span class="text-body-secondary small" v-else>Chưa cấp</span>
              </td>
              <td class="text-center">
                <span class="badge" :class="getAccountStatus(c.id) === 'ACTIVE' ? 'bg-success' : 'bg-danger'">
                  {{ getAccountStatus(c.id) === 'ACTIVE' ? 'Hoạt động' : 'Bị Khóa' }}
                </span>
              </td>
              <td class="text-end fw-bold text-success fs-5">
                {{ formatPrice(getSpending(c.id)) }}
              </td>
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
import { ref, computed, onMounted } from 'vue'
import api from '../../../utils/axios'

const dashboardData = ref({})
const isLoading = ref(true)
const isSyncing = ref(false)

// Các biến lọc
const searchQuery = ref('')
const filterTier = ref('ALL')
const filterStatus = ref('ALL')
const sortOption = ref('SPENDING_DESC')

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0)
const getTier = (id) => dashboardData.value.currentTierByCustomerId?.[id]
const getSpending = (id) => dashboardData.value.totalSpendingByCustomerId?.[id] || 0
const getAccountStatus = (id) => dashboardData.value.accountStatusByCustomerId?.[id] || 'ACTIVE'

// Logic Lọc & Sắp xếp Khách hàng
const filteredAndSortedCustomers = computed(() => {
  if (!dashboardData.value.customers) return []
  let result = dashboardData.value.customers

  // Lọc theo Hạng thẻ
  if (filterTier.value !== 'ALL') {
    if (filterTier.value === 'NONE') {
      result = result.filter(c => !getTier(c.id))
    } else {
      result = result.filter(c => getTier(c.id)?.id === filterTier.value)
    }
  }

  // Lọc theo Trạng thái
  if (filterStatus.value !== 'ALL') {
    result = result.filter(c => getAccountStatus(c.id) === filterStatus.value)
  }

  // Lọc theo Tìm kiếm
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(c => 
      c.user?.lastName?.toLowerCase().includes(q) || 
      c.user?.firstName?.toLowerCase().includes(q) ||
      c.user?.email?.toLowerCase().includes(q) ||
      c.user?.phoneNumber?.toLowerCase().includes(q)
    )
  }

  // Sắp xếp
  if (sortOption.value === 'SPENDING_DESC') {
    result = result.slice().sort((a, b) => getSpending(b.id) - getSpending(a.id))
  } else if (sortOption.value === 'SPENDING_ASC') {
    result = result.slice().sort((a, b) => getSpending(a.id) - getSpending(b.id))
  } else if (sortOption.value === 'NAME_ASC') {
    result = result.slice().sort((a, b) => {
      const nameA = (a.user?.firstName || '').toLowerCase()
      const nameB = (b.user?.firstName || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }

  return result
})

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