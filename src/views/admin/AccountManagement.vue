<template>
  <div class="position-relative">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold text-body-emphasis mb-0">Quản lý Tài khoản</h3>
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
          
          <!-- Nhóm trái: Filter + Search (Đã xóa nút Export) -->
          <div class="d-flex align-items-center gap-2 flex-wrap flex-grow-1">
            
            <!-- Nút Lọc Mở Rộng -->
            <div class="dropdown">
              <button class="btn btn-outline-secondary bg-body text-body-emphasis border-secondary-subtle px-3 shadow-sm d-flex align-items-center justify-content-center" style="height: 38px;" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-filter text-secondary"></i>
              </button>
              <div class="dropdown-menu shadow-lg border-0 p-3 rounded-4" style="width: 280px;">
                <h6 class="dropdown-header fw-bold text-body-emphasis px-0 mb-2">Bộ lọc tài khoản</h6>
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-body-secondary mb-1">Vai trò</label>
                  <select v-model="filterRole" class="form-select form-select-sm bg-body">
                    <option value="ALL">Mọi vai trò</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="STAFF">Staff</option>
                    <option value="CUSTOMER">Customer</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-body-secondary mb-1">Trạng thái khóa</label>
                  <select v-model="filterState" class="form-select form-select-sm bg-body">
                    <option value="ALL">Mọi trạng thái</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="LOCKED">Bị khóa</option>
                  </select>
                </div>
                <div>
                  <label class="form-label small fw-semibold text-body-secondary mb-1">Sắp xếp theo</label>
                  <select v-model="sortOption" class="form-select form-select-sm bg-body">
                    <option value="NEWEST">Ngày tạo: Mới nhất</option>
                    <option value="OLDEST">Ngày tạo: Cũ nhất</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Thanh tìm kiếm & Nút Làm Mới -->
            <div class="input-group shadow-sm" style="max-width: 320px;">
              <span class="input-group-text bg-body border-secondary-subtle text-secondary bg-transparent">
                <i class="fas fa-search"></i>
              </span>
              <input type="text" v-model="searchQuery" class="form-control bg-body border-secondary-subtle border-start-0 ps-0 shadow-none text-body-emphasis" placeholder="Tìm theo tên, email, CCCD...">
              <button @click="resetFilters" class="btn btn-outline-secondary bg-body border-secondary-subtle text-body-emphasis" type="button" title="Làm mới bộ lọc & tìm kiếm">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

          <!-- Nhóm phải: Nút Thêm mới -->
          <div>
            <button @click="openCreateModal" class="btn fw-bold px-4 shadow-sm" style="background-color: #6366f1; color: white; border: none; height: 38px;">
              <i class="fas fa-plus me-2"></i> THÊM TÀI KHOẢN MỚI
            </button>
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
                <th class="py-3 fw-bold border-0 text-uppercase">Họ và Tên</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-center">Vai trò</th>
                <th class="py-3 fw-bold border-0 text-uppercase">Email</th>
                <th class="py-3 fw-bold border-0 text-uppercase">SĐT</th>
                <th class="py-3 fw-bold border-0 text-uppercase">CCCD</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-center">Trạng thái TK</th>
                <th class="py-3 fw-bold border-0 text-end px-4"></th>
              </tr>
            </thead>
            <tbody class="bg-body border-top-0">
              <tr v-if="isLoading">
                <td colspan="8" class="text-center py-5 text-body-secondary">
                  <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div> Đang tải...
                </td>
              </tr>
              <tr v-else-if="filteredAndSortedAccounts.length === 0">
                <td colspan="8" class="text-center py-5 text-body-secondary">
                  <i class="fas fa-search-minus fs-2 mb-3 opacity-50"></i>
                  <p class="mb-0">Không tìm thấy tài khoản phù hợp.</p>
                </td>
              </tr>
              
              <tr v-else v-for="(acc, index) in filteredAndSortedAccounts" :key="acc.userId" class="table-row-hover border-bottom border-secondary-subtle">
                <td class="px-4 fw-bold text-body-emphasis">{{ String(index + 1).padStart(2, '0') }}</td>
                <td class="text-body-emphasis fw-semibold">{{ acc.fullName }}</td>
                <td class="text-center">
                  <span class="badge rounded-pill fw-bold" :class="getRoleBadgeClass(acc.role)">
                    {{ acc.role }}
                  </span>
                </td>
                <td class="text-body-secondary">{{ acc.email }}</td>
                <td class="text-body-secondary fw-semibold">{{ acc.phoneNumber || 'N/A' }}</td>
                <td class="text-body-secondary">{{ acc.pid || 'N/A' }}</td>
                <td class="text-center">
                  <span class="badge rounded-pill fw-bold" :class="acc.state === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'">
                    {{ acc.state === 'ACTIVE' ? 'ĐANG HOẠT ĐỘNG' : 'BỊ KHÓA' }}
                  </span>
                </td>
                <td class="text-end px-4">
                  <div class="dropdown">
                    <button class="btn btn-link text-body-secondary p-0 shadow-none fs-5" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="fas fa-list"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm border-secondary-subtle rounded-3">
                      <li>
                        <button class="dropdown-item fw-semibold text-info py-2" @click="viewDetails(acc)">
                          <i class="fas fa-eye me-2"></i> Xem chi tiết
                        </button>
                      </li>
                      <li v-if="acc.role === 'MANAGER'">
                        <button class="dropdown-item fw-semibold text-warning py-2" @click="openUpdateStatusModal(acc)">
                          <i class="fas fa-briefcase me-2"></i> Đổi trạng thái làm việc
                        </button>
                      </li>
                      <li v-if="acc.state === 'LOCKED'">
                        <button class="dropdown-item fw-semibold text-success py-2" @click="openUnlockModal(acc)">
                          <i class="fas fa-unlock me-2"></i> Mở khóa tài khoản
                        </button>
                      </li>
                      <li v-else>
                        <button class="dropdown-item fw-semibold text-danger py-2" @click="openLockModal(acc)" :disabled="acc.role === 'ADMIN'">
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

    <!-- ==================== CÁC MODALS ==================== -->
    
    <!-- MODAL TẠO TÀI KHOẢN -->
    <div v-if="showCreateModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-user-plus me-2"></i>Tạo tài khoản Nhân sự</h5>
            <button type="button" class="btn-close btn-close-white" @click="showCreateModal = false"></button>
          </div>
          <form @submit.prevent="submitCreate">
            <div class="modal-body p-4" style="max-height: 75vh; overflow-y: auto;">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary small">Họ (Last Name) <span class="text-danger">*</span></label>
                  <input v-model="formCreate.lastName" type="text" class="form-control bg-body text-body-emphasis" required placeholder="Ví dụ: Nguyễn Văn">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary small">Tên (First Name) <span class="text-danger">*</span></label>
                  <input v-model="formCreate.firstName" type="text" class="form-control bg-body text-body-emphasis" required placeholder="Ví dụ: A">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary small">Ngày sinh <span class="text-danger">*</span></label>
                  <input v-model="formCreate.dateOfBirth" type="date" class="form-control bg-body text-body-emphasis" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary small">Giới tính <span class="text-danger">*</span></label>
                  <select v-model="formCreate.sex" class="form-select bg-body text-body-emphasis" required>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary small">CCCD / CMND <span class="text-danger">*</span></label>
                  <input v-model="formCreate.pid" type="text" class="form-control bg-body text-body-emphasis" required placeholder="Nhập số CCCD...">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary small">Số điện thoại <span class="text-danger">*</span></label>
                  <input v-model="formCreate.phoneNumber" type="text" class="form-control bg-body text-body-emphasis" required placeholder="09xxxxxxxxx">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary small">Email làm việc <span class="text-danger">*</span></label>
                  <input v-model="formCreate.email" type="email" class="form-control bg-body text-body-emphasis" required placeholder="nv.a@ithotel.vn">
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary small">Quốc tịch <span class="text-danger">*</span></label>
                  <select v-model="formCreate.nationality" class="form-select bg-body text-body-emphasis" required>
                    <option v-for="nation in nationalityList" :key="nation" :value="nation">{{ nation }}</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary small">Vai trò <span class="text-danger">*</span></label>
                  <select v-model="formCreate.role" class="form-select bg-body text-body-emphasis" required>
                    <option value="STAFF">Nhân viên (Lễ tân/Buồng phòng)</option>
                    <option value="MANAGER">Quản lý (Manager)</option>
                  </select>
                </div>
                
                <div v-if="formCreate.role === 'MANAGER'" class="col-md-6">
                  <label class="form-label fw-semibold text-body-secondary small">Cấp quản lý <span class="text-danger">*</span></label>
                  <select v-model="formCreate.managerType" class="form-select bg-body text-body-emphasis" required>
                    <option value="" disabled>-- Chọn cấp quản lý --</option>
                    <option v-for="type in managerTypes" :key="type" :value="type">{{ type }}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer bg-body border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary fw-semibold" @click="showCreateModal = false">Hủy bỏ</button>
              <button type="submit" class="btn btn-primary fw-bold" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Xác nhận Tạo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL CHI TIẾT TÀI KHOẢN -->
    <div v-if="showDetailModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-id-card me-2"></i>Chi tiết Tài khoản</h5>
            <button type="button" class="btn-close btn-close-white" @click="showDetailModal = false"></button>
          </div>
          <div class="modal-body p-4" v-if="selectedAccount">
            <div class="row g-3">
              <div class="col-12"><p class="mb-0"><strong>Mã ID:</strong> <span class="text-body-secondary">{{ selectedAccount.userId }}</span></p></div>
              <div class="col-12"><p class="mb-0"><strong>Họ và tên:</strong> <span class="text-body-secondary">{{ selectedAccount.fullName }}</span></p></div>
              <div class="col-12"><p class="mb-0"><strong>Vai trò:</strong> <span class="badge bg-primary ms-2">{{ selectedAccount.role }}</span></p></div>
              <div class="col-12" v-if="selectedAccount.role === 'MANAGER'">
                <p class="mb-0"><strong>Chức danh quản lý:</strong> <span class="badge bg-dark ms-2">{{ getManagerTitleDisplay(selectedAccount.managerTitle) }}</span></p>
              </div>
              <div class="col-12"><p class="mb-0"><strong>Email:</strong> <span class="text-body-secondary">{{ selectedAccount.email }}</span></p></div>
              <div class="col-md-6"><p class="mb-0"><strong>Số điện thoại:</strong> <span class="text-body-secondary">{{ selectedAccount.phoneNumber || 'Chưa cập nhật' }}</span></p></div>
              <div class="col-md-6"><p class="mb-0"><strong>CCCD/Hộ chiếu:</strong> <span class="text-body-secondary">{{ selectedAccount.pid || 'Chưa cập nhật' }}</span></p></div>
              <div class="col-md-6"><p class="mb-0"><strong>Ngày sinh:</strong> <span class="text-body-secondary">{{ selectedAccount.dateOfBirth || 'Chưa cập nhật' }}</span></p></div>
              <div class="col-md-6"><p class="mb-0"><strong>Giới tính:</strong> <span class="text-body-secondary">{{ selectedAccount.sex === 'MALE' ? 'Nam' : (selectedAccount.sex === 'FEMALE' ? 'Nữ' : 'Khác') }}</span></p></div>
              <div class="col-12"><p class="mb-0"><strong>Quốc tịch:</strong> <span class="text-body-secondary">{{ selectedAccount.nationality || 'Chưa cập nhật' }}</span></p></div>
              <div class="col-12"><p class="mb-0"><strong>Ngày tạo:</strong> <span class="text-body-secondary">{{ formatDateTime(selectedAccount.createDate) }}</span></p></div>
              
              <div class="col-12" v-if="selectedAccount.workingStatus">
                <hr class="my-2 border-secondary-subtle">
                <p class="mb-0">
                  <strong>Tình trạng công việc:</strong> 
                  <span class="badge ms-2" :class="selectedAccount.workingStatus === 'WORKING' ? 'bg-success' : 'bg-secondary'">
                    {{ selectedAccount.workingStatus === 'WORKING' ? 'Đang làm việc' : 'Đã nghỉ' }}
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

    <!-- MODAL CẬP NHẬT TRẠNG THÁI MANAGER -->
    <div v-if="showUpdateStatusModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title fw-bold"><i class="fas fa-briefcase me-2"></i>Cập nhật trạng thái làm việc</h5>
            <button type="button" class="btn-close" @click="showUpdateStatusModal = false"></button>
          </div>
          <form @submit.prevent="submitUpdateStatus">
            <div class="modal-body p-4">
              <p class="text-body-emphasis">Quản lý: <strong class="text-primary">{{ currentTarget.fullName }}</strong></p>
              <div class="mb-3">
                <label class="form-label fw-semibold text-body-secondary small">Trạng thái công việc <span class="text-danger">*</span></label>
                <select v-model="formUpdateStatus.workingStatus" class="form-select bg-body text-body-emphasis" required>
                  <option value="WORKING">Đang làm việc</option>
                  <option value="SUSPENDED">Đình chỉ / Nghỉ tạm thời</option>
                  <option value="RESIGNED">Đã nghỉ việc</option>
                </select>
              </div>
              <div class="alert alert-info py-2 small mb-0">
                <i class="fas fa-info-circle me-1"></i> Theo cấu hình hệ thống, nếu chọn "Đình chỉ" hoặc "Đã nghỉ", tài khoản này sẽ tự động bị khóa.
              </div>
            </div>
            <div class="modal-footer bg-body border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary fw-semibold" @click="showUpdateStatusModal = false">Hủy</button>
              <button type="submit" class="btn btn-warning fw-bold" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Xác nhận
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL KHÓA -->
    <div v-if="showLockModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-lock me-2"></i>Khóa tài khoản</h5>
            <button type="button" class="btn-close btn-close-white" @click="showLockModal = false"></button>
          </div>
          <form @submit.prevent="submitLock">
            <div class="modal-body p-4">
              <p class="text-body-emphasis">Bạn đang thao tác khóa tài khoản: <strong class="text-danger">{{ currentTarget.fullName }}</strong></p>
              <div class="mb-3">
                <label class="form-label fw-semibold text-body-secondary small">Thời gian khóa <span class="text-danger">*</span></label>
                <select v-model="formLock.durationDays" class="form-select bg-body text-body-emphasis" required>
                  <option :value="1">1 Ngày</option>
                  <option :value="3">3 Ngày</option>
                  <option :value="7">7 Ngày</option>
                  <option :value="30">30 Ngày</option>
                  <option :value="-1">Khóa vĩnh viễn (-1)</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold text-body-secondary small">Lý do khóa <span class="text-body-secondary opacity-50 fw-normal">(Tùy chọn)</span></label>
                <textarea v-model="formLock.reason" class="form-control bg-body text-body-emphasis" rows="3" placeholder="Nhập lý do vi phạm..."></textarea>
              </div>
            </div>
            <div class="modal-footer bg-body border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary fw-semibold" @click="showLockModal = false">Hủy</button>
              <button type="submit" class="btn btn-danger fw-bold" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Xác nhận Khóa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL MỞ KHÓA -->
    <div v-if="showUnlockModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-unlock me-2"></i>Mở khóa tài khoản</h5>
            <button type="button" class="btn-close btn-close-white" @click="showUnlockModal = false"></button>
          </div>
          <form @submit.prevent="submitUnlock">
            <div class="modal-body p-4">
              <p class="text-body-emphasis">Xác nhận mở khóa cho tài khoản: <strong class="text-success">{{ currentTarget.fullName }}</strong>?</p>
              <div class="mb-3">
                <label class="form-label fw-semibold text-body-secondary small">Ghi chú mở khóa <span class="text-body-secondary opacity-50 fw-normal">(Không bắt buộc)</span></label>
                <textarea v-model="formUnlock.reason" class="form-control bg-body text-body-emphasis" rows="3" placeholder="Nhập lý do..."></textarea>
              </div>
            </div>
            <div class="modal-footer bg-body border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary fw-semibold" @click="showUnlockModal = false">Hủy</button>
              <button type="submit" class="btn btn-success fw-bold" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Xác nhận Mở
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../utils/axios'

const accounts = ref([])
const managerTypes = ref([])
const isLoading = ref(true)
const isProcessing = ref(false)

// Danh sách quốc tịch chuẩn
const nationalityList = ref([
  'Việt Nam', 'Mỹ', 'Anh', 'Pháp', 'Đức', 'Nhật Bản', 'Hàn Quốc', 
  'Trung Quốc', 'Đài Loan', 'Thái Lan', 'Singapore', 'Malaysia', 'Úc', 'Canada', 'Khác'
])

const notification = ref({ type: '', message: '' })
const showNotification = (type, message) => {
  notification.value = { type, message }
  setTimeout(() => notification.value.message = '', 5000)
}

// BỘ LỌC VÀ TÌM KIẾM
const searchQuery = ref('')
const filterRole = ref('ALL')
const filterState = ref('ALL')
const sortOption = ref('NEWEST')

const resetFilters = () => {
  searchQuery.value = ''
  filterRole.value = 'ALL'
  filterState.value = 'ALL'
  sortOption.value = 'NEWEST'
}

const filteredAndSortedAccounts = computed(() => {
  let result = accounts.value

  if (filterRole.value !== 'ALL') {
    result = result.filter(a => a.role === filterRole.value)
  }

  if (filterState.value !== 'ALL') {
    result = result.filter(a => a.state === filterState.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(a => 
      a.fullName?.toLowerCase().includes(q) || 
      a.email?.toLowerCase().includes(q) ||
      a.pid?.toLowerCase().includes(q)
    )
  }

  if (sortOption.value === 'NEWEST') {
    result = result.slice().sort((a, b) => new Date(b.createDate) - new Date(a.createDate))
  } else if (sortOption.value === 'OLDEST') {
    result = result.slice().sort((a, b) => new Date(a.createDate) - new Date(b.createDate))
  }

  return result
})

const getRoleBadgeClass = (role) => {
  switch(role) {
    case 'ADMIN': return 'bg-danger-subtle text-danger'
    case 'MANAGER': return 'bg-primary-subtle text-primary'
    case 'STAFF': return 'bg-info-subtle text-info'
    case 'CUSTOMER': return 'bg-secondary-subtle text-secondary'
    default: return 'bg-light text-dark'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const d = new Date(dateString)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatDateTime = (val) => {
  if (!val) return 'N/A'
  return new Date(val).toLocaleString('vi-VN')
}

// Map chức danh Manager sang tiếng Việt
const getManagerTitleDisplay = (titleCode) => {
  if (!titleCode) return 'Chưa cập nhật';
  const titleMap = {
    'HR_MANAGER': 'Quản lý nhân sự',
    'OPERATION_MANAGER': 'Quản lý vận hành',
    'CUSTOMER_MANAGER': 'Quản lý khách hàng'
  };
  return titleMap[titleCode] || titleCode;
};

// State Quản lý Modals
const showCreateModal = ref(false)
const showLockModal = ref(false)
const showUnlockModal = ref(false)
const showDetailModal = ref(false)
const showUpdateStatusModal = ref(false)

const currentTarget = ref({})
const selectedAccount = ref(null)

// Data Forms
const formCreate = ref({ 
  firstName: '', lastName: '', dateOfBirth: '', sex: 'MALE', pid: '', phoneNumber: '', email: '', nationality: 'Việt Nam', role: 'STAFF', managerType: '' 
})
const formLock = ref({ durationDays: -1, reason: '' })
const formUnlock = ref({ reason: '' })
const formUpdateStatus = ref({ workingStatus: 'WORKING' })

const fetchAccounts = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/admin/dashboard')
    accounts.value = response.data.accounts
    managerTypes.value = response.data.managerTypes 
  } catch (error) {
    showNotification('danger', 'Không thể tải danh sách tài khoản.')
  } finally {
    isLoading.value = false
  }
}

const viewDetails = (account) => {
  selectedAccount.value = account
  showDetailModal.value = true
}

const openUpdateStatusModal = (acc) => {
  currentTarget.value = acc
  formUpdateStatus.value.workingStatus = acc.workingStatus || 'WORKING'
  showUpdateStatusModal.value = true
}

const submitUpdateStatus = async () => {
  isProcessing.value = true
  try {
    await api.post(`/api/admin/managers/${currentTarget.value.userId}/update-status`, { 
      workingStatus: formUpdateStatus.value.workingStatus 
    })
    showNotification('success', `Đã cập nhật trạng thái làm việc cho ${currentTarget.value.fullName}.`)
    showUpdateStatusModal.value = false
    fetchAccounts()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Có lỗi xảy ra khi cập nhật trạng thái.')
  } finally {
    isProcessing.value = false
  }
}

const openCreateModal = () => {
  formCreate.value = { 
    firstName: '', lastName: '', dateOfBirth: '', sex: 'MALE', pid: '', phoneNumber: '', email: '', nationality: 'Việt Nam', role: 'STAFF', managerType: '' 
  }
  showCreateModal.value = true
}

const submitCreate = async () => {
  isProcessing.value = true
  try {
    await api.post('/api/admin/accounts/create', formCreate.value)
    showNotification('success', 'Tạo tài khoản mới thành công!')
    showCreateModal.value = false
    fetchAccounts()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Có lỗi xảy ra khi tạo tài khoản.')
  } finally {
    isProcessing.value = false
  }
}

const openLockModal = (acc) => {
  currentTarget.value = acc
  formLock.value = { durationDays: -1, reason: '' }
  showLockModal.value = true
}

const submitLock = async () => {
  isProcessing.value = true
  try {
    await api.post(`/api/admin/accounts/${currentTarget.value.userId}/lock`, formLock.value)
    showNotification('success', `Đã khóa tài khoản ${currentTarget.value.fullName} thành công!`)
    showLockModal.value = false
    fetchAccounts()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Có lỗi xảy ra khi khóa tài khoản.')
  } finally {
    isProcessing.value = false
  }
}

const openUnlockModal = (acc) => {
  currentTarget.value = acc
  formUnlock.value = { reason: '' }
  showUnlockModal.value = true
}

const submitUnlock = async () => {
  isProcessing.value = true
  try {
    await api.post(`/api/admin/accounts/${currentTarget.value.userId}/unlock`, { reason: formUnlock.value.reason })
    showNotification('success', `Đã mở khóa tài khoản ${currentTarget.value.fullName}.`)
    showUnlockModal.value = false
    fetchAccounts()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Có lỗi xảy ra khi mở khóa.')
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => {
  fetchAccounts()
})
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

.modal-body::-webkit-scrollbar { width: 6px; }
.modal-body::-webkit-scrollbar-thumb { background-color: var(--bs-secondary-bg); border-radius: 4px; }
</style>
