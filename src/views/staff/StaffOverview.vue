<template>
  <div>
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
         
    <div v-else>
      <!-- HÀNG 1: 4 THẺ KPI -->
      <div class="row g-4 mb-4">
        <div class="col-lg-3 col-sm-6">
          <div class="card border-0 shadow-sm rounded-4 h-100 bg-warning text-dark">
            <div class="card-body p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-uppercase mb-1 fw-bold opacity-75">Booking chờ cọc</h6>
                <h2 class="fw-bold mb-0">{{ overviewData.pendingBookingCount || 0 }}</h2>
              </div>
              <div class="fs-1 opacity-50"><i class="fas fa-hourglass-half"></i></div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-sm-6">
          <div class="card border-0 shadow-sm rounded-4 h-100 bg-primary text-white">
            <div class="card-body p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-uppercase mb-1 fw-bold opacity-75">Khách đến hôm nay</h6>
                <h2 class="fw-bold mb-0">{{ overviewData.todayArrivalsCount || 0 }}</h2>
              </div>
              <div class="fs-1 opacity-50"><i class="fas fa-door-open"></i></div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-sm-6">
          <div class="card border-0 shadow-sm rounded-4 h-100 bg-success text-white">
            <div class="card-body p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-uppercase mb-1 fw-bold opacity-75">Đang lưu trú</h6>
                <h2 class="fw-bold mb-0">{{ overviewData.checkedInCount || 0 }}</h2>
              </div>
              <div class="fs-1 opacity-50"><i class="fas fa-bed"></i></div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-sm-6">
          <div class="card border-0 shadow-sm rounded-4 h-100 bg-danger text-white">
            <div class="card-body p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-uppercase mb-1 fw-bold opacity-75">Phòng cần dọn</h6>
                <h2 class="fw-bold mb-0">{{ overviewData.checkedOutCount || 0 }}</h2>
              </div>
              <div class="fs-1 opacity-50"><i class="fas fa-broom"></i></div>
            </div>
          </div>
        </div>
      </div>

      <!-- HÀNG 2: BIỂU ĐỒ & BẢNG KHÁCH ĐẾN -->
      <div class="row g-4">
        <!-- Biểu đồ -->
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h6 class="fw-bold"><i class="fas fa-chart-pie text-primary me-2"></i>Trạng thái phòng hiện tại</h6>
            </div>
            <div class="card-body d-flex justify-content-center align-items-center p-4">
              <div style="width: 250px; height: 250px;" v-if="chartData">
                <Doughnut :data="chartData" :options="chartOptions" />
              </div>
            </div>
          </div>
        </div>
                 
        <!-- Bảng danh sách khách chuẩn bị đến -->
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between">
              <h6 class="fw-bold"><i class="fas fa-user-clock text-warning me-2"></i>Khách chuẩn bị Check-in hôm nay</h6>
              <router-link to="/employee/staff/bookings" class="btn btn-sm btn-outline-primary">Xem tất cả</router-link>
            </div>
            <div class="card-body p-4">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr><th>Khách hàng</th><th>Phòng</th><th class="text-end">Giờ nhận</th></tr>
                  </thead>
                  <tbody>
                    <tr v-if="!overviewData.todayArrivalsList || overviewData.todayArrivalsList.length === 0">
                      <td colspan="3" class="text-center text-muted py-3">Không có khách đến.</td>
                    </tr>
                    <tr v-else v-for="a in overviewData.todayArrivalsList.slice(0, 5)" :key="a.id">
                      <td class="fw-semibold">{{ a.customer?.user?.lastName }} {{ a.customer?.user?.firstName }}</td>
                      <td><span class="badge bg-secondary">{{ a.rentalDetails[0]?.room?.name }}</span></td>
                      <td class="text-end fw-bold text-primary">{{ formatTime(a.rentalDetails[0]?.checkinDate) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- HÀNG 3: BẢNG DANH SÁCH PHÒNG (READ-ONLY CHO LỄ TÂN) -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
            <div class="card-header bg-transparent border-bottom-0 pt-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h6 class="fw-bold text-body-emphasis mb-0"><i class="fas fa-door-open text-primary me-2"></i>Danh sách toàn bộ phòng</h6>
              <div class="input-group input-group-sm shadow-sm" style="width: 250px;">
                <span class="input-group-text bg-body border-secondary-subtle"><i class="fas fa-search text-body-secondary"></i></span>
                <input type="text" v-model="searchRoomQuery" class="form-control bg-body border-secondary-subtle" placeholder="Tìm tên phòng...">
              </div>
            </div>
            
            <div class="card-body p-0 mt-2">
              <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                <table class="table table-hover align-middle mb-0 custom-table">
                  <thead class="table-light text-body-secondary" style="font-size: 0.75rem;">
                    <tr>
                      <th class="px-4 py-3 fw-bold border-0 text-uppercase" style="width: 15%;">Phòng</th>
                      <th class="py-3 fw-bold border-0 text-uppercase" style="width: 25%;">Hạng phòng</th>
                      <th class="py-3 fw-bold border-0 text-uppercase text-center">Sức chứa</th>
                      <th class="py-3 fw-bold border-0 text-uppercase">Tiện ích</th>
                      <th class="py-3 fw-bold border-0 text-uppercase text-center">Trạng thái</th>
                      <th class="px-4 py-3 fw-bold border-0 text-end">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody class="bg-body border-top-0">
                    <tr v-if="filteredRooms.length === 0">
                      <td colspan="6" class="text-center py-4 text-body-secondary">Không tìm thấy phòng phù hợp.</td>
                    </tr>
                    <tr v-else v-for="r in filteredRooms" :key="r.id" class="table-row-hover border-bottom border-secondary-subtle">
                      <td class="px-4 py-3">
                        <div class="fw-bold text-primary fs-6">{{ r.name }}</div>
                        <div class="text-body-secondary small mt-1"><i class="fas fa-map-marker-alt text-danger me-1"></i>{{ r.location }}</div>
                      </td>
                      <td>
                        <div class="fw-bold text-body-emphasis">{{ r.roomType?.name || 'N/A' }}</div>
                        <div class="text-body-secondary small mt-1">{{ r.roomType?.bed }}</div>
                      </td>
                      <td class="text-center">
                        <span class="badge bg-body-secondary text-body-emphasis border border-secondary-subtle me-1 px-2 py-1" title="Người lớn"><i class="fas fa-user text-secondary me-1"></i> {{ r.roomType?.adultMax || 0 }}</span>
                        <span class="badge bg-body-secondary text-body-emphasis border border-secondary-subtle px-2 py-1" title="Trẻ em"><i class="fas fa-child text-secondary me-1"></i> {{ r.roomType?.childrenMax || 0 }}</span>
                      </td>
                      <td>
                         <div v-if="r.roomType?.roomAmenities && r.roomType.roomAmenities.length > 0" class="d-flex flex-wrap gap-2" style="max-width: 200px;">
                            <span v-for="ra in r.roomType.roomAmenities.slice(0, 2)" :key="ra.amenity?.id" class="badge bg-body border border-secondary-subtle text-body-emphasis fw-normal px-2 py-1 shadow-sm">
                              {{ ra.amenity?.name }}
                            </span>
                            <span v-if="r.roomType.roomAmenities.length > 2" class="badge bg-body border border-secondary-subtle text-body-secondary fw-normal px-2 py-1 shadow-sm">
                              +{{ r.roomType.roomAmenities.length - 2 }}
                            </span>
                         </div>
                         <span v-else class="text-body-secondary small fst-italic">Chưa có</span>
                      </td>
                      <td class="text-center">
                        <span class="badge rounded-pill fw-bold px-3 py-2 shadow-sm" 
                              :class="r.status === 'AVAILABLE' ? 'bg-success-subtle text-success' : (r.status === 'CLEANING' ? 'bg-info-subtle text-info' : (r.status === 'MAINTENANCE' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'))">
                          {{ r.status === 'AVAILABLE' ? 'TRỐNG' : r.status === 'CLEANING' ? 'ĐANG DỌN' : r.status === 'MAINTENANCE' ? 'BẢO TRÌ' : 'ĐANG Ở' }}
                        </span>
                      </td>
                      <td class="text-end px-4">
                        <button class="btn btn-sm btn-dark rounded-pill shadow-sm fw-bold px-3" @click="viewRoomDetails(r)">
                          <i class="fas fa-list me-1"></i> Xem
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL CHI TIẾT TƯ VẤN (CỦA STAFF) -->
    <div v-if="showRoomDetailModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-dark text-white border-0">
            <h5 class="modal-title fw-bold">
              <i class="fas fa-info-circle me-2 text-info"></i>Chi tiết Phòng: {{ selectedRoom?.name }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="showRoomDetailModal = false"></button>
          </div>
          
          <div class="modal-body p-4" v-if="selectedRoom">
            <div class="row g-4">
              <!-- Cột trái: Thông tin hạng phòng & Giá -->
              <div class="col-md-6 border-end border-secondary-subtle">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="fw-bold text-primary mb-0">{{ selectedRoom.roomType?.name }}</h5>
                    <span class="badge rounded-pill fw-bold px-3" 
                        :class="selectedRoom.status === 'AVAILABLE' ? 'bg-success' : (selectedRoom.status === 'CLEANING' ? 'bg-info text-dark' : (selectedRoom.status === 'MAINTENANCE' ? 'bg-warning text-dark' : 'bg-danger'))">
                    {{ selectedRoom.status }}
                    </span>
                </div>
                <p class="text-body-secondary small mb-3"><i class="fas fa-map-marker-alt text-danger me-1"></i> Vị trí: {{ selectedRoom.location }}</p>
                
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <span class="badge bg-body border border-secondary-subtle text-body-emphasis px-2 py-1"><i class="fas fa-bed text-secondary me-1"></i> {{ selectedRoom.roomType?.bed }}</span>
                  <span class="badge bg-body border border-secondary-subtle text-body-emphasis px-2 py-1"><i class="fas fa-user-friends text-secondary me-1"></i> {{ selectedRoom.roomType?.adultMax }} NL, {{ selectedRoom.roomType?.childrenMax }} TE</span>
                  <span class="badge bg-body border border-secondary-subtle text-body-emphasis px-2 py-1"><i class="fas fa-vector-square text-secondary me-1"></i> {{ selectedRoom.roomType?.area }} m&sup2;</span>
                </div>

                <div class="bg-body p-3 rounded-3 border border-secondary-subtle mb-3">
                    <p class="mb-1 small"><strong>Giá theo giờ:</strong> <span class="text-success fw-bold ms-2">{{ formatPrice(selectedRoom.roomType?.basePrice) }}/h</span></p>
                    <p class="mb-1 small"><strong>Giá qua đêm:</strong> <span class="text-primary fw-bold ms-2">{{ formatPrice(selectedRoom.roomType?.dailyPrice || (selectedRoom.roomType?.basePrice * 22)) }}/đêm</span></p>
                    <p class="mb-0 small"><strong>Tiền cọc:</strong> <span class="text-danger fw-bold ms-2">{{ selectedRoom.roomType?.depositPercent }}%</span></p>
                </div>

                <h6 class="fw-bold text-body-emphasis small">Tiện ích:</h6>
                <div v-if="selectedRoom.roomType?.roomAmenities && selectedRoom.roomType.roomAmenities.length > 0" class="d-flex flex-wrap gap-1 mb-3">
                  <span v-for="ra in selectedRoom.roomType.roomAmenities" :key="ra.amenity?.id" class="badge bg-light text-dark border border-secondary-subtle">
                    {{ ra.amenity?.name }}
                  </span>
                </div>
                <div v-else class="text-body-secondary small fst-italic mb-3">Chưa có tiện ích</div>
              </div>

              <!-- Cột phải: Danh sách các phòng cùng hạng -->
              <div class="col-md-6">
                <h6 class="fw-bold text-body-emphasis mb-2"><i class="fas fa-layer-group text-warning me-2"></i>Hạng phòng này áp dụng cho:</h6>
                <p class="small text-body-secondary mb-3">Các phòng vật lý dưới đây có cùng mức giá và tiện ích.</p>
                
                <div class="d-flex flex-wrap gap-2">
                  <span v-for="r in sameTypeRooms" :key="r.id" 
                        class="badge fs-6 py-2 px-3 shadow-sm border border-secondary-subtle" 
                        :class="r.id === selectedRoom.id ? 'bg-primary text-white' : (r.status === 'AVAILABLE' ? 'bg-success-subtle text-success' : 'bg-body text-body-emphasis')">
                    P. {{ r.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer bg-body border-0 rounded-bottom-4">
            <button type="button" class="btn btn-secondary fw-semibold px-4" @click="showRoomDetailModal = false">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../utils/axios'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { formatPrice } from '../../utils/formatters'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const overviewData = ref({})
const isLoading = ref(true)

const formatTime = (val) => val ? new Date(val).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''

const chartData = computed(() => {
  if (!overviewData.value.roomStatusCounts) return null
  return {
    labels: ['Trống', 'Đang ở', 'Đang dọn', 'Bảo trì'],
    datasets: [{
      backgroundColor: ['#198754', '#ffc107', '#0dcaf0', '#dc3545'],
      data: overviewData.value.roomStatusCounts
    }]
  }
})

const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }

// --- QUẢN LÝ TÌM KIẾM VÀ MODAL XEM CHI TIẾT PHÒNG ---
const searchRoomQuery = ref('')
const showRoomDetailModal = ref(false)
const selectedRoom = ref(null)

// Lọc phòng theo ô tìm kiếm
const filteredRooms = computed(() => {
  if (!overviewData.value.rooms) return []
  if (!searchRoomQuery.value.trim()) return overviewData.value.rooms
  const q = searchRoomQuery.value.toLowerCase().trim()
  return overviewData.value.rooms.filter(r => r.name?.toLowerCase().includes(q))
})

// Tính toán các phòng có cùng loại phòng với phòng đang chọn
const sameTypeRooms = computed(() => {
  if (!selectedRoom.value || !overviewData.value.rooms) return []
  return overviewData.value.rooms.filter(r => r.roomType?.id === selectedRoom.value.roomType?.id)
})

const viewRoomDetails = (room) => {
  selectedRoom.value = room
  showRoomDetailModal.value = true
}

const fetchOverview = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/staff/overview')
    overviewData.value = res.data
  } catch (error) { 
    console.error('Lỗi tổng quan:', error) 
  } finally { 
    isLoading.value = false 
  }
}

onMounted(() => fetchOverview())
</script>

<style scoped>
/* Fix lỗi sticky header bị trong suốt khi cuộn */
.table-responsive thead th {
  position: sticky;
  top: 0;
  background-color: var(--bs-secondary-bg) !important;
  z-index: 10;
  box-shadow: inset 0 -1px 0 var(--bs-border-color);
}
.custom-table th {
  background-color: transparent !important;
  font-weight: 700;
  color: var(--bs-secondary);
}
.table-row-hover:hover {
  background-color: var(--bs-secondary-bg) !important;
  transition: background-color 0.2s;
}
</style>