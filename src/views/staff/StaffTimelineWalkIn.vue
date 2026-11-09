<template>
  <div>
    <!-- BẢNG TIMELINE PHÒNG -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 bg-body-tertiary">
      <div class="card-header bg-transparent border-0 pt-4 pb-0">
        <div class="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-2">
          <div>
            <h5 class="fw-bold mb-1 text-body-emphasis"><i class="fas fa-table-cells me-2 text-primary"></i>Bảng phòng 24 giờ</h5>
            <p class="small text-body-secondary mb-0" v-if="timelineStart">
              Khung hiển thị từ <strong>{{ formatTime(timelineStart) }}</strong> đến <strong>{{ formatTime(timelineEnd) }}</strong>
            </p>
          </div>
          <!-- ĐIỀU KHIỂN NHẢY THỜI GIAN -->
          <div class="d-flex align-items-center gap-2">
            <label class="small fw-bold text-body-secondary text-nowrap mb-0">Xem từ:</label>
            <input type="datetime-local" v-model="filterStartTime" class="form-control form-control-sm bg-body text-body" style="width: 190px;">
            <button @click="jumpToTime" class="btn btn-sm btn-primary fw-bold px-3 shadow-sm">Đi</button>
            <button @click="resetTime" class="btn btn-sm btn-outline-secondary shadow-sm" title="Về hiện tại"><i class="fas fa-undo"></i></button>
          </div>
        </div>
        
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 mt-3">
          <div class="timeline-legend small d-flex flex-wrap gap-2">
            <span class="badge bg-body-secondary text-body-emphasis border">Trống</span>
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
            <thead class="table-secondary position-sticky top-0" style="z-index: 10;">
              <tr>
                <th class="sticky-col bg-body-secondary text-start px-3" style="min-width: 120px; left: 0; z-index: 11;">Phòng</th>
                <th class="sticky-col-2 bg-body-secondary px-2" style="min-width: 100px; left: 120px; z-index: 11;">Trạng thái</th>
                <th v-for="(slot, idx) in roomTimelineSlots" :key="idx" class="small text-body-secondary bg-body-secondary" style="min-width: 40px;">
                  {{ slot.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in roomTimelineRows" :key="row.room.id">
                <td class="sticky-col bg-body text-start px-3 py-2" style="left: 0; z-index: 1;">
                  <div class="fw-bold text-primary">{{ row.room.name }}</div>
                  <div class="small text-body-secondary" style="font-size: 0.75rem;">{{ row.room.roomType?.name }}</div>
                </td>
                <td class="sticky-col-2 bg-body px-2 py-2" style="left: 120px; z-index: 1;">
                  <span class="badge w-100" :class="row.maintenanceRoom ? 'bg-danger' : (row.availableNow ? 'bg-success' : 'bg-warning text-dark')">
                    {{ row.currentStateLabel }}
                  </span>
                </td>
                <td v-for="(seg, idx) in row.segments" :key="idx" :colspan="seg.colspan" :title="seg.tooltip" class="p-0 border-start border-end bg-body">
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
    <div class="card border-0 shadow-sm rounded-4 bg-body-secondary">
      <div class="card-header bg-transparent border-0 pt-4 pb-0">
        <h5 class="fw-bold text-primary"><i class="fas fa-person-walking-luggage me-2"></i>Tạo đơn thuê trực tiếp (Walk-in)</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="submitWalkIn">
          <div class="row g-4">
            <!-- Chọn phòng & Thời gian -->
            <div class="col-xl-7">
              <div class="bg-body-tertiary border rounded shadow-sm p-3 mb-3">
                 <h6 class="fw-bold text-body-emphasis mb-3"><i class="fas fa-clock text-warning me-1"></i> Thời gian lưu trú</h6>
                 
                 <!-- TAB CHỌN HÌNH THỨC THUÊ -->
                 <div class="d-flex gap-2 mb-3">
                    <button type="button" class="btn btn-sm w-50 fw-bold" :class="walkInForm.rentalType === 'HOURLY' ? 'btn-primary' : 'btn-outline-secondary text-body'" @click="setWalkInType('HOURLY')">
                      <i class="fas fa-clock me-1"></i> Theo giờ
                    </button>
                    <button type="button" class="btn btn-sm w-50 fw-bold" :class="walkInForm.rentalType === 'DAILY' ? 'btn-primary' : 'btn-outline-secondary text-body'" @click="setWalkInType('DAILY')">
                      <i class="fas fa-moon me-1"></i> Qua đêm / Ngày
                    </button>
                 </div>

                 <div class="row g-2 mb-3">
                  <div class="col-md-7">
                    <label class="form-label small fw-bold text-body-secondary mb-1">Giờ vào (Check-in thực tế)</label>
                    <input type="datetime-local" v-model="walkInForm.checkIn" @change="fetchWalkInRooms" class="form-control form-control-sm bg-body text-body" required>
                  </div>
                  <div class="col-md-5">
                    <label class="form-label small fw-bold text-body-secondary mb-1">{{ walkInForm.rentalType === 'HOURLY' ? 'Số giờ thuê' : 'Số đêm lưu trú' }}</label>
                    <input type="number" v-model="walkInForm.lengthOfStay" @change="fetchWalkInRooms" min="1" class="form-control form-control-sm border-primary fw-bold text-center bg-body text-body" required>
                  </div>
                </div>
                
                 <!-- BẢNG THÔNG TIN TẠM TÍNH (GỘP CHUNG) -->
                 <div class="alert alert-warning py-3 px-3 small mt-3 mb-0 shadow-sm border-warning">
                    <h6 class="fw-bold mb-3"><i class="fas fa-clipboard-check me-2"></i> THÔNG TIN TẠM TÍNH</h6>

                    <div class="d-flex justify-content-between mb-2">
                      <span>Giờ trả phòng (Dự kiến):</span>
                      <span class="fw-bold text-danger">{{ expectedCheckOutTime }}</span>
                    </div>

                    <!-- BÁO KHÁCH: PHỤ THU -->
                    <div v-if="earlyCheckInPreview" class="d-flex justify-content-between mb-1 text-danger fw-bold">
                      <span>Phụ thu nhận phòng sớm:</span>
                      <span>+{{ earlyCheckInPreview.percent }}%</span>
                    </div>
                    <div v-if="earlyCheckInPreview" class="small fst-italic mb-2 opacity-75">
                      (Hệ thống tự động tính thêm phụ thu do khách check-in trước 14:00)
                    </div>

                    <div class="d-flex justify-content-between mt-2 pt-2 border-top border-warning align-items-center">
                      <span class="fw-bold fs-6">Tổng tiền phòng:</span>
                      <span v-if="walkInForm.selectedRooms.length > 0" class="fw-bold fs-5 text-primary">{{ formatPrice(estimatedTotal) }}</span>
                      <span v-else class="fst-italic opacity-75">(Vui lòng chọn phòng)</span>
                    </div>
                 </div>
              </div>
              
              <div class="bg-body-tertiary border rounded shadow-sm p-3 mb-3">
                <h6 class="fw-bold mb-3 text-body-emphasis border-bottom border-secondary pb-2"><i class="fas fa-search text-secondary me-1"></i> Phòng trống hiện tại ({{ walkInRooms.length }})</h6>
                <div v-if="isLoadingWalkIn" class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>
                <div v-else class="table-responsive border rounded" style="max-height: 220px; overflow-y: auto;">
                  <table class="table table-sm table-hover align-middle mb-0">
                    <thead class="table-secondary position-sticky top-0">
                      <tr>
                        <th>Phòng</th>
                        <th>Loại</th>
                        <th>Sức chứa</th>
                        <th>Tiện ích</th>
                        <th>Giá phòng</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="walkInRooms.length === 0"><td colspan="6" class="text-center text-body-secondary py-2">Hết phòng trống.</td></tr>
                      <tr v-else v-for="room in walkInRooms" :key="room.id">
                        <td class="fw-bold text-primary">{{ room.name }}</td>
                        <td>{{ room.roomType?.name }}</td>
                        <td class="small">{{ room.roomType?.adultMax }} NL, {{ room.roomType?.childrenMax }} TE</td>
                        <td class="small">
                          <div v-if="room.roomType?.roomAmenities && room.roomType.roomAmenities.length > 0">
                            <span v-for="ra in room.roomType.roomAmenities.slice(0, 2)" :key="ra.amenity?.id" class="badge bg-light text-dark border border-secondary-subtle me-1 mb-1">
                              {{ ra.amenity?.name }}
                            </span>
                            <span v-if="room.roomType.roomAmenities.length > 2" class="text-muted" style="font-size: 0.7rem;">+{{ room.roomType.roomAmenities.length - 2 }}</span>
                          </div>
                          <div v-else class="text-muted fst-italic">-</div>
                        </td>
                        <td class="text-danger fw-bold small">
                          {{ walkInForm.rentalType === 'HOURLY' ? formatPrice(room.roomType?.basePrice) + '/h' : formatPrice(room.roomType?.dailyPrice || room.roomType?.basePrice * 22) + '/đêm' }}
                        </td>
                        <td class="text-end pe-2">
                          <button type="button" class="btn btn-sm btn-outline-primary py-0" @click="addRoomToForm(room)">Chọn</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="bg-body-tertiary border rounded shadow-sm p-3">
                <h6 class="fw-bold text-body-emphasis mb-3 border-bottom border-secondary pb-2"><i class="fas fa-check-circle text-success me-1"></i> Phòng đã chọn</h6>
                <div v-if="walkInForm.selectedRooms.length === 0" class="text-body-secondary small text-center py-2">Chưa chọn phòng nào.</div>
                <div v-else class="row g-2 mb-2 pb-2 border-bottom border-secondary align-items-center" v-for="(sel, index) in walkInForm.selectedRooms" :key="index">
                  <div class="col-md-5 fw-bold text-primary">Phòng {{ sel.roomName }} <span class="small text-body-secondary fw-normal">({{ sel.roomTypeName }})</span></div>
                  <div class="col-md-3">
                    <input type="number" v-model="sel.adultCount" class="form-control form-control-sm text-center bg-body text-body" min="1" :max="sel.maxAdult" placeholder="Ng.Lớn" required title="Người lớn">
                  </div>
                  <div class="col-md-3">
                    <input type="number" v-model="sel.childrenCount" class="form-control form-control-sm text-center bg-body text-body" min="0" :max="sel.maxChild" placeholder="Trẻ em" required title="Trẻ em">
                  </div>
                  <div class="col-md-1 text-end">
                    <button type="button" @click="removeRoomFromForm(index)" class="btn btn-sm btn-outline-danger py-0 px-2"><i class="fas fa-times"></i></button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Khách hàng -->
            <div class="col-xl-5">
              <div class="bg-body-tertiary border rounded shadow-sm p-4 h-100 d-flex flex-column">
                <h6 class="fw-bold mb-3 border-bottom border-secondary pb-2 text-body-emphasis"><i class="fas fa-id-card text-info me-1"></i> Thông tin khách hàng</h6>
                
                <div class="mb-3 p-2 bg-body-secondary rounded border border-secondary">
                  <label class="form-label small fw-bold text-body-secondary mb-1">Khách cũ (Nhập CCCD/Hộ chiếu)</label>
                  <div class="input-group input-group-sm">
                    <input 
                      type="text" 
                      v-model="walkInForm.existingCustomerPid" 
                      @keyup.enter="fetchCustomerInfo"
                      class="form-control bg-body text-body" 
                      placeholder="Nhập số CCCD...">
                    <button class="btn btn-primary fw-bold px-3" type="button" @click="fetchCustomerInfo">
                      <i class="fas fa-search me-1"></i> Tìm
                    </button>
                  </div>
                </div>
                <div class="text-center position-relative mb-3">
                  <hr class="text-body-secondary"><span class="bg-body-tertiary px-2 small text-body-secondary position-absolute top-50 start-50 translate-middle">Hoặc Khách Mới</span>
                </div>
                
                <div class="row g-2 mb-auto">
                  <div class="col-6"><input type="text" v-model="walkInForm.lastName" class="form-control form-control-sm bg-body text-body" placeholder="Họ khách"></div>
                  <div class="col-6"><input type="text" v-model="walkInForm.firstName" class="form-control form-control-sm bg-body text-body" placeholder="Tên khách"></div>
                  <div class="col-12"><input type="text" v-model="walkInForm.pid" class="form-control form-control-sm bg-body text-body" placeholder="CCCD / CMND / Hộ chiếu"></div>
                  <div class="col-6"><input type="text" v-model="walkInForm.phoneNumber" class="form-control form-control-sm bg-body text-body" placeholder="Số điện thoại"></div>
                  <div class="col-6"><input type="email" v-model="walkInForm.email" class="form-control form-control-sm bg-body text-body" placeholder="Email (Không bắt buộc)"></div>
                  <div class="col-12"><input type="text" v-model="walkInForm.nationality" class="form-control form-control-sm bg-body text-body" placeholder="Quốc tịch (VD: Việt Nam)"></div>
                  <div class="col-6">
                    <select v-model="walkInForm.sex" class="form-select form-select-sm bg-body text-body">
                      <option value="MALE">Nam</option><option value="FEMALE">Nữ</option>
                    </select>
                  </div>
                  <div class="col-6"><input type="date" v-model="walkInForm.dateOfBirth" class="form-control form-control-sm bg-body text-body"></div>
                </div>

                <div class="mt-4 pt-3 border-top border-secondary">
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

    <!-- MODAL BÁO KHÔNG TÌM THẤY KHÁCH -->
    <div v-if="showNotFoundModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header border-0 pb-0 justify-content-center mt-3">
            <div class="text-warning" style="font-size: 3rem;">
              <i class="fas fa-user-times"></i>
            </div>
          </div>
          <div class="modal-body text-center pt-2 pb-4 px-4">
            <h5 class="fw-bold mb-3 text-body-emphasis">Khách hàng mới</h5>
            <p class="text-body-secondary mb-0" style="font-size: 0.95rem;">
              CCCD/Hộ chiếu này chưa có trên hệ thống. Mã đã được tự động điền vào form, vui lòng nhập thêm các thông tin còn lại!
            </p>
          </div>
          <div class="modal-footer bg-body border-0 d-flex justify-content-center rounded-bottom-4 py-3">
            <button type="button" class="btn px-4 fw-bold btn-primary w-100" @click="showNotFoundModal = false">Đã hiểu</button>
          </div>
        </div>
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

// 3 biến thiết lập form WalkIn
const isLoadingWalkIn = ref(false)
const isSubmitting = ref(false)
const walkInRooms = ref([])
const showNotFoundModal = ref(false) 

// Khởi tạo thời gian Check-in hiện tại
const getInitCheckIn = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

const walkInForm = ref({
  checkIn: getInitCheckIn(),
  lengthOfStay: 1, 
  rentalType: 'HOURLY', 
  selectedRooms: [],
  existingCustomerPid: '',
  lastName: '', firstName: '', pid: '', phoneNumber: '', email: '', nationality: 'Việt Nam', sex: 'MALE', dateOfBirth: ''
})

const setWalkInType = (type) => {
  walkInForm.value.rentalType = type
  fetchWalkInRooms()
}

// LOGIC CẢNH BÁO PHỤ THU GIAO DIỆN
const earlyCheckInPreview = computed(() => {
  if (walkInForm.value.rentalType !== 'DAILY' || !walkInForm.value.checkIn) return null;
  
  const ciDate = new Date(walkInForm.value.checkIn);
  const hours = ciDate.getHours();
  
  let percent = 0;
  if (hours < 5) percent = 100;
  else if (hours < 9) percent = 50;
  else if (hours < 14) percent = 30;
  
  if (percent === 0) return null;
  
  // ÉP ĐỊNH DẠNG 24H Ở ĐÂY
  const timeStr = ciDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  return {
    percent: percent,
    message: `Khách nhận phòng lúc ${timeStr}. Hệ thống sẽ cộng thêm ${percent}% phụ thu nhận phòng sớm vào hóa đơn.`
  };
})

// Tính giờ trả phòng dự kiến hiển thị trên UI
const expectedCheckOutTime = computed(() => {
  if (!walkInForm.value.checkIn || !walkInForm.value.lengthOfStay) return ''
  const start = new Date(walkInForm.value.checkIn)
  let out = new Date(start)

  if (walkInForm.value.rentalType === 'DAILY') {
    out.setDate(out.getDate() + walkInForm.value.lengthOfStay)
    out.setHours(12, 0, 0, 0)
    if (out <= start) {
        out.setDate(out.getDate() + 1)
    }
  } else {
    out = new Date(start.getTime() + walkInForm.value.lengthOfStay * 60 * 60 * 1000)
  }

  // ÉP ĐỊNH DẠNG 24H Ở ĐÂY
  return out.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
})

// TÍNH TỔNG TIỀN TẠM TÍNH TỰ ĐỘNG
const estimatedTotal = computed(() => {
  if (walkInForm.value.selectedRooms.length === 0 || !walkInForm.value.checkIn) return 0;

  const ciDate = new Date(walkInForm.value.checkIn);
  let total = 0;

  if (walkInForm.value.rentalType === 'DAILY') {
    const coDate = new Date(ciDate);
    coDate.setDate(coDate.getDate() + walkInForm.value.lengthOfStay);
    coDate.setHours(12, 0, 0, 0);
    if (coDate <= ciDate) coDate.setDate(coDate.getDate() + 1);

    const ciDateOnly = new Date(ciDate.getFullYear(), ciDate.getMonth(), ciDate.getDate());
    const coDateOnly = new Date(coDate.getFullYear(), coDate.getMonth(), coDate.getDate());
    let baseNights = Math.round((coDateOnly - ciDateOnly) / (1000 * 60 * 60 * 24));
    baseNights = Math.max(0, baseNights);

    const ciHour = ciDate.getHours();
    let earlyCiSurcharge = 0;
    if (ciHour < 5) earlyCiSurcharge = 1.0;
    else if (ciHour < 9) earlyCiSurcharge = 0.5;
    else if (ciHour < 14) earlyCiSurcharge = 0.3;

    let totalMultiplier = baseNights + earlyCiSurcharge;
    if (totalMultiplier <= 0) totalMultiplier = 1.0;

    walkInForm.value.selectedRooms.forEach(r => {
       total += r.dailyPrice * totalMultiplier;
    });

  } else {
    const coDate = new Date(ciDate.getTime() + walkInForm.value.lengthOfStay * 60 * 60 * 1000);
    const stayMinutes = Math.round((coDate - ciDate) / (1000 * 60));
    const fullHours = Math.floor(stayMinutes / 60);
    const remainder = stayMinutes % 60;
    let finalHours = fullHours + (remainder > 30 ? 1 : 0);
    if (finalHours < 1) finalHours = 1;

    walkInForm.value.selectedRooms.forEach(r => {
       total += r.basePrice * finalHours;
    });
  }
  return total;
})

const fetchCustomerInfo = async () => {
  const pid = walkInForm.value.existingCustomerPid?.trim()
  if (!pid) return

  try {
    const res = await api.get(`/api/staff/customers/by-pid/${pid}`)
    
    if (res.data) {
      const customer = res.data
      walkInForm.value.lastName = customer.user?.lastName || ''
      walkInForm.value.firstName = customer.user?.firstName || ''
      walkInForm.value.pid = customer.user?.pid || pid
      walkInForm.value.phoneNumber = customer.user?.phoneNumber || ''
      walkInForm.value.email = customer.user?.email || ''
      walkInForm.value.nationality = customer.user?.nationality || 'Việt Nam'
      walkInForm.value.sex = customer.user?.sex || 'MALE'
      
      if (customer.user?.dateOfBirth) {
        walkInForm.value.dateOfBirth = customer.user.dateOfBirth.substring(0, 10) 
      }
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      showNotFoundModal.value = true
      
      walkInForm.value.pid = pid 
      
      walkInForm.value.lastName = ''
      walkInForm.value.firstName = ''
      walkInForm.value.phoneNumber = ''
      walkInForm.value.email = ''
    } else {
      alert('Có lỗi xảy ra khi kiểm tra CCCD.')
      console.error('Lỗi khi fetch khách hàng:', error)
    }
  }
}

// ÉP ĐỊNH DẠNG 24H Ở ĐÂY (Dùng cho thông báo thời gian Timeline phía trên cùng)
const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
}

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ'

// HÀM MAP CSS MÀU - Chống mù mắt
const getCssClassForSegment = (cssClass) => {
  const map = {
    'available': 'bg-body-secondary text-body border',
    'deposit': 'bg-warning text-dark',
    'confirmed': 'bg-primary text-white',
    'checkedin': 'bg-success text-white',
    'overdue': 'bg-danger text-white',
    'cleaning': 'bg-info text-dark',
    'maintenance': 'bg-danger text-white'
  }
  return map[cssClass] || 'bg-secondary text-white'
}

// GỌI API KÈM START_TIME 
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
    
    if (res.data.timelineStart) {
      filterStartTime.value = res.data.timelineStart.substring(0, 16)
    }
  } catch (error) { 
    console.error('Lỗi timeline', error) 
  } finally { 
    isLoadingTimeline.value = false 
  }
}

const jumpToTime = () => {
  if (filterStartTime.value) fetchTimeline(filterStartTime.value)
}

const resetTime = () => {
  fetchTimeline() 
}

const fetchWalkInRooms = async () => {
  if (!walkInForm.value.checkIn || !walkInForm.value.lengthOfStay) return
  isLoadingWalkIn.value = true
  try {
    const start = new Date(walkInForm.value.checkIn)
    let out = new Date(start)

    if (walkInForm.value.rentalType === 'DAILY') {
        out.setDate(out.getDate() + walkInForm.value.lengthOfStay)
        out.setHours(12, 0, 0, 0)
        if (out <= start) out.setDate(out.getDate() + 1)
    } else {
        out = new Date(start.getTime() + walkInForm.value.lengthOfStay * 60 * 60 * 1000)
    }

    let diffHours = Math.max(1, Math.ceil((out.getTime() - start.getTime()) / (1000 * 60 * 60)))

    const res = await api.get(`/api/staff/walk-in/rooms?walkInCheckin=${walkInForm.value.checkIn}&walkInLengthOfStay=${diffHours}`)
    walkInRooms.value = res.data.walkInRooms
    
    const availableIds = walkInRooms.value.map(r => r.id)
    walkInForm.value.selectedRooms = walkInForm.value.selectedRooms.filter(s => availableIds.includes(s.roomId))
  } catch (error) { 
    console.error('Lỗi lấy phòng trống', error) 
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
    maxChild: room.roomType?.childrenMax || 1,
    basePrice: room.roomType?.basePrice || 0,
    dailyPrice: room.roomType?.dailyPrice || (room.roomType?.basePrice * 22) || 0
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
      checkIn: walkInForm.value.checkIn + (walkInForm.value.checkIn.length === 16 ? ':00' : ''), 
      lengthOfStay: walkInForm.value.lengthOfStay, 
      rentalType: walkInForm.value.rentalType, 
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