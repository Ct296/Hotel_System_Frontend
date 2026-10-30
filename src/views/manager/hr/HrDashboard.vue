<template>
  <div class="position-relative">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-body-emphasis mb-1">Tổng quan Nhân sự & Phân ca</h3>
        <p class="text-body-secondary small mb-0">Quản lý lịch làm việc và phân công nhân sự Lễ tân.</p>
      </div>
    </div>

    <!-- HỘP THÔNG BÁO XỊN XÒ TỰ ĐỘNG TẮT SAU 3S -->
    <div v-if="notification.message" :class="`alert alert-${notification.type} shadow-sm mb-4 fw-bold text-center border-0`">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle me-1' : 'fas fa-exclamation-triangle me-1'"></i>
      {{ notification.message }}
    </div>

    <!-- Thống kê nhanh -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white h-100 rounded-4">
          <div class="card-body">
            <h6 class="text-uppercase mb-2 opacity-75 small fw-bold">Tổng Nhân Sự</h6>
            <h3 class="mb-0 fw-bold">{{ dashboardData.staffCount || 0 }} <i class="fas fa-users float-end opacity-50"></i></h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white h-100 rounded-4">
          <div class="card-body">
            <h6 class="text-uppercase mb-2 opacity-75 small fw-bold">Ca Làm Tháng Này</h6>
            <h3 class="mb-0 fw-bold">{{ dashboardData.scheduleCount || 0 }} <i class="fas fa-calendar-alt float-end opacity-50"></i></h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark h-100 rounded-4">
          <div class="card-body">
            <h6 class="text-uppercase mb-2 opacity-75 small fw-bold opacity-75">Đang Phân Công</h6>
            <h3 class="mb-0 fw-bold">{{ dashboardData.activeAssignmentCount || 0 }} <i class="fas fa-user-clock float-end opacity-50"></i></h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-danger text-white h-100 rounded-4">
          <div class="card-body">
            <h6 class="text-uppercase mb-2 opacity-75 small fw-bold">Vắng Mặt / Trễ</h6>
            <h3 class="mb-0 fw-bold">{{ dashboardData.missedAttendanceCount || 0 }} <i class="fas fa-exclamation-circle float-end opacity-50"></i></h3>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Cột Trái: Lịch -->
      <div class="col-md-5">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold mb-0 text-primary">
              <i class="fas fa-calendar-day me-2"></i> {{ dashboardData.monthTitle || 'Lịch làm việc' }}
            </h5>
            <div>
              <input type="month" v-model="selectedMonth" @change="fetchDashboard" class="form-control form-control-sm shadow-sm bg-body text-body-emphasis border-secondary-subtle">
            </div>
          </div>
          <div class="card-body">
            <!-- Vẽ Lịch (Grid) -->
            <div class="table-responsive">
              <table class="table table-bordered text-center calendar-table border-secondary-subtle">
                <thead class="table-secondary">
                  <tr>
                    <th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>T6</th><th>T7</th><th>CN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(week, wIndex) in dashboardData.calendarWeeks" :key="wIndex">
                    <td v-for="(day, dIndex) in week" :key="dIndex" 
                        @click="selectDate(day.value)"
                        :class="[
                          'calendar-day bg-body', 
                          !day.inCurrentMonth ? 'text-body-secondary opacity-50' : 'fw-semibold text-body-emphasis',
                          dashboardData.selectedDateValue === day.value ? 'bg-primary text-white selected-day' : ''
                        ]">
                      <div class="d-flex flex-column align-items-center justify-content-center h-100">
                        <span>{{ day.dayNumber }}</span>
                        <div v-if="day.hasSchedule" class="dot mt-1" :class="dashboardData.selectedDateValue === day.value ? 'bg-white' : 'bg-success'"></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Cột Phải: Danh sách ca làm của ngày được chọn -->
      <div class="col-md-7">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
          <div class="card-header bg-transparent border-0 pt-4 pb-3 d-flex justify-content-between align-items-center border-bottom border-secondary-subtle">
            <h5 class="fw-bold mb-0 text-body-emphasis">
              Chi tiết ngày: <span class="text-primary">{{ dashboardData.selectedDateLabel || 'Đang tải...' }}</span>
            </h5>
            <button @click="openCreateScheduleModal" class="btn btn-sm btn-primary shadow-sm fw-bold">
              <i class="fas fa-plus me-1"></i> Tạo Ca Mới
            </button>
          </div>
          <div class="card-body bg-body rounded-bottom-4">
            <div v-if="!dashboardData.selectedDateSchedules || dashboardData.selectedDateSchedules.length === 0" class="text-center py-5 text-body-secondary">
              <i class="fas fa-bed fa-3x mb-3 opacity-25"></i>
              <p>Chưa có ca làm việc nào trong ngày này.</p>
            </div>

            <!-- Vòng lặp hiển thị các ca -->
            <div v-for="schedule in dashboardData.selectedDateSchedules" :key="schedule.scheduleId" class="card border-0 shadow-sm rounded-3 mb-3 bg-body-tertiary">
              <div class="card-header bg-transparent border-bottom-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                <h6 class="fw-bold text-body-emphasis mb-0">
                  <i class="fas fa-clock text-warning me-2"></i> Ca: <span class="text-uppercase text-primary">{{ schedule.shift }}</span>
                </h6>
                <div>
                  <button @click="openAssignModal(schedule.scheduleId)" class="btn btn-sm btn-outline-success rounded-pill me-2">
                    <i class="fas fa-user-plus"></i> Phân công
                  </button>
                  <button @click="deleteSchedule(schedule.scheduleId)" class="btn btn-sm btn-outline-danger rounded-pill">
                    <i class="fas fa-trash-alt"></i> Xóa ca
                  </button>
                </div>
              </div>
              <div class="card-body">
                <ul class="list-group list-group-flush bg-transparent">
                  <li v-if="!schedule.staffs || schedule.staffs.length === 0" class="list-group-item bg-transparent text-body-secondary small text-center border-0">
                    Chưa có nhân viên nào được phân công.
                  </li>
                  <li v-for="assign in schedule.staffs" :key="assign.assignmentId" class="list-group-item bg-transparent d-flex justify-content-between align-items-center border-0 px-0">
                    <div>
                      <span class="fw-semibold text-body-emphasis">{{ assign.fullName }}</span>
                      <small class="text-body-secondary d-block"><i class="fas fa-sticky-note me-1"></i> {{ assign.note || 'Không có ghi chú' }}</small>
                    </div>
                    
                    <div class="d-flex align-items-center">
                      <span :class="assign.statusClass" class="me-3 shadow-sm">{{ assign.statusText }}</span>
                      <button @click="removeAssignment(assign.assignmentId)" class="btn btn-sm text-danger" title="Gỡ phân công">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL TẠO CA -->
    <div v-if="showScheduleModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold">Tạo ca làm việc</h5>
            <button type="button" class="btn-close btn-close-white" @click="showScheduleModal = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label fw-semibold text-body-secondary small">Ngày làm việc</label>
              <input type="date" v-model="newSchedule.date" class="form-control bg-body text-body-emphasis">
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold text-body-secondary small">Chọn Ca <span class="text-danger">*</span></label>
              <select v-model="newSchedule.shift" class="form-select bg-body text-body-emphasis">
                <option value="NIGHT">Ca Khuya (00:00 - 06:00)</option>
                <option value="MORNING">Ca Sáng (06:00 - 12:00)</option>
                <option value="AFTERNOON">Ca Chiều (12:00 - 18:00)</option>
                <option value="EVENING">Ca Tối (18:00 - 24:00)</option>
              </select>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button class="btn btn-secondary" @click="showScheduleModal = false">Hủy</button>
            <button class="btn btn-primary fw-bold" @click="submitCreateSchedule">Xác nhận tạo</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL PHÂN CÔNG NHÂN VIÊN -->
    <div v-if="showAssignModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title fw-bold">Phân công nhân sự</h5>
            <button type="button" class="btn-close btn-close-white" @click="showAssignModal = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label fw-semibold text-body-secondary small">Chọn Nhân Viên (Lễ Tân) <span class="text-danger">*</span></label>
              <select v-model="assignForm.staffId" class="form-select bg-body text-body-emphasis">
                <option value="">-- Chọn nhân viên --</option>
                <option v-for="staff in dashboardData.staffs" :key="staff.id" :value="staff.id">
                   {{ staff.user?.lastName }} {{ staff.user?.firstName }} - {{ staff.id }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold text-body-secondary small">Ghi chú công việc</label>
              <textarea v-model="assignForm.note" class="form-control bg-body text-body-emphasis" rows="2" placeholder="Nhiệm vụ cụ thể (nếu có)..."></textarea>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button class="btn btn-secondary" @click="showAssignModal = false">Hủy</button>
            <button class="btn btn-success fw-bold" @click="submitAssignStaff">Lưu phân công</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../../utils/axios'

const dashboardData = ref({})
const selectedMonth = ref('')
const selectedDate = ref('')

const notification = ref({ type: '', message: '' })
const showNotification = (type, message) => {
  notification.value = { type, message }
  setTimeout(() => notification.value.message = '', 3000) 
}

const showScheduleModal = ref(false)
const newSchedule = ref({ date: '', shift: 'MORNING' })

const showAssignModal = ref(false)
const assignForm = ref({ workScheduleId: '', staffId: '', note: '' })

const fetchDashboard = async () => {
  try {
    let url = '/api/manager/hr/dashboard'
    const params = new URLSearchParams()
    if (selectedMonth.value) params.append('month', selectedMonth.value)
    if (selectedDate.value) params.append('selectedDate', selectedDate.value)
    
    const res = await api.get(`${url}?${params.toString()}`)
    dashboardData.value = res.data
    selectedMonth.value = res.data.monthValue 
    selectedDate.value = res.data.selectedDateValue
  } catch (error) {
    showNotification('danger', 'Lỗi khi tải dữ liệu từ máy chủ.')
  }
}

const selectDate = (dateString) => {
  selectedDate.value = dateString
  fetchDashboard()
}

const openCreateScheduleModal = () => {
  newSchedule.value.date = dashboardData.value.selectedDateValue
  newSchedule.value.shift = 'MORNING'
  showScheduleModal.value = true
}

const submitCreateSchedule = async () => {
  try {
    await api.post('/api/manager/hr/work-schedules', newSchedule.value)
    showScheduleModal.value = false
    selectedDate.value = newSchedule.value.date
    fetchDashboard() 
    showNotification('success', 'Tạo ca làm việc thành công!')
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi khi tạo ca.')
  }
}

const deleteSchedule = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa ca làm này?')) return
  try {
    await api.delete(`/api/manager/hr/work-schedules/${id}`)
    fetchDashboard()
    showNotification('success', 'Đã xóa ca làm việc!')
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi xóa ca.')
  }
}

const openAssignModal = (scheduleId) => {
  assignForm.value = { workScheduleId: scheduleId, staffId: '', note: '' }
  showAssignModal.value = true
}

const submitAssignStaff = async () => {
  if (!assignForm.value.staffId) {
    showNotification('danger', 'Vui lòng chọn nhân viên!')
    return
  }
  try {
    await api.post(`/api/manager/hr/work-schedules/${assignForm.value.workScheduleId}/assign-staff`, assignForm.value)
    showAssignModal.value = false
    fetchDashboard()
    showNotification('success', 'Phân công nhân viên thành công!')
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi khi phân công.')
  }
}

const removeAssignment = async (assignId) => {
  if (!confirm('Gỡ nhân viên này khỏi ca?')) return
  try {
    await api.delete(`/api/manager/hr/work-assignments/${assignId}`)
    fetchDashboard()
    showNotification('success', 'Đã gỡ phân công thành công!')
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi khi gỡ phân công.')
  }
}

onMounted(() => {
  const today = new Date()
  selectedMonth.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  fetchDashboard()
})
</script>

<style scoped>
.calendar-table {
  table-layout: fixed;
  height: 350px;
}
.calendar-day {
  cursor: pointer;
  height: 50px;
  vertical-align: middle;
  transition: all 0.2s;
}

/* Sửa CSS Hover theo chuẩn Dark Mode */
[data-bs-theme="dark"] .calendar-day:hover:not(.selected-day) {
  background-color: var(--bs-secondary-bg) !important;
}
[data-bs-theme="light"] .calendar-day:hover:not(.selected-day) {
  background-color: #f1f3f5 !important;
}

.selected-day {
  border-radius: 8px;
  transform: scale(0.95);
  box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3);
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
</style>