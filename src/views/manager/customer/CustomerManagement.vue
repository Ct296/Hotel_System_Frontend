<template>
  <div class="position-relative">
    <!-- KHỐI QUẢN LÝ DANH SÁCH -->
    <div class="card border-0 shadow-sm rounded-4 bg-body-tertiary">
      
      <!-- HEADER: THANH CÔNG CỤ -->
      <div class="card-header bg-transparent border-bottom-0 pt-4 pb-3">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          
          <!-- Nhóm trái: Filter + Search -->
          <div class="d-flex align-items-center gap-2 flex-wrap flex-grow-1">
            
            <!-- Nút Lọc Mở Rộng -->
            <div class="dropdown">
              <button class="btn btn-outline-secondary bg-body text-body-emphasis border-secondary-subtle px-3 shadow-sm d-flex align-items-center justify-content-center" style="height: 38px;" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-filter text-secondary"></i>
              </button>
              <div class="dropdown-menu shadow-lg border-0 p-3 rounded-4" style="width: 280px;">
                <h6 class="dropdown-header fw-bold text-body-emphasis px-0 mb-2">Bộ lọc khách hàng</h6>
                
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-body-secondary mb-1">Hạng thẻ</label>
                  <select v-model="filterTier" class="form-select form-select-sm bg-body">
                    <option value="ALL">Mọi hạng thẻ</option>
                    <option value="NONE">Chưa có thẻ</option>
                    <option v-for="t in dashboardData.tierCustomers" :key="t.id" :value="t.id">{{ t.name }}</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-semibold text-body-secondary mb-1">Trạng thái khóa</label>
                  <select v-model="filterStatus" class="form-select form-select-sm bg-body">
                    <option value="ALL">Mọi trạng thái</option>
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="LOCKED">Bị Khóa</option>
                  </select>
                </div>

                <div>
                  <label class="form-label small fw-semibold text-body-secondary mb-1">Sắp xếp theo</label>
                  <select v-model="sortOption" class="form-select form-select-sm bg-body">
                    <option value="SPENDING_DESC">Chi tiêu: Cao nhất</option>
                    <option value="SPENDING_ASC">Chi tiêu: Thấp nhất</option>
                    <option value="NAME_ASC">Tên: A-Z</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Thanh tìm kiếm & Nút Làm Mới -->
            <div class="input-group shadow-sm" style="max-width: 320px;">
              <span class="input-group-text bg-body border-secondary-subtle text-secondary bg-transparent">
                <i class="fas fa-search"></i>
              </span>
              <input type="text" v-model="searchQuery" class="form-control bg-body border-secondary-subtle border-start-0 ps-0 shadow-none text-body-emphasis" placeholder="Tìm theo Tên, SĐT, Email...">
              <button @click="resetFilters" class="btn btn-outline-secondary bg-body border-secondary-subtle text-body-emphasis" type="button" title="Làm mới bộ lọc & tìm kiếm">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
            
            <button @click="syncAllTiers" class="btn btn-outline-success bg-body fw-bold border-success-subtle shadow-sm d-flex align-items-center" style="height: 38px;" :disabled="isSyncing" title="Đồng Bộ Hạng Thẻ Theo Chi Tiêu Mới Nhất">
              <i class="fas fa-sync-alt me-2" :class="{'fa-spin': isSyncing}"></i> ĐỒNG BỘ
            </button>
          </div>
          
          <div class="d-flex align-items-center">
             <h5 class="fw-bold mb-0 text-primary d-none d-md-block"><i class="fas fa-users-viewfinder me-2"></i>Danh sách Khách hàng</h5>
          </div>

        </div>
      </div>

      <!-- BODY: BẢNG DỮ LIỆU -->
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table align-middle mb-0 custom-table">
            <thead class="table-light text-body-secondary" style="font-size: 0.75rem;">
              <tr>
                <th class="px-4 py-3 fw-bold border-0 text-uppercase">#</th>
                <th class="py-3 fw-bold border-0 text-uppercase">Khách hàng</th>
                <th class="py-3 fw-bold border-0 text-uppercase">Liên hệ</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-center">Hạng thẻ</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-center">Trạng thái TK</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-end">Tổng chi tiêu (VNĐ)</th>
                <th class="py-3 fw-bold border-0 text-end px-4"></th>
              </tr>
            </thead>
            <tbody class="bg-body border-top-0">
              <tr v-if="isLoading">
                <td colspan="7" class="text-center py-5 text-body-secondary">
                  <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div> Đang tải...
                </td>
              </tr>
              <tr v-else-if="filteredAndSortedCustomers.length === 0">
                <td colspan="7" class="text-center py-5 text-body-secondary">
                  <i class="fas fa-search-minus fs-2 mb-3 opacity-50"></i>
                  <p class="mb-0">Không tìm thấy khách hàng phù hợp.</p>
                </td>
              </tr>
              
              <tr v-else v-for="(c, index) in filteredAndSortedCustomers" :key="c.id" class="table-row-hover border-bottom border-secondary-subtle">
                <td class="px-4 fw-bold text-body-emphasis">{{ String(index + 1).padStart(2, '0') }}</td>
                <td>
                  <span class="fw-bold text-body-emphasis d-block">{{ c.user?.lastName }} {{ c.user?.firstName }}</span>
                  <span class="text-body-secondary small">Mã: {{ c.id }}</span>
                </td>
                <td>
                  <div class="text-body-secondary small"><i class="fas fa-envelope me-1"></i> {{ c.user?.email }}</div>
                  <div class="text-body-secondary small"><i class="fas fa-phone-alt me-1"></i> {{ c.user?.phoneNumber || 'N/A' }}</div>
                </td>
                <td class="text-center">
                  <span class="badge rounded-pill shadow-sm" :class="getTierBadgeClass(getTier(c.id)?.name)">
                    {{ getTier(c.id) ? getTier(c.id).name : 'Chưa cấp' }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="fw-bold small" :class="getAccountStatus(c.id) === 'ACTIVE' ? 'text-success' : 'text-danger'">
                    <i :class="getAccountStatus(c.id) === 'ACTIVE' ? 'fas fa-unlock' : 'fas fa-lock'"></i> 
                    {{ getAccountStatus(c.id) === 'ACTIVE' ? 'Đang mở' : 'Bị khóa' }}
                  </span>
                </td>
                <td class="text-end fw-bold text-success fs-5">
                  {{ formatPrice(getSpending(c.id)) }}
                </td>
                <td class="text-end px-4">
                  <!-- Nút hành động dạng Dropdown -->
                  <div class="dropdown">
                    <button class="btn btn-link text-body-secondary p-0 shadow-none fs-5" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="fas fa-list"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm border-secondary-subtle rounded-3">
                      <li>
                        <button class="dropdown-item fw-semibold text-info py-2" @click="viewDetails(c)">
                          <i class="fas fa-eye me-2"></i> Xem chi tiết
                        </button>
                      </li>
                      <li v-if="getAccountStatus(c.id) === 'LOCKED'">
                        <button class="dropdown-item fw-semibold text-success py-2" @click="toggleLock(c.id)">
                          <i class="fas fa-unlock me-2"></i> Mở khóa tài khoản
                        </button>
                      </li>
                      <li v-else>
                        <button class="dropdown-item fw-semibold text-danger py-2" @click="toggleLock(c.id)">
                          <i class="fas fa-lock me-2"></i> Khóa tài khoản
                        </button>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL CHI TIẾT KHÁCH HÀNG -->
    <div v-if="showDetailModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-id-card me-2"></i>Chi tiết Hồ sơ Khách hàng</h5>
            <button type="button" class="btn-close btn-close-white" @click="showDetailModal = false"></button>
          </div>
          <div class="modal-body p-4" v-if="selectedCustomer">
            <div class="row g-3">
              <div class="col-12"><p class="mb-0"><strong>Mã ID:</strong> <span class="text-body-secondary">{{ selectedCustomer.id }}</span></p></div>
              <div class="col-12"><p class="mb-0"><strong>Họ và tên:</strong> <span class="text-body-secondary">{{ selectedCustomer.user?.lastName }} {{ selectedCustomer.user?.firstName }}</span></p></div>
              <div class="col-12">
                 <p class="mb-0"><strong>Hạng thẻ hiện tại:</strong> 
                    <span class="badge rounded-pill ms-2 shadow-sm" :class="getTierBadgeClass(getTier(selectedCustomer.id)?.name)">
                        {{ getTier(selectedCustomer.id) ? getTier(selectedCustomer.id).name : 'Chưa cấp' }}
                    </span>
                 </p>
              </div>
              <div class="col-12"><p class="mb-0"><strong>Tổng chi tiêu:</strong> <span class="text-success fw-bold ms-1">{{ formatPrice(getSpending(selectedCustomer.id)) }}</span></p></div>
              
              <div class="col-md-6"><p class="mb-0"><strong>Giới tính:</strong> <span class="text-body-secondary">{{ selectedCustomer.user?.sex === 'MALE' ? 'Nam' : (selectedCustomer.user?.sex === 'FEMALE' ? 'Nữ' : 'Khác') }}</span></p></div>
              <div class="col-md-6"><p class="mb-0"><strong>Ngày sinh:</strong> <span class="text-body-secondary">{{ formatDate(selectedCustomer.user?.dateOfBirth) }}</span></p></div>
              
              <div class="col-12"><p class="mb-0"><strong>Email:</strong> <span class="text-body-secondary">{{ selectedCustomer.user?.email }}</span></p></div>
              <div class="col-md-6"><p class="mb-0"><strong>Số điện thoại:</strong> <span class="text-body-secondary">{{ selectedCustomer.user?.phoneNumber || 'Chưa cập nhật' }}</span></p></div>
              <div class="col-md-6"><p class="mb-0"><strong>CCCD/Hộ chiếu:</strong> <span class="text-body-secondary">{{ selectedCustomer.user?.pid || 'Chưa cập nhật' }}</span></p></div>
              <div class="col-12"><p class="mb-0"><strong>Quốc tịch:</strong> <span class="text-body-secondary">{{ selectedCustomer.user?.nationality || 'Chưa cập nhật' }}</span></p></div>
              <div class="col-12"><p class="mb-0"><strong>Ngày tạo tài khoản:</strong> <span class="text-body-secondary">{{ formatDateTime(selectedCustomer.user?.createDate) }}</span></p></div>
              
              <div class="col-12">
                <hr class="my-2 border-secondary-subtle">
                <p class="mb-0">
                  <strong>Trạng thái Tài khoản:</strong> 
                  <span class="badge ms-2" :class="getAccountStatus(selectedCustomer.id) === 'ACTIVE' ? 'bg-success' : 'bg-danger'">
                    {{ getAccountStatus(selectedCustomer.id) === 'ACTIVE' ? 'Đang mở' : 'Bị khóa' }}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-body border-0 rounded-bottom-4">
            <button type="button" class="btn btn-secondary fw-semibold" @click="showDetailModal = false">Đóng</button>
          </div>
        </div>
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

const showDetailModal = ref(false)
const selectedCustomer = ref(null)

// Các biến lọc
const searchQuery = ref('')
const filterTier = ref('ALL')
const filterStatus = ref('ALL')
const sortOption = ref('SPENDING_DESC')

// Hàm làm mới bộ lọc (Reset button)
const resetFilters = () => {
  searchQuery.value = ''
  filterTier.value = 'ALL'
  filterStatus.value = 'ALL'
  sortOption.value = 'SPENDING_DESC'
}

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0)

const formatDate = (dateString) => {
  if (!dateString) return 'Chưa cập nhật'
  const d = new Date(dateString)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatDateTime = (val) => {
  if (!val) return 'N/A'
  return new Date(val).toLocaleString('vi-VN')
}

// CSS Badge cho Hạng Thẻ
const getTierBadgeClass = (tierName) => {
  if (!tierName) return 'bg-secondary'
  if (tierName === 'Đồng') return 'bg-secondary'
  if (tierName === 'Bạc') return 'bg-secondary bg-opacity-75'
  if (tierName === 'Vàng') return 'bg-warning text-dark'
  if (tierName === 'Bạch kim') return 'bg-info text-dark'
  if (tierName === 'Kim cương') return 'bg-primary'
  return 'bg-primary'
}

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

const viewDetails = (customer) => {
  selectedCustomer.value = customer
  showDetailModal.value = true
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

<style scoped>
/* Giao diện Bảng dữ liệu đồng bộ */
.custom-table th {
  background-color: transparent !important;
  font-weight: 700;
  color: var(--bs-secondary);
}

.table-row-hover:hover {
  background-color: var(--bs-secondary-bg) !important;
  transition: background-color 0.2s;
}

.dropdown-item:active {
  background-color: var(--bs-secondary-bg);
  color: inherit;
}

/* Custom Scrollbar cho Modal dài */
.modal-body::-webkit-scrollbar { width: 6px; }
.modal-body::-webkit-scrollbar-thumb { background-color: var(--bs-secondary-bg); border-radius: 4px; }
</style>
