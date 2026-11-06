<template>
  <div class="card border-0 shadow-sm rounded-4 mb-4">
    <div class="card-header bg-white border-0 pt-4 pb-0">
      <h5 class="fw-bold mb-1"><i class="fas fa-bed me-2 text-primary"></i>Quản lý Lưu trú & Dọn dẹp</h5>
    </div>
    
    <div class="card-body">
      <!-- Thông báo Toast -->
      <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
        <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
        {{ notification.message }}
        <button type="button" class="btn-close" @click="notification.message = ''"></button>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <button class="nav-link fw-bold" :class="{ 'active text-primary': activeTab === 'stay' }" @click="activeTab = 'stay'">
            <i class="fas fa-user-check me-1"></i> Khách đang ở
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold" :class="{ 'active text-danger': activeTab === 'cleaning' }" @click="activeTab = 'cleaning'">
            <i class="fas fa-broom me-1"></i> Phòng cần dọn
            <span class="badge bg-danger ms-1" v-if="checkedOutRentals.length > 0">{{ checkedOutRentals.length }}</span>
          </button>
        </li>
      </ul>

      <div v-if="isLoading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
      
      <div v-else class="tab-content border rounded bg-white">
        <!-- TAB 1: KHÁCH ĐANG Ở -->
        <div v-if="activeTab === 'stay'" class="table-responsive p-2">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Khách / Mã</th>
                <th>Phòng</th>
                <th>Thời gian</th>
                <th>Dịch vụ</th>
                <th class="text-center px-2">Sự cố</th>
                <th class="text-end px-3">Tất toán & Out</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="allActiveRentals.length === 0">
                <td colspan="6" class="text-center text-muted py-4">Hiện không có khách lưu trú.</td>
              </tr>
              <tr v-for="r in allActiveRentals" :key="r.id" :class="{'table-danger border-danger': isOverdue(r)}">
                <td>
                  <div class="fw-bold">{{ r.customer?.user?.lastName }} {{ r.customer?.user?.firstName }}</div>
                  <div class="small text-muted">{{ r.id }}</div>
                </td>
                <td><span class="badge" :class="isOverdue(r) ? 'bg-danger' : 'bg-secondary'">{{ r.rentalDetails[0]?.room?.name }}</span></td>
                <td>
                  <div class="small fw-semibold text-success"><i class="fas fa-arrow-right me-1"></i> {{ formatTime(r.rentalDetails[0]?.checkinDate) }}</div>
                  <div class="badge bg-danger mt-1 px-2" v-if="isOverdue(r)">Quá hạn!</div>
                </td>
                
                <!-- CỘT DỊCH VỤ -->
                <td>
                  <div class="d-flex flex-column gap-2" style="width: 230px;">
                    <form v-if="serviceForm[r.id]" @submit.prevent="addService(r.id)" class="d-flex gap-1 align-items-center bg-white p-1 rounded border shadow-sm m-0 w-100">
                      <select v-model="serviceForm[r.id].serviceId" class="form-select form-select-sm border-0 bg-transparent px-1 text-truncate" required>
                        <option value="">Thêm dịch vụ</option>
                        <option v-for="s in activeServices" :key="s.id" :value="s.id">{{ s.name }}</option>
                      </select>
                      <input type="number" v-model="serviceForm[r.id].quantity" class="form-control form-control-sm border-0 bg-light px-1 text-center flex-shrink-0" min="1" required style="width: 45px;">
                      <button type="submit" class="btn btn-sm btn-primary py-1 px-2 rounded flex-shrink-0" :disabled="isProcessing"><i class="fas fa-plus"></i></button>
                    </form>
                    
                    <!-- Thay thẻ <a> bằng thẻ <button> để đồng bộ UI với cột Sự cố -->
                    <button v-if="getServiceCount(r.rentalDetails[0]?.id) > 0" @click="viewServiceHistory(r)" class="btn btn-sm btn-outline-primary shadow-sm fw-bold w-100">
                      <i class="fas fa-list-ul me-1"></i> Lịch sử dịch vụ ({{ getServiceCount(r.rentalDetails[0]?.id) }})
                    </button>
                  </div>
                </td>

                <!-- CỘT SỰ CỐ ĐÃ MANG RA NGOÀI -->
                <td class="text-center px-2">
                  <div class="d-flex flex-column gap-2 align-items-center">
                    <button @click="openIncidentModal(r.rentalDetails[0])" class="btn btn-sm btn-warning shadow-sm fw-bold w-100" title="Báo sự cố mới">
                      <i class="fas fa-exclamation-triangle"></i> Báo sự cố
                    </button>
                    <button v-if="getIncidentCount(r.rentalDetails[0]?.id) > 0" @click="viewIncidentHistory(r.rentalDetails[0]?.id)" class="btn btn-sm btn-outline-info shadow-sm fw-bold w-100">
                      <i class="fas fa-history"></i> Lịch sử ({{ getIncidentCount(r.rentalDetails[0]?.id) }})
                    </button>
                  </div>
                </td>
                
                <td class="text-end px-3" style="min-width: 230px;">
                  <div v-if="!isSettled(r.id)" class="d-flex flex-column align-items-end gap-1">
                    <div class="small text-muted mb-2">
                       Đã ở: <strong class="text-dark">{{ getBillingSummary(r.id)?.actualStayHours || 0 }}h</strong>
                       <span class="mx-1">|</span>
                       Cần thu: <strong class="text-danger fs-6">{{ formatPrice(getBillingSummary(r.id)?.finalAmount) }}</strong>
                    </div>

                    <form @submit.prevent="finalPayment(r)" class="d-flex gap-1 w-100 justify-content-end">
                      <select v-model="paymentForm[r.id]" class="form-select form-select-sm shadow-sm" required style="width:110px;">
                        <option value="CASH">Tiền mặt</option>
                        <option value="BANK">CK Ngân hàng</option>
                      </select>
                      <button type="submit" class="btn btn-sm btn-warning fw-bold py-1 shadow-sm" :disabled="isProcessing">Tất toán</button>
                    </form>
                  </div>
                  <div v-else>
                    <span class="text-success small fw-bold mb-1 d-block"><i class="fas fa-check-circle me-1"></i> Đã tất toán</span>
                    <button @click="checkOut(r.id)" class="btn btn-sm btn-danger w-100 py-2 shadow-sm" :disabled="isProcessing"><i class="fas fa-door-open me-1"></i> Check-out</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TAB 2: DỌN PHÒNG -->
        <div v-if="activeTab === 'cleaning'" class="table-responsive p-2">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr><th class="px-4 py-3">Phòng</th><th>Khách vừa trả</th><th>Trạng thái</th><th class="text-end px-3">Thao tác</th></tr>
            </thead>
            <tbody>
              <tr v-if="checkedOutRentals.length === 0"><td colspan="4" class="text-center text-muted py-4">Không có phòng nào đang chờ dọn.</td></tr>
              <tr v-for="r in checkedOutRentals" :key="r.id">
                <td class="px-4 fw-bold fs-5 text-primary">{{ r.rentalDetails[0]?.room?.name }}</td>
                <td class="text-muted">{{ r.customer?.user?.lastName }} {{ r.customer?.user?.firstName }}</td>
                <td><span class="badge bg-warning text-dark"><i class="fas fa-spray-can me-1"></i> Đang dọn dẹp</span></td>
                <td class="text-end px-3">
                  <button @click="markAvailable(r.rentalDetails[0]?.room?.id)" class="btn btn-sm btn-outline-success fw-bold shadow-sm" :disabled="isProcessing">
                    <i class="fas fa-unlock me-1"></i> Mở phòng
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL XEM NHANH DỊCH VỤ -->
    <div v-if="showServiceHistoryModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-concierge-bell me-2"></i>Dịch vụ đã gọi - P.{{ currentServiceRoomName }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="showServiceHistoryModal = false"></button>
          </div>
          <div class="modal-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="px-3">Thời gian</th>
                    <th>Dịch vụ</th>
                    <th class="text-center">SL</th>
                    <th class="text-end px-3">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="svc in currentRoomServices" :key="svc.id">
                    <td class="px-3 small text-muted">{{ formatTime(svc.time) }}</td>
                    <td class="fw-bold">{{ svc.service?.name }}</td>
                    <td class="text-center">{{ svc.count }}</td>
                    <td class="text-end px-3 fw-bold text-danger">{{ formatPrice(svc.count * svc.unitPrice) }}</td>
                  </tr>
                </tbody>
                <tfoot class="table-light">
                  <tr>
                    <td colspan="3" class="text-end fw-bold">Tổng cộng:</td>
                    <td class="text-end px-3 fw-bold text-danger fs-5">
                      {{ formatPrice(currentRoomServices.reduce((sum, s) => sum + (s.count * s.unitPrice), 0)) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div class="modal-footer bg-light border-0">
            <button type="button" class="btn btn-secondary fw-semibold px-4" @click="showServiceHistoryModal = false">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL BÁO SỰ CỐ -->
    <div v-if="showIncidentModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1070;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title fw-bold"><i class="fas fa-exclamation-triangle me-2"></i>Báo sự cố phòng {{ incidentRoomName }}</h5>
            <button type="button" class="btn-close" @click="showIncidentModal = false"></button>
          </div>
          <form @submit.prevent="submitIncident">
            <div class="modal-body p-4">
              <div class="mb-3"><label class="fw-semibold">Tên sự cố</label><input v-model="incidentForm.name" type="text" class="form-control" required placeholder="Hư bồn cầu, vỡ ly..."></div>
              <div class="mb-3"><label class="fw-semibold">Thời gian xảy ra</label><input v-model="incidentForm.occurTime" type="datetime-local" class="form-control" required></div>
              <div class="mb-0"><label class="fw-semibold">Mô tả chi tiết</label><textarea v-model="incidentForm.description" class="form-control" rows="2" required></textarea></div>
            </div>
            <div class="modal-footer bg-light border-0">
              <button type="button" class="btn btn-secondary" @click="showIncidentModal = false">Hủy</button>
              <button type="submit" class="btn btn-warning fw-bold" :disabled="isProcessing">Gửi báo cáo</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL XEM NHANH SỰ CỐ CỦA PHÒNG -->
    <div v-if="showIncidentHistoryModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-history me-2"></i>Sự cố phòng đang thuê</h5>
            <button type="button" class="btn-close btn-close-white" @click="showIncidentHistoryModal = false"></button>
          </div>
          <div class="modal-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="px-3">Thời gian</th>
                    <th>Sự cố</th>
                    <th>Trạng thái</th>
                    <th>Hướng xử lý</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ic in currentRoomIncidents" :key="ic.id">
                    <td class="px-3 small text-muted">{{ formatDate(ic.occurTime) }}</td>
                    <td>
                      <span class="fw-bold d-block">{{ ic.name }}</span>
                      <span class="small text-muted">{{ ic.description }}</span>
                    </td>
                    <td>
                      <span class="badge" 
                            :class="ic.status === 'RESOLVED' ? 'bg-success' : (ic.status === 'PROCESSING' ? 'bg-warning text-dark' : 'bg-secondary')">
                        {{ ic.status === 'RESOLVED' ? 'Đã giải quyết' : (ic.status === 'PROCESSING' ? 'Đang xử lý' : 'Chờ xử lý') }}
                      </span>
                    </td>
                    <td class="small text-muted">
                      <div v-if="ic.handle">{{ ic.handle }}</div>
                      <div v-if="ic.money > 0" class="text-danger fw-bold mt-1">Phạt: {{ formatPrice(ic.money) }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer bg-light border-0">
            <button type="button" class="btn btn-secondary fw-semibold px-4" @click="showIncidentHistoryModal = false">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL CONFIRM -->
    <div v-if="showConfirmModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1080;">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body">
          <div class="modal-header border-0 pb-0 justify-content-center mt-3">
            <div :class="'text-' + confirmConfig.type" style="font-size: 3rem;">
              <i :class="confirmConfig.icon"></i>
            </div>
          </div>
          <div class="modal-body text-center pt-2 pb-4 px-4">
            <h5 class="fw-bold mb-3 text-body-emphasis">{{ confirmConfig.title }}</h5>
            <p class="text-body-secondary mb-0" style="font-size: 0.95rem;" v-html="confirmConfig.message"></p>
          </div>
          <div class="modal-footer bg-light border-0 d-flex justify-content-center rounded-bottom-4 py-3 gap-2">
            <button type="button" class="btn btn-secondary px-4 fw-semibold" @click="closeConfirm" :disabled="isProcessing">Hủy</button>
            <button type="button" class="btn px-4 fw-bold" :class="'btn-' + confirmConfig.type" @click="executeConfirm" :disabled="isProcessing">
              <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../../utils/axios'

const activeTab = ref('stay')
const checkedInRentals = ref([])
const overdueRentals = ref([])
const checkedOutRentals = ref([])
const activeServices = ref([])
const billingSummaries = ref({})
const allIncidents = ref([])
const allServiceUsages = ref([]) // Thêm state lưu lịch sử dịch vụ
const isLoading = ref(true)
const isProcessing = ref(false)

const serviceForm = ref({})
const paymentForm = ref({})
const showIncidentModal = ref(false)
const showIncidentHistoryModal = ref(false)
const showServiceHistoryModal = ref(false)

const currentRoomIncidents = ref([])
const currentRoomServices = ref([])
const currentServiceRoomName = ref('')
const incidentRoomName = ref('')
const incidentForm = ref({ rentalDetailId: '', name: '', occurTime: '', description: '' })
const notification = ref({ type: '', message: '' })

// Quản lý Modal Confirm
const showConfirmModal = ref(false)
const confirmConfig = ref({ title: '', message: '', type: 'primary', icon: '', action: null })

const allActiveRentals = computed(() => [...overdueRentals.value, ...checkedInRentals.value])

// Fix định dạng giờ 24h
const formatTime = (val) => val ? new Date(val).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''
const formatDate = (val) => val ? new Date(val).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : ''
const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ'

const isOverdue = (r) => r.rentalDetails[0]?.status === 'OVERDUE'
const isSettled = (rentalId) => false 

const getBillingSummary = (id) => billingSummaries.value[id]

const getIncidentCount = (rentalDetailId) => {
  if (!allIncidents.value) return 0;
  return allIncidents.value.filter(ic => ic.rentalDetailId === rentalDetailId).length;
}

const getServiceCount = (rentalDetailId) => {
  if (!allServiceUsages.value) return 0;
  return allServiceUsages.value.filter(s => s.rentalDetailId === rentalDetailId).length;
}

const showNotification = (type, message) => {
  notification.value = { type, message }
  setTimeout(() => notification.value.message = '', 5000)
}

const openConfirm = (title, message, type, icon, actionCallback) => {
  confirmConfig.value = { title, message, type, icon, action: actionCallback }
  showConfirmModal.value = true
}

const closeConfirm = () => {
  showConfirmModal.value = false
  confirmConfig.value.action = null
}

const executeConfirm = async () => {
  if (confirmConfig.value.action) {
    isProcessing.value = true
    await confirmConfig.value.action()
    isProcessing.value = false
  }
  closeConfirm()
}

const fetchData = async () => {
  isLoading.value = true
  try {
    const [resActive, resCleaning, resIncidents, resHistory] = await Promise.all([
      api.get('/api/staff/rentals/active'),
      api.get('/api/staff/rentals/cleaning'),
      api.get('/api/staff/incidents'),
      api.get('/api/staff/history') // Gọi thêm API history để lấy full danh sách dịch vụ
    ])
    
    checkedInRentals.value = resActive.data.checkedInRentals || []
    overdueRentals.value = resActive.data.overdueRentals || []
    activeServices.value = resActive.data.activeServices || []
    billingSummaries.value = resActive.data.billingSummaries || {}
    checkedOutRentals.value = resCleaning.data.checkedOutRentals || []
    allIncidents.value = resIncidents.data.incidents || []
    allServiceUsages.value = resHistory.data.serviceUsages || []

    allActiveRentals.value.forEach(r => {
      if (!serviceForm.value[r.id]) serviceForm.value[r.id] = { serviceId: '', quantity: 1 }
      if (!paymentForm.value[r.id]) paymentForm.value[r.id] = 'CASH'
    })
  } catch (error) { 
    showNotification('danger', 'Lỗi tải dữ liệu lưu trú.') 
  } finally { 
    isLoading.value = false 
  }
}

const addService = async (rentalId) => {
  const form = serviceForm.value[rentalId]
  if (!form.serviceId) {
    showNotification('warning', 'Vui lòng chọn dịch vụ.')
    return
  }
  isProcessing.value = true
  try {
    await api.post(`/api/staff/rentals/${rentalId}/services`, form)
    showNotification('success', 'Thêm dịch vụ thành công')
    form.serviceId = ''; form.quantity = 1
    await fetchData() // Refresh để update lại count và lịch sử
  } catch (error) { 
    showNotification('danger', error.response?.data?.error || 'Lỗi thêm dịch vụ') 
  } finally { 
    isProcessing.value = false 
  }
}

// ---- QUẢN LÝ XEM DỊCH VỤ ĐÃ GỌI ----
const viewServiceHistory = (rental) => {
  currentServiceRoomName.value = rental.rentalDetails[0]?.room?.name;
  currentRoomServices.value = allServiceUsages.value.filter(s => s.rentalDetailId === rental.rentalDetails[0]?.id);
  showServiceHistoryModal.value = true;
}

const finalPayment = (rental) => {
  const summary = getBillingSummary(rental.id);
  const amountText = summary?.finalAmount > 0 
    ? `<strong class="text-danger fs-5">${formatPrice(summary.finalAmount)}</strong>` 
    : `<strong>0đ</strong>`;
  const method = paymentForm.value[rental.id] === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản';
  
  openConfirm(
    'Tất toán & Check-out',
    `Thu ${amountText} (${method}) từ khách <b>${rental.customer?.user?.lastName} ${rental.customer?.user?.firstName}</b>? Hệ thống sẽ Check-out ngay sau khi tất toán.`,
    'warning',
    'fas fa-file-invoice-dollar',
    async () => {
      try {
        await api.post(`/api/staff/rentals/${rental.id}/final-payment`, { paymentMethod: paymentForm.value[rental.id], transactionCode: '' })
        await api.post(`/api/staff/rentals/${rental.id}/check-out`)
        
        showNotification('success', 'Tất toán & Check-out thành công!')
        activeTab.value = 'cleaning' 
        await fetchData()
      } catch (error) { 
        showNotification('danger', error.response?.data?.error || 'Lỗi tất toán') 
      }
    }
  )
}

const checkOut = (rentalId) => {
  openConfirm(
    'Check-out',
    'Xác nhận khách đã rời đi và chuyển phòng sang trạng thái dọn dẹp?',
    'danger',
    'fas fa-door-open',
    async () => {
      try {
        await api.post(`/api/staff/rentals/${rentalId}/check-out`)
        showNotification('success', 'Check-out thành công!')
        activeTab.value = 'cleaning'
        await fetchData()
      } catch (error) { 
        showNotification('danger', error.response?.data?.error || 'Lỗi checkout') 
      }
    }
  )
}

const markAvailable = async (roomId) => {
  isProcessing.value = true
  try {
    await api.put(`/api/staff/rooms/${roomId}/status/available`)
    showNotification('success', 'Phòng đã sẵn sàng đón khách.')
    await fetchData()
  } catch (error) { 
    showNotification('danger', error.response?.data?.error || 'Lỗi mở phòng') 
  } finally { 
    isProcessing.value = false 
  }
}

// ---- QUẢN LÝ SỰ CỐ ----
const openIncidentModal = (detail) => {
  incidentRoomName.value = detail.room?.name
  const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  incidentForm.value = { rentalDetailId: detail.id, name: '', occurTime: now.toISOString().slice(0, 16), description: '' }
  showIncidentModal.value = true
}

const submitIncident = async () => {
  isProcessing.value = true
  try {
    await api.post('/api/staff/incidents/create', incidentForm.value)
    showNotification('success', 'Báo sự cố thành công.')
    showIncidentModal.value = false
    await fetchData() 
  } catch (error) { 
    showNotification('danger', error.response?.data?.error || 'Lỗi báo sự cố') 
  } finally { 
    isProcessing.value = false 
  }
}

const viewIncidentHistory = (rentalDetailId) => {
  currentRoomIncidents.value = allIncidents.value.filter(ic => ic.rentalDetailId === rentalDetailId)
  showIncidentHistoryModal.value = true
}

onMounted(() => fetchData())
</script>