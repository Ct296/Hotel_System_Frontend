<template>
  <div class="card border-0 shadow-sm rounded-4 mb-4">
    <div class="card-header bg-white border-0 pt-4 pb-0">
      <h5 class="fw-bold mb-1"><i class="fas fa-bed me-2 text-primary"></i>Quản lý Lưu trú & Dọn dẹp</h5>
    </div>
    
    <div class="card-body">
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
              <tr><th>Khách / Mã</th><th>Phòng</th><th>Thời gian</th><th>Thêm dịch vụ</th><th class="text-center">Sự cố</th><th class="text-end px-3">Tất toán & Out</th></tr>
            </thead>
            <tbody>
              <tr v-if="allActiveRentals.length === 0"><td colspan="6" class="text-center text-muted py-4">Hiện không có khách lưu trú.</td></tr>
              
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
                <td>
                  <form @submit.prevent="addService(r.id)" class="d-flex gap-1 align-items-center bg-white p-1 rounded border shadow-sm" style="max-width: 220px;">
                    <select v-model="serviceForm[r.id].serviceId" class="form-select form-select-sm border-0 bg-transparent px-1" required>
                      <option value="">-- Dịch vụ --</option>
                      <option v-for="s in activeServices" :key="s.id" :value="s.id">{{ s.name }}</option>
                    </select>
                    <input type="number" v-model="serviceForm[r.id].quantity" class="form-control form-control-sm border-0 bg-light px-1 text-center" min="1" required style="width: 45px;">
                    <button type="submit" class="btn btn-sm btn-primary py-1 px-2 rounded" :disabled="isProcessing"><i class="fas fa-plus"></i></button>
                  </form>
                </td>
                <td class="text-center">
                  <button @click="openIncidentModal(r.rentalDetails[0])" class="btn btn-sm btn-warning py-1 px-2 shadow-sm"><i class="fas fa-triangle-exclamation"></i></button>
                </td>
                <td class="text-end px-3" style="min-width: 200px;">
                  <div v-if="!isSettled(r.id)" class="d-flex flex-column align-items-end gap-1">
                    <div class="small text-muted mb-1">
                      Đã ở: <strong class="text-dark">{{ getBillingSummary(r.id)?.actualStayHours || 0 }}h</strong>
                    </div>
                    <form @submit.prevent="finalPayment(r.id)" class="d-flex gap-1 w-100 justify-content-end">
                      <select v-model="paymentForm[r.id]" class="form-select form-select-sm shadow-sm" required style="width:100px;">
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

    <!-- Modal Sự cố -->
    <div v-if="showIncidentModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-warning text-dark"><h5 class="modal-title fw-bold">Báo sự cố phòng {{ incidentRoomName }}</h5><button type="button" class="btn-close" @click="showIncidentModal = false"></button></div>
          <form @submit.prevent="submitIncident">
            <div class="modal-body p-4">
              <div class="mb-3"><label class="fw-semibold">Tên sự cố</label><input v-model="incidentForm.name" type="text" class="form-control" required placeholder="Hỏng bồn cầu, vỡ ly..."></div>
              <div class="mb-3"><label class="fw-semibold">Thời gian xảy ra</label><input v-model="incidentForm.occurTime" type="datetime-local" class="form-control" required></div>
              <div class="mb-0"><label class="fw-semibold">Mô tả</label><textarea v-model="incidentForm.description" class="form-control" rows="2" required></textarea></div>
            </div>
            <div class="modal-footer bg-light border-0"><button type="button" class="btn btn-secondary" @click="showIncidentModal = false">Hủy</button><button type="submit" class="btn btn-warning fw-bold" :disabled="isProcessing">Gửi báo cáo</button></div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../../utils/axios'

const activeTab = ref('stay') // Quản lý Tab
const checkedInRentals = ref([])
const overdueRentals = ref([])
const checkedOutRentals = ref([])
const activeServices = ref([])
const billingSummaries = ref({})

const isLoading = ref(true)
const isProcessing = ref(false)

const serviceForm = ref({})
const paymentForm = ref({})

const showIncidentModal = ref(false)
const incidentRoomName = ref('')
const incidentForm = ref({ rentalDetailId: '', name: '', occurTime: '', description: '' })

const allActiveRentals = computed(() => [...overdueRentals.value, ...checkedInRentals.value])

const formatTime = (val) => val ? new Date(val).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''
const isOverdue = (r) => r.rentalDetails[0]?.status === 'OVERDUE'
const isSettled = (rentalId) => false // Logic thực tế phụ thuộc Backend
const getBillingSummary = (id) => billingSummaries.value[id]

const fetchData = async () => {
  isLoading.value = true
  try {
    // Gọi đồng thời cả 2 API
    const [resActive, resCleaning] = await Promise.all([
      api.get('/api/staff/rentals/active'),
      api.get('/api/staff/rentals/cleaning')
    ])
    
    checkedInRentals.value = resActive.data.checkedInRentals || []
    overdueRentals.value = resActive.data.overdueRentals || []
    activeServices.value = resActive.data.activeServices || []
    billingSummaries.value = resActive.data.billingSummaries || {}
    checkedOutRentals.value = resCleaning.data.checkedOutRentals || []

    allActiveRentals.value.forEach(r => {
      if (!serviceForm.value[r.id]) serviceForm.value[r.id] = { serviceId: '', quantity: 1 }
      if (!paymentForm.value[r.id]) paymentForm.value[r.id] = 'CASH'
    })
  } catch (error) { console.error(error) }
  finally { isLoading.value = false }
}

const addService = async (rentalId) => {
  const form = serviceForm.value[rentalId]
  if (!form.serviceId) return alert('Chọn dịch vụ')
  isProcessing.value = true
  try {
    await api.post(`/api/staff/rentals/${rentalId}/services`, form)
    alert('Thêm dịch vụ thành công')
    form.serviceId = ''; form.quantity = 1
    fetchData()
  } catch (error) { alert(error.response?.data?.error || 'Lỗi') }
  finally { isProcessing.value = false }
}

const finalPayment = async (rentalId) => {
  if (!confirm('Tất toán tiền phòng?')) return
  isProcessing.value = true
  try {
    await api.post(`/api/staff/rentals/${rentalId}/final-payment`, { paymentMethod: paymentForm.value[rentalId], transactionCode: '' })
    alert('Tất toán thành công! Hệ thống sẽ tự Check-out.')
    checkOut(rentalId)
  } catch (error) { alert(error.response?.data?.error || 'Lỗi tất toán') }
  finally { isProcessing.value = false }
}

const checkOut = async (rentalId) => {
  isProcessing.value = true
  try {
    await api.post(`/api/staff/rentals/${rentalId}/check-out`)
    activeTab.value = 'cleaning' // Tự động nhảy sang tab dọn phòng
    fetchData()
  } catch (error) { alert(error.response?.data?.error || 'Lỗi checkout') }
  finally { isProcessing.value = false }
}

const markAvailable = async (roomId) => {
  isProcessing.value = true
  try {
    await api.put(`/api/staff/rooms/${roomId}/status/available`)
    fetchData()
  } catch (error) { alert(error.response?.data?.error || 'Lỗi mở phòng') }
  finally { isProcessing.value = false }
}

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
    alert('Báo sự cố thành công')
    showIncidentModal.value = false
  } catch (error) { alert(error.response?.data?.error || 'Lỗi') }
  finally { isProcessing.value = false }
}

onMounted(() => fetchData())
</script>

<style scoped>
.nav-tabs .nav-link { cursor: pointer; color: #6c757d; }
.nav-tabs .nav-link.active { border-bottom-color: transparent; }
</style>