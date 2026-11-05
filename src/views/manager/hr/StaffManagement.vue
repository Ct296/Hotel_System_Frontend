<template>
  <div class="position-relative">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-body-emphasis mb-1">Hồ sơ Nhân sự (Lễ tân)</h3>
        <p class="text-body-secondary small mb-0">Quản lý danh sách nhân viên cấp Staff, cấp tài khoản và trạng thái làm việc.</p>
      </div>
      <button @click="openCreateModal" class="btn fw-bold px-4 shadow-sm" style="background-color: #6366f1; color: white; border: none; height: 38px;">
        <i class="fas fa-user-plus me-2"></i> THÊM NHÂN VIÊN MỚI
      </button>
    </div>

    <!-- Thông báo Alert -->
    <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
      {{ notification.message }}
      <button type="button" class="btn-close" @click="notification.message = ''"></button>
    </div>

    <!-- KHỐI QUẢN LÝ DANH SÁCH -->
    <div class="card border-0 shadow-sm rounded-4 bg-body-tertiary">
      
      <!-- HEADER: THANH CÔNG CỤ -->
      <div class="card-header bg-transparent border-bottom-0 pt-4 pb-3">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          
          <div class="d-flex align-items-center gap-2 flex-wrap flex-grow-1">
            <!-- Nút Lọc Mở Rộng -->
            <div class="dropdown">
              <button class="btn btn-outline-secondary bg-body text-body-emphasis border-secondary-subtle px-3 shadow-sm d-flex align-items-center justify-content-center" style="height: 38px;" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-filter text-secondary"></i>
              </button>
              <div class="dropdown-menu shadow-lg border-0 p-3 rounded-4" style="width: 280px;">
                <h6 class="dropdown-header fw-bold text-body-emphasis px-0 mb-2">Bộ lọc nhân sự</h6>
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-body-secondary mb-1">Trạng thái làm việc</label>
                  <select v-model="filterWorkingStatus" class="form-select form-select-sm bg-body">
                    <option value="ALL">Mọi trạng thái làm</option>
                    <option value="WORKING">Đang làm</option>
                    <option value="RESIGNED">Đã nghỉ</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-body-secondary mb-1">Trạng thái tài khoản</label>
                  <select v-model="filterAccountStatus" class="form-select form-select-sm bg-body">
                    <option value="ALL">Mọi trạng thái TK</option>
                    <option value="ACTIVE">Đang mở</option>
                    <option value="LOCKED">Bị khóa</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Thanh tìm kiếm & Nút Làm Mới -->
            <div class="input-group shadow-sm" style="max-width: 320px;">
              <span class="input-group-text bg-body border-secondary-subtle text-secondary bg-transparent">
                <i class="fas fa-search"></i>
              </span>
              <input type="text" v-model="searchQuery" class="form-control bg-body border-secondary-subtle border-start-0 ps-0 shadow-none text-body-emphasis" placeholder="Tìm tên hoặc mã nhân viên...">
              <button @click="resetFilters" class="btn btn-outline-secondary bg-body border-secondary-subtle text-body-emphasis" type="button" title="Làm mới bộ lọc & tìm kiếm">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
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
                <th class="py-3 fw-bold border-0 text-uppercase">Nhân viên</th>
                <th class="py-3 fw-bold border-0 text-uppercase">Liên hệ</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-center">Giới tính</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-center">Trạng thái làm việc</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-center">Trạng thái TK</th>
                <th class="py-3 fw-bold border-0 text-end px-4"></th>
              </tr>
            </thead>
            <tbody class="bg-body border-top-0">
              <tr v-if="isLoading">
                <td colspan="7" class="text-center py-5 text-body-secondary">
                  <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div> Đang tải...
                </td>
              </tr>
              <tr v-else-if="filteredStaffs.length === 0">
                <td colspan="7" class="text-center py-5 text-body-secondary">
                  <i class="fas fa-search-minus fs-2 mb-3 opacity-50"></i>
                  <p class="mb-0">Không tìm thấy nhân viên phù hợp.</p>
                </td>
              </tr>
              
              <tr v-else v-for="(s, index) in filteredStaffs" :key="s.id" class="table-row-hover border-bottom border-secondary-subtle">
                <td class="px-4 fw-bold text-body-emphasis">{{ String(index + 1).padStart(2, '0') }}</td>
                <td class="px-4">
                  <span class="fw-bold text-body-emphasis d-block">{{ s.fullName }}</span>
                  <span class="text-body-secondary small">Mã: {{ s.id }}</span>
                </td>
                <td>
                  <div class="text-body-secondary small"><i class="fas fa-envelope me-1"></i> {{ s.email }}</div>
                  <div class="text-body-secondary small"><i class="fas fa-phone-alt me-1"></i> {{ s.phone }}</div>
                </td>
                <td class="text-center">
                  <i v-if="s.gender === 'MALE'" class="fas fa-mars text-primary" title="Nam"></i>
                  <i v-else-if="s.gender === 'FEMALE'" class="fas fa-venus text-danger" title="Nữ"></i>
                  <span v-else class="text-body-secondary">-</span>
                </td>
                <td class="text-center">
                  <span class="badge rounded-pill fw-bold" :class="s.workingStatus === 'WORKING' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                    {{ s.workingStatus === 'WORKING' ? 'ĐANG LÀM' : 'ĐÃ NGHỈ' }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="fw-bold small" :class="s.accountStatus === 'ACTIVE' ? 'text-success' : 'text-danger'">
                    <i :class="s.accountStatus === 'ACTIVE' ? 'fas fa-unlock' : 'fas fa-lock'"></i> 
                    {{ s.accountStatus === 'ACTIVE' ? 'Đang mở' : 'Bị khóa' }}
                  </span>
                </td>
                <td class="text-end px-4">
                  <div class="dropdown">
                    <button class="btn btn-link text-body-secondary p-0 shadow-none fs-5" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="fas fa-list"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm border-secondary-subtle rounded-3">
                      <li>
                        <button class="dropdown-item fw-semibold text-info py-2" @click="viewDetails(s)">
                          <i class="fas fa-eye me-2"></i> Xem chi tiết
                        </button>
                      </li>
                      <li v-if="s.workingStatus === 'WORKING'">
                        <button class="dropdown-item fw-semibold text-danger py-2" @click="toggleStatus(s.id, 'RESIGNED')">
                          <i class="fas fa-user-times me-2"></i> Cho nghỉ việc
                        </button>
                      </li>
                      <li v-else>
                        <button class="dropdown-item fw-semibold text-success py-2" @click="toggleStatus(s.id, 'WORKING')">
                          <i class="fas fa-user-check me-2"></i> Khôi phục đi làm
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

    <!-- MODAL THÊM STAFF -->
    <div v-if="showModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-user-plus me-2"></i>Thêm Lễ tân mới</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="submitForm">
            <div class="modal-body p-4">
              <div class="alert alert-info py-2 small mb-4 bg-info-subtle text-info-emphasis border-0 shadow-sm">
                <i class="fas fa-info-circle me-1"></i> Tài khoản tạo ở đây sẽ được cấp quyền <b>STAFF</b> mặc định.
              </div>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary small">Họ (Last Name) <span class="text-danger">*</span></label>
                  <input v-model="form.lastName" type="text" class="form-control bg-body text-body-emphasis" required placeholder="VD: Nguyễn Văn">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary small">Tên (First Name) <span class="text-danger">*</span></label>
                  <input v-model="form.firstName" type="text" class="form-control bg-body text-body-emphasis" required placeholder="VD: A">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary small">Email đăng nhập <span class="text-danger">*</span></label>
                  <input v-model="form.email" type="email" class="form-control bg-body text-body-emphasis" required placeholder="staff@ithotel.vn">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary small">Mật khẩu cấp phát <span class="text-danger">*</span></label>
                  <input v-model="form.password" type="text" class="form-control bg-body text-body-emphasis" required placeholder="Tối thiểu 6 ký tự">
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-semibold text-body-secondary small">Số điện thoại <span class="text-danger">*</span></label>
                  <input v-model="form.phone" type="text" class="form-control bg-body text-body-emphasis" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold text-body-secondary small">Giới tính</label>
                  <select v-model="form.gender" class="form-select bg-body text-body-emphasis">
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="UNSPECIFIED">Không xác định</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold text-body-secondary small">Ngày sinh</label>
                  <input v-model="form.dob" type="date" class="form-control bg-body text-body-emphasis">
                </div>
              </div>
            </div>
            <div class="modal-footer bg-body border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary fw-semibold" @click="closeModal">Hủy bỏ</button>
              <button type="submit" class="btn btn-primary fw-bold" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Xác nhận Tạo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL CHI TIẾT NHÂN SỰ -->
    <div v-if="showDetailModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-id-card me-2"></i>Chi tiết Hồ sơ Nhân sự</h5>
            <button type="button" class="btn-close btn-close-white" @click="showDetailModal = false"></button>
          </div>
          <div class="modal-body p-4" v-if="selectedStaff">
            <div class="row g-3">
              <div class="col-12"><p class="mb-0"><strong>Mã ID:</strong> <span class="text-body-secondary">{{ selectedStaff.id }}</span></p></div>
              <div class="col-12"><p class="mb-0"><strong>Họ và tên:</strong> <span class="text-body-secondary">{{ selectedStaff.fullName }}</span></p></div>
              <div class="col-md-6"><p class="mb-0"><strong>Giới tính:</strong> <span class="text-body-secondary">{{ selectedStaff.gender === 'MALE' ? 'Nam' : (selectedStaff.gender === 'FEMALE' ? 'Nữ' : 'Khác') }}</span></p></div>
              <div class="col-12"><p class="mb-0"><strong>Email:</strong> <span class="text-body-secondary">{{ selectedStaff.email }}</span></p></div>
              <div class="col-md-6"><p class="mb-0"><strong>Số điện thoại:</strong> <span class="text-body-secondary">{{ selectedStaff.phone || 'Chưa cập nhật' }}</span></p></div>
              <div class="col-12"><p class="mb-0"><strong>Ngày vào làm:</strong> <span class="text-body-secondary">{{ formatDateTime(selectedStaff.employmentTime) }}</span></p></div>
              
              <div class="col-12">
                <hr class="my-2 border-secondary-subtle">
                <p class="mb-2">
                  <strong>Trạng thái làm việc:</strong> 
                  <span class="badge ms-2" :class="selectedStaff.workingStatus === 'WORKING' ? 'bg-success' : 'bg-danger'">
                    {{ selectedStaff.workingStatus === 'WORKING' ? 'Đang làm' : 'Đã nghỉ' }}
                  </span>
                </p>
                <p class="mb-0">
                  <strong>Trạng thái Tài khoản:</strong> 
                  <span class="badge ms-2" :class="selectedStaff.accountStatus === 'ACTIVE' ? 'bg-success' : 'bg-danger'">
                    {{ selectedStaff.accountStatus === 'ACTIVE' ? 'Đang mở' : 'Bị khóa' }}
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

const staffs = ref([])
const isLoading = ref(true)
const isProcessing = ref(false)
const showModal = ref(false)
const showDetailModal = ref(false)
const selectedStaff = ref(null)
const notification = ref({ type: '', message: '' })

const form = ref({
  firstName: '', lastName: '', email: '', phone: '', password: '', gender: 'MALE', dob: ''
})

// Các biến phục vụ Bộ lọc & Tìm kiếm
const searchQuery = ref('')
const filterWorkingStatus = ref('ALL') // ALL, WORKING, RESIGNED
const filterAccountStatus = ref('ALL') // ALL, ACTIVE, LOCKED

// Hàm làm mới bộ lọc (Reset button)
const resetFilters = () => {
  searchQuery.value = ''
  filterWorkingStatus.value = 'ALL'
  filterAccountStatus.value = 'ALL'
}

// Computed lọc danh sách Staff
const filteredStaffs = computed(() => {
  let result = staffs.value

  // Lọc theo Trạng thái Làm việc
  if (filterWorkingStatus.value !== 'ALL') {
    result = result.filter(s => s.workingStatus === filterWorkingStatus.value)
  }

  // Lọc theo Trạng thái Tài khoản
  if (filterAccountStatus.value !== 'ALL') {
    result = result.filter(s => s.accountStatus === filterAccountStatus.value)
  }

  // Tìm kiếm theo Tên hoặc Mã
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(s => 
      s.fullName?.toLowerCase().includes(q) || 
      s.id?.toString().toLowerCase().includes(q)
    )
  }

  return result
})

const formatDateTime = (val) => {
  if (!val) return 'N/A'
  return new Date(val).toLocaleString('vi-VN')
}

const showNotification = (type, message) => {
  notification.value = { type, message }
  setTimeout(() => notification.value.message = '', 5000)
}

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/manager/hr/staffs')
    staffs.value = res.data || []
  } catch (error) {
    showNotification('danger', 'Không thể tải danh sách nhân sự.')
  } finally {
    isLoading.value = false
  }
}

const viewDetails = (staff) => {
  selectedStaff.value = staff
  showDetailModal.value = true
}

const openCreateModal = () => {
  form.value = { firstName: '', lastName: '', email: '', phone: '', password: '', gender: 'MALE', dob: '' }
  showModal.value = true
}

const closeModal = () => showModal.value = false

const submitForm = async () => {
  if (form.value.password.length < 6) {
    showNotification('warning', 'Mật khẩu phải từ 6 ký tự trở lên.')
    return
  }
  isProcessing.value = true
  try {
    await api.post('/api/manager/hr/staffs', form.value)
    showNotification('success', 'Thêm nhân viên mới thành công!')
    closeModal()
    fetchData()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi khi tạo nhân viên.')
  } finally {
    isProcessing.value = false
  }
}

const toggleStatus = async (id, targetStatus) => {
  const confirmMsg = targetStatus === 'RESIGNED' 
    ? 'Hành động này sẽ khóa tài khoản đăng nhập của nhân viên. Bạn chắc chứ?' 
    : 'Nhân viên này sẽ đi làm lại và tài khoản sẽ được mở khóa?'
  
  if (!confirm(confirmMsg)) return

  try {
    await api.put(`/api/manager/hr/staffs/${id}/status`, { status: targetStatus })
    showNotification('success', 'Đã cập nhật trạng thái.')
    fetchData()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Có lỗi xảy ra.')
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
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
