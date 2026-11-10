<template>
  <div class="card border-0 shadow-sm rounded-4 mb-4">
    <div class="card-header bg-white border-0 pt-4 pb-0">
      <h5 class="fw-bold mb-1"><i class="fas fa-file-invoice-dollar me-2 text-primary"></i>Lịch sử Giao dịch, Hóa đơn & Sự cố</h5>
    </div>
    
    <div class="card-body">
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <button class="nav-link fw-bold" :class="{ 'active text-dark': activeTab === 'bill' }" @click="activeTab = 'bill'">
            <i class="fas fa-receipt me-1"></i>Hóa đơn
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold" :class="{ 'active text-success': activeTab === 'payment' }" @click="activeTab = 'payment'">
            <i class="fas fa-money-bill-wave me-1"></i>Thanh toán
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold" :class="{ 'active text-primary': activeTab === 'service' }" @click="activeTab = 'service'">
            <i class="fas fa-concierge-bell me-1"></i>Dịch vụ
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold" :class="{ 'active text-warning': activeTab === 'incident' }" @click="activeTab = 'incident'">
            <i class="fas fa-exclamation-triangle me-1"></i>Sự cố
          </button>
        </li>
      </ul>

      <div v-if="isLoading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
      
      <div v-else class="tab-content border rounded bg-white">
        <!-- Hóa đơn -->
        <div v-if="activeTab === 'bill'" class="table-responsive p-2" style="max-height: 400px; overflow-y: auto;">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light position-sticky top-0"><tr><th class="px-3">Thời gian</th><th>Mã hóa đơn</th><th>Phân loại</th><th class="text-end px-3">Tổng tiền</th></tr></thead>
            <tbody><tr v-for="b in bills" :key="b.id"><td class="px-3 small text-muted">{{ formatDate(b.createDate) }}</td><td class="fw-bold">{{ b.id }}</td><td><span class="badge" :class="b.type === 'DEPOSIT' ? 'bg-info text-dark' : 'bg-danger'">{{ b.type }}</span></td><td class="text-end px-3 fw-bold text-danger">{{ formatPrice(b.totalAmount) }}</td></tr></tbody>
          </table>
        </div>

        <!-- Thanh toán -->
        <div v-if="activeTab === 'payment'" class="table-responsive p-2" style="max-height: 400px; overflow-y: auto;">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light position-sticky top-0"><tr><th class="px-3">Thời gian</th><th>Mã Giao dịch</th><th>Phương thức</th><th>Mã Hóa đơn</th></tr></thead>
            <tbody><tr v-for="p in payments" :key="p.id"><td class="px-3 small text-muted">{{ formatDate(p.date) }}</td><td class="fw-bold text-success">{{ p.transaction }}</td><td><span class="badge bg-success-subtle text-success border border-success">{{ p.method }}</span></td><td class="small text-muted">{{ p.bill?.id }}</td></tr></tbody>
          </table>
        </div>

        <!-- Dịch vụ -->
        <div v-if="activeTab === 'service'" class="table-responsive p-2" style="max-height: 400px; overflow-y: auto;">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light position-sticky top-0"><tr><th class="px-3">Thời gian</th><th>Dịch vụ</th><th>SL</th><th class="text-end px-3">Thành tiền</th></tr></thead>
            <tbody><tr v-for="u in serviceUsages" :key="u.id"><td class="px-3 small text-muted">{{ formatDate(u.time) }}</td><td><span class="badge bg-light text-primary border border-primary">{{ u.service?.name }}</span></td><td class="fw-bold text-secondary">{{ u.count }}</td><td class="text-end px-3 fw-bold text-danger">{{ formatPrice(u.unitPrice * u.count) }}</td></tr></tbody>
          </table>
        </div>
        
        <!-- Sự cố -->
        <div v-if="activeTab === 'incident'" class="table-responsive p-2" style="max-height: 400px; overflow-y: auto;">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light position-sticky top-0">
              <tr>
                <th class="px-3">Thời gian</th>
                <th>Phòng</th>
                <th>Sự cố</th>
                <th>Trạng thái</th>
                <th>Hướng xử lý</th>
                <th class="text-end px-3">In</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="incidents.length === 0">
                <td colspan="6" class="text-center text-muted py-4">Không có sự cố nào được ghi nhận.</td>
              </tr>
              <tr v-for="ic in incidents" :key="ic.id">
                <td class="px-3 small text-muted">{{ formatDate(ic.occurTime) }}</td>
                <td class="fw-bold">{{ ic.roomName || 'N/A' }}</td>
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
                <td class="text-end px-3">
                  <button @click="printIncident(ic)" class="btn btn-sm btn-outline-secondary" title="In phiếu báo cáo">
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
import { ref, onMounted } from 'vue'
import api from '../../utils/axios'
import { formatPrice, formatDate, formatTime, formatDateTime } from '../../utils/formatters'

const activeTab = ref('bill') 
const bills = ref([])
const payments = ref([])
const serviceUsages = ref([])
const incidents = ref([])
const isLoading = ref(true)

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
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>Phiếu Báo Sự Cố</title>');
  printWindow.document.write('<style>body { font-family: sans-serif; padding: 20px; line-height: 1.6; } .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; } .row { margin-bottom: 10px; } .label { font-weight: bold; width: 150px; display: inline-block; }</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<div class="header"><h2>PHIẾU BÁO SỰ CỐ</h2></div>');
  printWindow.document.write(`<div class="row"><span class="label">Mã sự cố:</span> ${incident.id}</div>`);
  printWindow.document.write(`<div class="row"><span class="label">Thời gian phát hiện:</span> ${formatDate(incident.occurTime)}</div>`);
  printWindow.document.write(`<div class="row"><span class="label">Phòng:</span> ${incident.roomName || 'Không xác định'}</div>`);
  printWindow.document.write(`<div class="row"><span class="label">Tên sự cố:</span> ${incident.name}</div>`);
  printWindow.document.write(`<div class="row"><span class="label">Mô tả chi tiết:</span> ${incident.description}</div>`);
  printWindow.document.write(`<br><hr><br>`);
  printWindow.document.write(`<h4>THÔNG TIN XỬ LÝ (TỪ QUẢN LÝ)</h4>`);
  printWindow.document.write(`<div class="row"><span class="label">Trạng thái:</span> ${incident.status === 'RESOLVED' ? 'Đã giải quyết' : (incident.status === 'PROCESSING' ? 'Đang xử lý' : 'Chờ xử lý')}</div>`);
  printWindow.document.write(`<div class="row"><span class="label">Hướng xử lý:</span> ${incident.handle || 'Chưa có thông tin'}</div>`);
  if(incident.money > 0) {
      printWindow.document.write(`<div class="row"><span class="label">Tiền phạt khách:</span> <strong style="color: red;">${formatPrice(incident.money)}</strong></div>`);
  }
  printWindow.document.write('<br><br><br><br><div style="display: flex; justify-content: space-around;"><div><strong>Người lập phiếu</strong><br><br><br>......................</div><div><strong>Xác nhận của Quản lý</strong><br><br><br>......................</div></div>');
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}

onMounted(() => fetchData())
</script>

<style scoped>
.nav-tabs .nav-link { cursor: pointer; color: #6c757d; }
.nav-tabs .nav-link.active { border-bottom-color: transparent; }

.table-responsive thead th {
  position: sticky;
  top: 0;
  background-color: var(--bs-secondary-bg) !important;
  z-index: 10;
  box-shadow: inset 0 -1px 0 var(--bs-border-color); /* Tạo viền dưới cho header */
}
</style>