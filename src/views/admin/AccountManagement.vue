<template>
  <div class="position-relative">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold text-dark mb-0">Quản lý Tài khoản</h3>
      <button @click="openCreateModal" class="btn btn-primary shadow-sm">
        <i class="fas fa-plus me-2"></i> Tạo tài khoản mới
      </button>
    </div>

    <!-- Thông báo Alert -->
    <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
      {{ notification.message }}
      <button type="button" class="btn-close" @click="notification.message = ''"></button>
    </div>

    <!-- Bảng danh sách tài khoản -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="px-4 py-3">Họ Tên</th>
                <th class="py-3">Email</th>
                <th class="py-3">Vai trò</th>
                <th class="py-3">Trạng thái</th>
                <th class="py-3 text-end px-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="5" class="text-center py-4">
                  <div class="spinner-border text-primary spinner-border-sm" role="status"></div> Đang tải...
                </td>
              </tr>
              <tr v-else v-for="acc in accounts" :key="acc.userId">
                <td class="px-4 fw-semibold">{{ acc.fullName }}</td>
                <td class="text-muted">{{ acc.email }}</td>
                <td><span class="badge bg-secondary">{{ acc.role }}</span></td>
                <td>
                  <span :class="acc.state === 'ACTIVE' ? 'badge bg-success' : 'badge bg-danger'">
                    {{ acc.state }}
                  </span>
                </td>
                <td class="text-end px-4">
                  <button v-if="acc.state === 'LOCKED'" @click="openUnlockModal(acc)" class="btn btn-sm btn-success shadow-sm me-2">
                    <i class="fas fa-unlock"></i> Mở khóa
                  </button>
                  <button v-else @click="openLockModal(acc)" class="btn btn-sm btn-outline-danger shadow-sm me-2" :disabled="acc.role === 'ADMIN'">
                    <i class="fas fa-lock"></i> Khóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL TẠO TÀI KHOẢN ==================== -->
    <div v-if="showCreateModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-user-plus me-2"></i>Tạo tài khoản Nhân sự</h5>
            <button type="button" class="btn-close btn-close-white" @click="showCreateModal = false"></button>
          </div>
          <form @submit.prevent="submitCreate">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Họ đệm <span class="text-danger">*</span></label>
                  <input v-model="formCreate.lastName" type="text" class="form-control" required placeholder="Nguyễn Văn">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Tên <span class="text-danger">*</span></label>
                  <input v-model="formCreate.firstName" type="text" class="form-control" required placeholder="A">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Ngày sinh <span class="text-danger">*</span></label>
                  <input v-model="formCreate.dateOfBirth" type="date" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Giới tính <span class="text-danger">*</span></label>
                  <select v-model="formCreate.sex" class="form-select" required>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">CCCD / CMND <span class="text-danger">*</span></label>
                  <input v-model="formCreate.pid" type="text" class="form-control" required placeholder="Nhập số CCCD...">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Số điện thoại <span class="text-danger">*</span></label>
                  <input v-model="formCreate.phoneNumber" type="text" class="form-control" required placeholder="09xxxxxxxxx">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Email làm việc <span class="text-danger">*</span></label>
                  <input v-model="formCreate.email" type="email" class="form-control" required placeholder="nv.a@ithotel.vn">
                </div>

                <!-- MENU THẢ XUỐNG CHỌN QUỐC TỊCH -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Quốc tịch <span class="text-danger">*</span></label>
                  <select v-model="formCreate.nationality" class="form-select" required>
                    <option v-for="nation in nationalityList" :key="nation" :value="nation">{{ nation }}</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Vai trò <span class="text-danger">*</span></label>
                  <select v-model="formCreate.role" class="form-select" required>
                    <option value="STAFF">Nhân viên (Lễ tân/Buồng phòng)</option>
                    <option value="MANAGER">Quản lý (Manager)</option>
                  </select>
                </div>
                
                <!-- Chỉ hiện Cấp quản lý nếu Vai trò là MANAGER -->
                <div v-if="formCreate.role === 'MANAGER'" class="col-md-6">
                  <label class="form-label fw-semibold">Cấp quản lý <span class="text-danger">*</span></label>
                  <select v-model="formCreate.managerType" class="form-select" required>
                    <option value="" disabled>-- Chọn cấp quản lý --</option>
                    <option v-for="type in managerTypes" :key="type" :value="type">{{ type }}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" @click="showCreateModal = false">Hủy bỏ</button>
              <button type="submit" class="btn btn-primary fw-bold" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Xác nhận Tạo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL KHÓA ==================== -->
    <div v-if="showLockModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-lock me-2"></i>Khóa tài khoản</h5>
            <button type="button" class="btn-close btn-close-white" @click="showLockModal = false"></button>
          </div>
          <form @submit.prevent="submitLock">
            <div class="modal-body">
              <p>Bạn đang thao tác khóa tài khoản: <strong class="text-danger">{{ currentTarget.fullName }}</strong></p>
              <div class="mb-3">
                <label class="form-label fw-semibold">Thời gian khóa <span class="text-danger">*</span></label>
                <select v-model="formLock.durationDays" class="form-select" required>
                  <option :value="1">1 Ngày</option>
                  <option :value="3">3 Ngày</option>
                  <option :value="7">7 Ngày</option>
                  <option :value="30">30 Ngày</option>
                  <option :value="-1">Khóa vĩnh viễn (-1)</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Lý do khóa <span class="text-muted fw-normal">(Tùy chọn)</span></label>
                <textarea v-model="formLock.reason" class="form-control" rows="3" placeholder="Nhập lý do vi phạm..."></textarea>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" @click="showLockModal = false">Hủy</button>
              <button type="submit" class="btn btn-danger fw-bold" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Xác nhận Khóa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL MỞ KHÓA ==================== -->
    <div v-if="showUnlockModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-unlock me-2"></i>Mở khóa tài khoản</h5>
            <button type="button" class="btn-close btn-close-white" @click="showUnlockModal = false"></button>
          </div>
          <form @submit.prevent="submitUnlock">
            <div class="modal-body">
              <p>Xác nhận mở khóa cho tài khoản: <strong class="text-success">{{ currentTarget.fullName }}</strong>?</p>
              <div class="mb-3">
                <label class="form-label fw-semibold">Ghi chú mở khóa <span class="text-muted fw-normal">(Không bắt buộc)</span></label>
                <textarea v-model="formUnlock.reason" class="form-control" rows="3" placeholder="Nhập lý do..."></textarea>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" @click="showUnlockModal = false">Hủy</button>
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
import { ref, onMounted } from 'vue'
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

// State Quản lý Modals
const showCreateModal = ref(false)
const showLockModal = ref(false)
const showUnlockModal = ref(false)
const currentTarget = ref({})

// Data Forms
const formCreate = ref({ 
  firstName: '', 
  lastName: '', 
  dateOfBirth: '', 
  sex: 'MALE', 
  pid: '', 
  phoneNumber: '', 
  email: '', 
  nationality: 'Việt Nam', 
  role: 'STAFF', 
  managerType: '' 
})

const formLock = ref({ durationDays: -1, reason: '' })
const formUnlock = ref({ reason: '' })

// Lấy dữ liệu danh sách & config
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

// --- THAO TÁC TẠO TÀI KHOẢN ---
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

// --- THAO TÁC KHÓA TÀI KHOẢN ---
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

// --- THAO TÁC MỞ KHÓA TÀI KHOẢN ---
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