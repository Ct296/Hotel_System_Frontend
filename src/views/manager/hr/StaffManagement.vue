<template>
  <div class="position-relative">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Hồ sơ Nhân sự (Lễ tân)</h3>
        <p class="text-muted small mb-0">Quản lý danh sách nhân viên cấp Staff, cấp tài khoản và trạng thái làm việc.</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary shadow-sm fw-bold">
        <i class="fas fa-user-plus me-2"></i> Thêm Nhân Viên Mới
      </button>
    </div>

    <!-- Thông báo -->
    <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
      {{ notification.message }}
      <button type="button" class="btn-close" @click="notification.message = ''"></button>
    </div>

    <!-- Bảng danh sách Staff -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="px-4 py-3">Nhân viên</th>
                <th class="py-3">Liên hệ</th>
                <th class="py-3 text-center">Giới tính</th>
                <th class="py-3 text-center">Trạng thái làm việc</th>
                <th class="py-3 text-center">Trạng thái TK</th>
                <th class="py-3 text-end px-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="6" class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></td>
              </tr>
              <tr v-else-if="staffs.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">Chưa có nhân viên nào.</td>
              </tr>
              <tr v-else v-for="s in staffs" :key="s.id">
                <td class="px-4">
                  <span class="fw-bold text-dark d-block">{{ s.fullName }}</span>
                  <span class="text-muted small">Mã: {{ s.id }}</span>
                </td>
                <td>
                  <div class="small"><i class="fas fa-envelope text-secondary me-1"></i> {{ s.email }}</div>
                  <div class="small"><i class="fas fa-phone-alt text-secondary me-1"></i> {{ s.phone }}</div>
                </td>
                <td class="text-center">
                  <i v-if="s.gender === 'MALE'" class="fas fa-mars text-primary" title="Nam"></i>
                  <i v-else-if="s.gender === 'FEMALE'" class="fas fa-venus text-danger" title="Nữ"></i>
                  <span v-else class="text-muted">-</span>
                </td>
                <td class="text-center">
                  <span :class="s.workingStatus === 'WORKING' ? 'bg-success' : 'bg-danger'" class="badge">
                    {{ s.workingStatus === 'WORKING' ? 'ĐANG LÀM' : 'ĐÃ NGHỈ' }}
                  </span>
                </td>
                <td class="text-center">
                  <span :class="s.accountStatus === 'ACTIVE' ? 'text-success' : 'text-danger'" class="fw-bold small">
                    <i :class="s.accountStatus === 'ACTIVE' ? 'fas fa-unlock' : 'fas fa-lock'"></i> 
                    {{ s.accountStatus === 'ACTIVE' ? 'Đang mở' : 'Bị khóa' }}
                  </span>
                </td>
                <td class="text-end px-4">
                  <!-- Nút thay đổi trạng thái làm việc -->
                  <button v-if="s.workingStatus === 'WORKING'" @click="toggleStatus(s.id, 'RESIGNED')" class="btn btn-sm btn-outline-danger shadow-sm" title="Cho nghỉ việc">
                    <i class="fas fa-user-times"></i> Cho nghỉ
                  </button>
                  <button v-else @click="toggleStatus(s.id, 'WORKING')" class="btn btn-sm btn-outline-success shadow-sm" title="Khôi phục đi làm">
                    <i class="fas fa-user-check"></i> Đi làm lại
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL THÊM STAFF -->
    <div v-if="showModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-user-plus me-2"></i>Thêm Lễ tân mới</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="submitForm">
            <div class="modal-body p-4">
              <div class="alert alert-info py-2 small mb-4">
                <i class="fas fa-info-circle me-1"></i> Tài khoản tạo ở đây sẽ được cấp quyền <b>STAFF</b> mặc định.
              </div>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Họ (Last Name) <span class="text-danger">*</span></label>
                  <input v-model="form.lastName" type="text" class="form-control" required placeholder="VD: Nguyễn Văn">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Tên (First Name) <span class="text-danger">*</span></label>
                  <input v-model="form.firstName" type="text" class="form-control" required placeholder="VD: A">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Email đăng nhập <span class="text-danger">*</span></label>
                  <input v-model="form.email" type="email" class="form-control" required placeholder="staff@ithotel.vn">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Mật khẩu cấp phát <span class="text-danger">*</span></label>
                  <input v-model="form.password" type="text" class="form-control" required placeholder="Tối thiểu 6 ký tự">
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-semibold">Số điện thoại <span class="text-danger">*</span></label>
                  <input v-model="form.phone" type="text" class="form-control" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Giới tính</label>
                  <select v-model="form.gender" class="form-select">
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="UNSPECIFIED">Không xác định</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Ngày sinh</label>
                  <input v-model="form.dob" type="date" class="form-control">
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary" @click="closeModal">Hủy bỏ</button>
              <button type="submit" class="btn btn-primary fw-bold" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Xác nhận Tạo
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
import api from '../../../utils/axios'

const staffs = ref([])
const isLoading = ref(true)
const isProcessing = ref(false)
const showModal = ref(false)
const notification = ref({ type: '', message: '' })

const form = ref({
  firstName: '', lastName: '', email: '', phone: '', password: '', gender: 'MALE', dob: ''
})

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