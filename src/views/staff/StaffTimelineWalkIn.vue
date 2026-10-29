<template>
  <div>
    <!-- BẢNG TIMELINE PHÒNG -->
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white border-0 pt-4 pb-0">
        <div class="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-2">
          <div>
            <h5 class="fw-bold mb-1"><i class="fas fa-table-cells me-2 text-primary"></i>Bảng phòng 24 giờ</h5>
            <p class="small text-muted mb-0" v-if="timelineStart">
              Khung hiển thị từ <strong>{{ formatTime(timelineStart) }}</strong> đến <strong>{{ formatTime(timelineEnd) }}</strong>
            </p>
          </div>
          <!-- BỘ ĐIỀU KHIỂN NHẢY THỜI GIAN -->
          <div class="d-flex align-items-center gap-2">
            <label class="small fw-bold text-muted text-nowrap mb-0">Xem từ:</label>
            <input type="datetime-local" v-model="filterStartTime" class="form-control form-control-sm" style="width: 190px;">
            <button @click="jumpToTime" class="btn btn-sm btn-primary fw-bold px-3 shadow-sm">Đi</button>
            <button @click="resetTime" class="btn btn-sm btn-outline-secondary shadow-sm" title="Về hiện tại"><i class="fas fa-undo"></i></button>
          </div>
        </div>
        
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 mt-3">
          <div class="timeline-legend small d-flex flex-wrap gap-2">
            <span class="badge bg-light text-dark border">Trống</span>
            <span class="badge bg-warning text-dark">Chờ cọc</span>
            <span class="badge bg-primary text-white">Chờ nhận</span>
            <span class="badge bg-success text-white">Đang ở</span>
            <span class="badge bg-danger text-white">Quá hạn</span>
            <span class="badge bg-info text-dark">Dọn dẹp</span>
          </div>
          <div class="d-flex gap-2">
            <span class="badge bg-success-subtle text-success border border-success">Trống ngay: {{ availableNowRoomCount }}</span>
            <span class="badge bg-warning-subtle text-warning border border-warning">Bận: {{ busyNowRoomCount }}</span>
            <span class="badge bg-danger-subtle text-danger border border-danger">Bảo trì: {{ maintenanceRoomCount }}</span>
          </div>
        </div>
      </div>
      
      <div class="card-body pt-0">
        <div v-if="isLoadingTimeline" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
        
        <div v-else class="table-responsive border rounded staff-timeline-wrapper" style="max-height: 500px;">
          <table class="table table-bordered table-sm align-middle mb-0 text-center" style="min-width: 1200px;">
            <thead class="table-light position-sticky top-0" style="z-index: 10;">
              <tr>
                <th class="sticky-col bg-light text-start px-3" style="min-width: 120px; left: 0; z-index: 11;">Phòng</th>
                <th class="sticky-col-2 bg-light px-2" style="min-width: 100px; left: 120px; z-index: 11;">Trạng thái</th>
                <th v-for="(slot, idx) in roomTimelineSlots" :key="idx" class="small text-muted" style="min-width: 40px;">
                  {{ slot.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in roomTimelineRows" :key="row.room.id">
                <td class="sticky-col bg-white text-start px-3 py-2" style="left: 0; z-index: 1;">
                  <div class="fw-bold text-primary">{{ row.room.name }}</div>
                  <div class="small text-muted" style="font-size: 0.75rem;">{{ row.room.roomType?.name }}</div>
                </td>
                <td class="sticky-col-2 bg-white px-2 py-2" style="left: 120px; z-index: 1;">
                  <span class="badge w-100" :class="row.maintenanceRoom ? 'bg-danger' : (row.availableNow ? 'bg-success' : 'bg-warning text-dark')">
                    {{ row.currentStateLabel }}
                  </span>
                </td>
                <td v-for="(seg, idx) in row.segments" :key="idx" :colspan="seg.colspan" :title="seg.tooltip" class="p-0 border-start border-end">
                  <!-- Loại bỏ text-white cứng, màu chữ và nền lấy từ hàm getCssClassForSegment -->
                  <div class="h-100 w-100 d-flex align-items-center justify-content-center text-truncate small" 
                       :class="getCssClassForSegment(seg.cssClass)" style="min-height: 30px; font-size: 0.75rem;">
                    {{ seg.label }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TẠO ĐƠN THUÊ TRỰC TIẾP (WALK-IN) -->
    <div class="card border-0 shadow-sm rounded-4 bg-light-subtle">
      <div class="card-header bg-transparent border-0 pt-4 pb-0">
        <h5 class="fw-bold text-primary"><i class="fas fa-person-walking-luggage me-2"></i>Tạo đơn thuê trực tiếp (Walk-in)</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="submitWalkIn">
          <div class="row g-4">
            <!-- Chọn phòng & Thời gian -->
            <div class="col-xl-7">
              <div class="bg-white border rounded shadow-sm p-3 mb-3">
                 <h6 class="fw-bold text-dark mb-3"><i class="fas fa-clock text-warning me-1"></i> Thời gian lưu trú</h6>
                 <div class="row g-2 mb-3">
                  <div class="col-md-7">
                    <label class="form-label small fw-bold text-muted mb-1">Giờ vào (Check-in thực tế)</label>
                    <input type="datetime-local" v-model="walkInForm.checkIn" @change="fetchWalkInRooms" class="form-control form-control-sm bg-light" required>
                  </div>
                  <div class="col-md-5">
                    <label class="form-label small fw-bold text-muted mb-1">Số giờ thuê</label>
                    <input type="number" v-model="walkInForm.lengthOfStay" @change="fetchWalkInRooms" min="1" class="form-control form-control-sm border-primary fw-bold text-center" required>
                  </div>
                </div>
                 
                 <!-- Gợi ý thời gian -->
                 <div class="d-flex flex-wrap gap-2 mb-2">
                     <span class="small fw-semibold text-muted d-flex align-items-center me-1">Chọn nhanh:</span>
                     <button type="button" class="btn btn-sm btn-outline-secondary py-0" @click="setQuickTime(1)">1 Giờ</button>
                     <button type="button" class="btn btn-sm btn-outline-secondary py-0" @click="setQuickTime(2)">2 Giờ</button>
                     <button type="button" class="btn btn-sm btn-outline-secondary py-0" @click="setQuickTime(8)">Qua Đêm (8h)</button>
                     <button type="button" class="btn btn-sm btn-outline-secondary py-0" @click="setQuickTime(24)">1 Ngày (24h)</button>
                 </div>
                 <div class="text-end fw-bold text-danger small mt-2">
                     Giờ trả dự kiến: {{ expectedCheckOutTime }}
                 </div>
              </div>
              
              <div class="bg-white border rounded shadow-sm p-3 mb-3">
                <h6 class="fw-bold mb-3 text-dark border-bottom pb-2"><i class="fas fa-search text-secondary me-1"></i> Phòng trống hiện tại ({{ walkInRooms.length }})</h6>
                <div v-if="isLoadingWalkIn" class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>
                <div v-else class="table-responsive border rounded" style="max-height: 220px; overflow-y: auto;">
                  <table class="table table-sm table-hover align-middle mb-0">
                    <thead class="table-light position-sticky top-0">
                      <tr><th>Phòng</th><th>Loại</th><th>Sức chứa</th><th>Giá base</th><th></th></tr>
                    </thead>
                    <tbody>
                      <tr v-if="walkInRooms.length === 0"><td colspan="5" class="text-center text-muted py-2">Hết phòng trống.</td></tr>
                      <tr v-else v-for="room in walkInRooms" :key="room.id">
                        <td class="fw-bold text-primary">{{ room.name }}</td>
                        <td>{{ room.roomType?.name }}</td>
                        <td class="small">{{ room.roomType?.adultMax }} NL, {{ room.roomType?.childrenMax }} TE</td>
                        <td class="text-danger fw-bold small">{{ formatPrice(room.roomType?.basePrice) }}</td>
                        <td class="text-end pe-2">
                          <button type="button" class="btn btn-sm btn-outline-primary py-0" @click="addRoomToForm(room)">Chọn</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="bg-white border rounded shadow-sm p-3">
                <h6 class="fw-bold text-dark mb-3 border-bottom pb-2"><i class="fas fa-check-circle text-success me-1"></i> Phòng đã chọn</h6>
                <div v-if="walkInForm.selectedRooms.length === 0" class="text-muted small text-center py-2">Chưa chọn phòng nào.</div>
                <div v-else class="row g-2 mb-2 pb-2 border-bottom align-items-center" v-for="(sel, index) in walkInForm.selectedRooms" :key="index">
                  <div class="col-md-5 fw-bold text-primary">Phòng {{ sel.roomName }} <span class="small text-muted fw-normal">({{ sel.roomTypeName }})</span></div>
                  <div class="col-md-3">
                    <input type="number" v-model="sel.adultCount" class="form-control form-control-sm text-center" min="1" :max="sel.maxAdult" placeholder="Ng.Lớn" required title="Người lớn">
                  </div>
                  <div class="col-md-3">
                    <input type="number" v-model="sel.childrenCount" class="form-control form-control-sm text-center" min="0" :max="sel.maxChild" placeholder="Trẻ em" required title="Trẻ em">
                  </div>
                  <div class="col-md-1 text-end">
                    <button type="button" @click="removeRoomFromForm(index)" class="btn btn-sm btn-outline-danger py-0 px-2"><i class="fas fa-times"></i></button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Khách hàng -->
            <div class="col-xl-5">
              <div class="bg-white border rounded shadow-sm p-4 h-100 d-flex flex-column">
                <h6 class="fw-bold mb-3 border-bottom pb-2 text-dark"><i class="fas fa-id-card text-info me-1"></i> Thông tin khách hàng</h6>
                
                <div class="mb-3 p-2 bg-light rounded border">
                  <label class="form-label small fw-bold text-muted mb-1">Khách cũ (Nhập CCCD/Hộ chiếu)</label>
                  <input type="text" v-model="walkInForm.existingCustomerPid" class="form-control form-control-sm" placeholder="Nhập CCCD để auto điền...">
                </div>
                <div class="text-center position-relative mb-3">
                  <hr class="text-muted"><span class="bg-white px-2 small text-muted position-absolute top-50 start-50 translate-middle">Hoặc Khách Mới</span>
                </div>
                
                <div class="row g-2 mb-auto">
                  <div class="col-6"><input type="text" v-model="walkInForm.lastName" class="form-control form-control-sm" placeholder="Họ khách"></div>
                  <div class="col-6"><input type="text" v-model="walkInForm.firstName" class="form-control form-control-sm" placeholder="Tên khách"></div>
                  <div class="col-12"><input type="text" v-model="walkInForm.pid" class="form-control form-control-sm" placeholder="CCCD / CMND / Hộ chiếu"></div>
                  <div class="col-6"><input type="text" v-model="walkInForm.phoneNumber" class="form-control form-control-sm" placeholder="Số điện thoại"></div>
                  <div class="col-6"><input type="email" v-model="walkInForm.email" class="form-control form-control-sm" placeholder="Email (Không bắt buộc)"></div>
                  <div class="col-12"><input type="text" v-model="walkInForm.nationality" class="form-control form-control-sm" placeholder="Quốc tịch (VD: Việt Nam)"></div>
                  <div class="col-6">
                    <select v-model="walkInForm.sex" class="form-select form-select-sm">
                      <option value="MALE">Nam</option><option value="FEMALE">Nữ</option>
                    </select>
                  </div>
                  <div class="col-6"><input type="date" v-model="walkInForm.dateOfBirth" class="form-control form-control-sm"></div>
                </div>

                <div class="mt-4 pt-3 border-top">
                  <button type="submit" class="btn btn-success fw-bold w-100 py-3 shadow" :disabled="isSubmitting || walkInForm.selectedRooms.length === 0">
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="fas fa-check-circle me-2 fs-5"></i> TẠO ĐƠN THUÊ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../utils/axios'

const router = useRouter()

// Data Timeline
const isLoadingTimeline = ref(true)
const timelineStart = ref(null)
const timelineEnd = ref(null)
const roomTimelineSlots = ref([])
const roomTimelineRows = ref([])
const availableNowRoomCount = ref(0)
const busyNowRoomCount = ref(0)
const maintenanceRoomCount = ref(0)

// Data Nhảy thời gian
const filterStartTime = ref('') 

// 3 biến thiết yếu của form WalkIn
const isLoadingWalkIn = ref(false)
const isSubmitting = ref(false)
const walkInRooms = ref([])

// Khởi tạo thời gian Check-in hiện tại
const getInitCheckIn = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

const walkInForm = ref({
  checkIn: getInitCheckIn(),
  lengthOfStay: 1, 
  selectedRooms: [],
  existingCustomerPid: '',
  lastName: '', firstName: '', pid: '', phoneNumber: '', email: '', nationality: 'Việt Nam', sex: 'MALE', dateOfBirth: ''
})

// Tính giờ trả phòng dự kiến hiển thị trên UI
const expectedCheckOutTime = computed(() => {
  if (!walkInForm.value.checkIn || !walkInForm.value.lengthOfStay) return ''
  const start = new Date(walkInForm.value.checkIn)
  const out = new Date(start.getTime() + walkInForm.value.lengthOfStay * 60 * 60 * 1000)
  return out.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
})

const setQuickTime = (hours) => {
  walkInForm.value.lengthOfStay = hours
  fetchWalkInRooms()
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0) + ' đ'

// HÀM MAP CSS MỚI - Tách bạch text-dark và text-white
const getCssClassForSegment = (cssClass) => {
  const map = {
    'available': 'bg-light text-dark border',
    'deposit': 'bg-warning text-dark',
    'confirmed': 'bg-primary text-white',
    'checkedin': 'bg-success text-white',
    'overdue': 'bg-danger text-white',
    'cleaning': 'bg-info text-dark',
    'maintenance': 'bg-danger text-white'
  }
  return map[cssClass] || 'bg-secondary text-white'
}

// GỌI API KÈM START_TIME ĐỂ NHẢY
const fetchTimeline = async (startISO = null) => {
  isLoadingTimeline.value = true
  try {
    const url = startISO ? `/api/staff/timeline?startTime=${startISO}:00` : '/api/staff/timeline'
    const res = await api.get(url)
    
    timelineStart.value = res.data.timelineStart
    timelineEnd.value = res.data.timelineEnd
    roomTimelineSlots.value = res.data.roomTimelineSlots
    roomTimelineRows.value = res.data.roomTimelineRows
    availableNowRoomCount.value = res.data.availableNowRoomCount
    busyNowRoomCount.value = res.data.busyNowRoomCount
    maintenanceRoomCount.value = res.data.maintenanceRoomCount
    
    // Đồng bộ lại ô Input theo giờ API trả về
    if (res.data.timelineStart) {
      filterStartTime.value = res.data.timelineStart.substring(0, 16)
    }
  } catch (error) { 
    console.error('Lỗi tải timeline', error) 
  } finally { 
    isLoadingTimeline.value = false 
  }
}

// Hàm nút Nhảy & Reset
const jumpToTime = () => {
  if (filterStartTime.value) fetchTimeline(filterStartTime.value)
}

const resetTime = () => {
  fetchTimeline() // Không truyền gì thì tự động lấy now()
}

const fetchWalkInRooms = async () => {
  if (!walkInForm.value.checkIn || !walkInForm.value.lengthOfStay) return
  isLoadingWalkIn.value = true
  try {
    const start = new Date(walkInForm.value.checkIn)
    const out = new Date(start.getTime() + walkInForm.value.lengthOfStay * 60 * 60 * 1000)
    out.setMinutes(out.getMinutes() - out.getTimezoneOffset())
    const checkOutStr = out.toISOString().slice(0, 16)

    const res = await api.get(`/api/staff/walk-in/rooms?checkIn=${walkInForm.value.checkIn}&checkOut=${checkOutStr}`)
    walkInRooms.value = res.data.walkInRooms
    
    const availableIds = walkInRooms.value.map(r => r.id)
    walkInForm.value.selectedRooms = walkInForm.value.selectedRooms.filter(s => availableIds.includes(s.roomId))
  } catch (error) { 
    console.error('Lỗi tải phòng trống', error) 
  } finally { 
    isLoadingWalkIn.value = false 
  }
}

const addRoomToForm = (room) => {
  if (walkInForm.value.selectedRooms.find(s => s.roomId === room.id)) {
    alert('Phòng này đã được chọn!')
    return
  }
  walkInForm.value.selectedRooms.push({
    roomId: room.id,
    roomName: room.name,
    roomTypeName: room.roomType?.name,
    adultCount: 1,
    childrenCount: 0,
    maxAdult: room.roomType?.adultMax || 2,
    maxChild: room.roomType?.childrenMax || 1
  })
}

const removeRoomFromForm = (index) => {
  walkInForm.value.selectedRooms.splice(index, 1)
}

const submitWalkIn = async () => {
  isSubmitting.value = true
  try {
    const payload = {
      roomId: walkInForm.value.selectedRooms.map(s => s.roomId),
      checkIn: walkInForm.value.checkIn + ':00', 
      lengthOfStay: walkInForm.value.lengthOfStay, 
      adultCount: walkInForm.value.selectedRooms.map(s => s.adultCount),
      childrenCount: walkInForm.value.selectedRooms.map(s => s.childrenCount),
      existingCustomerPid: walkInForm.value.existingCustomerPid,
      lastName: walkInForm.value.lastName,
      firstName: walkInForm.value.firstName,
      pid: walkInForm.value.pid,
      phoneNumber: walkInForm.value.phoneNumber,
      email: walkInForm.value.email,
      nationality: walkInForm.value.nationality,
      sex: walkInForm.value.sex,
      dateOfBirth: walkInForm.value.dateOfBirth
    }
    
    await api.post('/api/staff/walk-in', payload)
    alert('Tạo đơn Walk-in thành công!')
    
    fetchTimeline(filterStartTime.value) 
    fetchWalkInRooms()
    walkInForm.value.selectedRooms = []
    
    router.push('/employee/staff/bookings')
  } catch (error) {
    alert(error.response?.data?.error || 'Lỗi khi tạo đơn walk-in.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchTimeline()
  fetchWalkInRooms()
})
</script>

<style scoped>
.sticky-col { position: sticky; }
.sticky-col-2 { position: sticky; }
</style>