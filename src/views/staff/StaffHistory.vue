<template>
  <div class="card border-0 shadow-sm rounded-4 mb-4 bg-body">
    <div class="card-header bg-transparent border-0 pt-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-3">
      <div>
        <h5 class="fw-bold mb-0 text-body-emphasis">
          <i class="fas fa-file-invoice-dollar me-2 text-primary"></i>Lịch sử Giao dịch, Hóa đơn & Sự cố
        </h5>
      </div>

      <!-- Ô tìm kiếm nhanh theo tab đang mở -->
      <div class="input-group input-group-sm shadow-sm" style="max-width: 300px;">
        <span class="input-group-text bg-body-tertiary border-secondary-subtle border-end-0 text-body-secondary">
          <i class="fas fa-search"></i>
        </span>
        <input type="text"
               v-model="searchQuery"
               class="form-control bg-body text-body-emphasis border-secondary-subtle border-start-0"
               placeholder="Tìm mã, phòng, dịch vụ, ghi chú...">
        <button v-if="searchQuery"
                class="btn btn-outline-secondary border-secondary-subtle border-start-0"
                type="button"
                @click="searchQuery = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <div class="card-body pt-2">
      <!-- 4 Tab chuyển đổi -->
      <ul class="nav nav-tabs border-secondary-subtle mb-3">
        <li class="nav-item">
          <button class="nav-link fw-bold"
                  :class="activeTab === 'bill' ? 'active text-primary' : 'text-body-secondary'"
                  @click="activeTab = 'bill'">
            <i class="fas fa-receipt me-1"></i>Hóa đơn
            <span class="badge bg-primary-subtle text-primary ms-1">{{ bills.length }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold"
                  :class="activeTab === 'payment' ? 'active text-success' : 'text-body-secondary'"
                  @click="activeTab = 'payment'">
            <i class="fas fa-money-bill-wave me-1"></i>Thanh toán
            <span class="badge bg-success-subtle text-success ms-1">{{ payments.length }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold"
                  :class="activeTab === 'service' ? 'active text-info' : 'text-body-secondary'"
                  @click="activeTab = 'service'">
            <i class="fas fa-concierge-bell me-1"></i>Dịch vụ
            <span class="badge bg-info-subtle text-info-emphasis ms-1">{{ serviceUsages.length }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold"
                  :class="activeTab === 'incident' ? 'active text-warning' : 'text-body-secondary'"
                  @click="activeTab = 'incident'">
            <i class="fas fa-exclamation-triangle me-1"></i>Sự cố
            <span class="badge bg-warning-subtle text-warning-emphasis ms-1">{{ incidents.length }}</span>
          </button>
        </li>
      </ul>

      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <div v-else class="tab-content border border-secondary-subtle rounded-3 bg-body overflow-hidden">
        <!-- TAB 1: HÓA ĐƠN -->
        <div v-if="activeTab === 'bill'" class="table-responsive history-scroll">
          <table class="table table-hover align-middle mb-0">
            <thead class="adaptive-thead">
              <tr>
                <th class="px-3 py-3">Thời gian</th>
                <th class="py-3">Mã hóa đơn</th>
                <th class="py-3">Phân loại</th>
                <th class="py-3">Ghi chú</th>
                <th class="text-end px-3 py-3">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredBills.length === 0">
                <td colspan="5" class="text-center text-body-secondary py-4">Không có hóa đơn phù hợp.</td>
              </tr>
              <tr v-for="b in filteredBills" :key="b.id">
                <td class="px-3 small text-body-secondary text-nowrap">{{ formatDateTime(b.createDate) }}</td>
                <td class="fw-bold text-body-emphasis text-nowrap">{{ b.id }}</td>
                <td>
                  <span class="badge" :class="getBillBadgeClass(b.type)">
                    {{ getBillTypeLabel(b.type) }}
                  </span>
                </td>
                <td class="small text-body-secondary">{{ b.note || '-' }}</td>
                <td class="text-end px-3 fw-bold text-nowrap" :class="b.type === 'REFUND' ? 'text-success' : 'text-danger'">
                  {{ b.type === 'REFUND' ? '-' : '' }}{{ formatPrice(b.totalAmount) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TAB 2: THANH TOÁN -->
        <div v-if="activeTab === 'payment'" class="table-responsive history-scroll">
          <table class="table table-hover align-middle mb-0">
            <thead class="adaptive-thead">
              <tr>
                <th class="px-3 py-3">Thời gian</th>
                <th class="py-3">Mã Giao dịch</th>
                <th class="py-3">Phương thức</th>
                <th class="py-3">Mã Hóa đơn</th>
                <th class="px-3 py-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredPayments.length === 0">
                <td colspan="5" class="text-center text-body-secondary py-4">Không có giao dịch thanh toán phù hợp.</td>
              </tr>
              <tr v-for="p in filteredPayments" :key="p.id">
                <td class="px-3 small text-body-secondary text-nowrap">{{ formatDateTime(p.date) }}</td>
                <td class="fw-bold text-success text-nowrap">{{ p.transaction }}</td>
                <td>
                  <span class="badge bg-success-subtle text-success border border-success-subtle">{{ p.method }}</span>
                </td>
                <td class="small fw-semibold text-body-emphasis text-nowrap">{{ p.bill?.id || '-' }}</td>
                <td class="px-3 small text-body-secondary">{{ p.note || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TAB 3: DỊCH VỤ -->
        <div v-if="activeTab === 'service'" class="table-responsive history-scroll">
          <table class="table table-hover align-middle mb-0">
            <thead class="adaptive-thead">
              <tr>
                <th class="px-3 py-3">Thời gian</th>
                <th class="py-3">Dịch vụ</th>
                <th class="text-center py-3">SL</th>
                <th class="text-end py-3">Đơn giá</th>
                <th class="text-end px-3 py-3">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredServices.length === 0">
                <td colspan="5" class="text-center text-body-secondary py-4">Không có lịch sử dịch vụ phù hợp.</td>
              </tr>
              <tr v-for="u in filteredServices" :key="u.id">
                <td class="px-3 small text-body-secondary text-nowrap">{{ formatDateTime(u.time) }}</td>
                <td>
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle">
                    {{ u.service?.name || 'N/A' }}
                  </span>
                </td>
                <td class="text-center fw-bold text-body-emphasis">{{ u.count }}</td>
                <td class="text-end small text-body-secondary text-nowrap">{{ formatPrice(u.unitPrice) }}</td>
                <td class="text-end px-3 fw-bold text-danger text-nowrap">{{ formatPrice(u.unitPrice * u.count) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TAB 4: SỰ CỐ -->
        <div v-if="activeTab === 'incident'" class="table-responsive history-scroll">
          <table class="table table-hover align-middle mb-0">
            <thead class="adaptive-thead">
              <tr>
                <th class="px-3 py-3">Thời gian</th>
                <th class="py-3">Phòng</th>
                <th class="py-3">Sự cố</th>
                <th class="py-3">Trạng thái</th>
                <th class="py-3">Hướng xử lý</th>
                <th class="text-end px-3 py-3">In</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredIncidents.length === 0">
                <td colspan="6" class="text-center text-body-secondary py-4">Không có sự cố nào được ghi nhận.</td>
              </tr>
              <tr v-for="ic in filteredIncidents" :key="ic.id">
                <td class="px-3 small text-body-secondary text-nowrap">{{ formatDateTime(ic.occurTime) }}</td>
                <td class="fw-bold text-primary text-nowrap">{{ ic.roomName || 'N/A' }}</td>
                <td>
                  <span class="fw-bold text-body-emphasis d-block">{{ ic.name }}</span>
                  <span class="small text-body-secondary">{{ ic.description }}</span>
                </td>
                <td>
                  <span class="badge"
                        :class="ic.status === 'RESOLVED' ? 'bg-success-subtle text-success border border-success-subtle' : (ic.status === 'PROCESSING' ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' : 'bg-secondary-subtle text-secondary-emphasis')">
                    {{ ic.status === 'RESOLVED' ? 'Đã giải quyết' : (ic.status === 'PROCESSING' ? 'Đang xử lý' : 'Chờ xử lý') }}
                  </span>
                </td>
                <td class="small text-body-secondary">
                  <div v-if="ic.handle">{{ ic.handle }}</div>
                  <div v-if="ic.money > 0 && ic.responsible === 'CUSTOMER'" class="text-danger fw-bold mt-1">
                    Phạt khách: +{{ formatPrice(ic.money) }}
                  </div>
                  <div v-else-if="ic.money > 0 && ic.responsible === 'HOTEL'" class="text-success fw-bold mt-1">
                    Bồi thường KS: -{{ formatPrice(ic.money) }}
                  </div>
                </td>
                <td class="text-end px-3">
                  <button @click="printIncident(ic)" class="btn btn-sm btn-outline-secondary text-body-emphasis" title="In phiếu báo cáo">
                    <i class="fas fa-print"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../utils/axios'
import { formatPrice, formatDate, formatDateTime } from '../../utils/formatters'

const activeTab = ref('bill')
const searchQuery = ref('')
const bills = ref([])
const payments = ref([])
const serviceUsages = ref([])
const incidents = ref([])
const isLoading = ref(true)

const getBillBadgeClass = (type) => {
  if (type === 'DEPOSIT') return 'bg-info-subtle text-info-emphasis border border-info-subtle'
  if (type === 'REFUND') return 'bg-success-subtle text-success border border-success-subtle'
  return 'bg-danger-subtle text-danger border border-danger-subtle'
}

const getBillTypeLabel = (type) => {
  if (type === 'DEPOSIT') return 'ĐẶT CỌC'
  if (type === 'REFUND') return 'HOÀN TIỀN'
  if (type === 'FINAL') return 'TẤT TOÁN'
  return type
}

const filteredBills = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return bills.value
  return bills.value.filter(b =>
    (b.id || '').toLowerCase().includes(q) ||
    (b.type || '').toLowerCase().includes(q) ||
    (b.note || '').toLowerCase().includes(q)
  )
})

const filteredPayments = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return payments.value
  return payments.value.filter(p =>
    (p.transaction || '').toLowerCase().includes(q) ||
    (p.method || '').toLowerCase().includes(q) ||
    (p.bill?.id || '').toLowerCase().includes(q) ||
    (p.note || '').toLowerCase().includes(q)
  )
})

const filteredServices = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return serviceUsages.value
  return serviceUsages.value.filter(u =>
    (u.service?.name || '').toLowerCase().includes(q) ||
    (u.rentalDetailId || '').toLowerCase().includes(q)
  )
})

const filteredIncidents = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return incidents.value
  return incidents.value.filter(ic =>
    (ic.name || '').toLowerCase().includes(q) ||
    (ic.description || '').toLowerCase().includes(q) ||
    (ic.roomName || '').toLowerCase().includes(q) ||
    (ic.handle || '').toLowerCase().includes(q)
  )
})

const fetchData = async () => {
  isLoading.value = true
  try {
    const [resHistory, resIncidents] = await Promise.all([
      api.get('/api/staff/history'),
      api.get('/api/staff/incidents')
    ])

    bills.value = resHistory.data.bills || []
    payments.value = resHistory.data.payments || []
    serviceUsages.value = resHistory.data.serviceUsages || []
    incidents.value = resIncidents.data.incidents || []
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const printIncident = (incident) => {
  const printWindow = window.open('', '', 'height=600,width=800')
  const moneyRow = incident.money > 0
    ? (incident.responsible === 'HOTEL'
        ? `<div class="row"><span class="label">Bồi thường khách:</span> <strong style="color: green;">-${formatPrice(incident.money)}</strong></div>`
        : `<div class="row"><span class="label">Tiền phạt khách:</span> <strong style="color: red;">+${formatPrice(incident.money)}</strong></div>`)
    : ''

  printWindow.document.write(`
    <html><head><title>Phiếu Báo Sự Cố</title>
    <style>
      body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
      .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
      .row { margin-bottom: 10px; }
      .label { font-weight: bold; width: 150px; display: inline-block; }
    </style></head><body>
    <div class="header"><h2>PHIẾU BÁO SỰ CỐ</h2></div>
    <div class="row"><span class="label">Mã sự cố:</span> ${incident.id}</div>
    <div class="row"><span class="label">Thời gian phát hiện:</span> ${formatDate(incident.occurTime)}</div>
    <div class="row"><span class="label">Phòng:</span> ${incident.roomName || 'Không xác định'}</div>
    <div class="row"><span class="label">Tên sự cố:</span> ${incident.name}</div>
    <div class="row"><span class="label">Mô tả chi tiết:</span> ${incident.description || ''}</div>
    <br><hr><br>
    <h4>THÔNG TIN XỬ LÝ (TỪ QUẢN LÝ)</h4>
    <div class="row"><span class="label">Trạng thái:</span> ${incident.status === 'RESOLVED' ? 'Đã giải quyết' : (incident.status === 'PROCESSING' ? 'Đang xử lý' : 'Chờ xử lý')}</div>
    <div class="row"><span class="label">Hướng xử lý:</span> ${incident.handle || 'Chưa có thông tin'}</div>
    ${moneyRow}
    <br><br><br><br>
    <div style="display: flex; justify-content: space-around;">
      <div><strong>Người lập phiếu</strong><br><br><br>......................</div>
      <div><strong>Xác nhận của Quản lý</strong><br><br><br>......................</div>
    </div>
    </body></html>
  `)
  printWindow.document.close()
  printWindow.print()
}

onMounted(() => fetchData())
</script>

<style scoped>
.nav-tabs .nav-link {
  cursor: pointer;
}

.history-scroll {
  max-height: 62vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--bs-border-color) transparent;
}

.history-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.history-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.history-scroll::-webkit-scrollbar-thumb {
  background-color: var(--bs-border-color);
  border-radius: 3px;
}

.history-scroll::-webkit-scrollbar-thumb:hover {
  background-color: var(--bs-secondary-color);
}

.adaptive-thead th {
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: var(--bs-tertiary-bg) !important;
  color: var(--bs-secondary-color) !important;
  border-bottom: 1px solid var(--bs-border-color) !important;
  font-size: 0.85rem;
}
</style>