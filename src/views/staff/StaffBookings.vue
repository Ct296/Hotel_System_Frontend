<template>
  <div class="card border-0 shadow-sm rounded-4 mb-4">
    <div class="card-header bg-white border-0 pt-4 pb-0">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h5 class="fw-bold mb-1"><i class="fas fa-list-check me-2 text-primary"></i>Xử lý Booking & Khách đến</h5>
          <p class="small text-muted mb-0">Quản lý đơn chờ thu cọc, khách nhận phòng hôm nay và toàn bộ lịch đặt trước.</p>
        </div>

        <!-- Ô TÌM KIẾM NHANH (TÊN KHÁCH, CCCD, MÃ ĐƠN, PHÒNG) -->
        <div class="input-group input-group-sm shadow-sm" style="max-width: 340px;">
          <span class="input-group-text bg-light border-secondary-subtle"><i class="fas fa-search text-secondary"></i></span>
          <input type="text" v-model="searchQuery" class="form-control border-secondary-subtle" 
                 placeholder="Tìm tên khách, CCCD, SĐT, mã đơn...">
          <button v-if="searchQuery" class="btn btn-outline-secondary border-secondary-subtle" type="button" @click="searchQuery = ''" title="Xóa tìm kiếm">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- 2 THẺ TAB CHUYỂN ĐỔI -->
      <ul class="nav nav-tabs mt-3">
        <li class="nav-item">
          <button class="nav-link fw-bold cursor-pointer" :class="{ 'active text-primary': activeTab === 'today' }" @click="activeTab = 'today'">
            <i class="fas fa-calendar-day me-1"></i> Hôm nay & Chờ cọc
            <span class="badge bg-primary ms-1">{{ todayAndPendingCount }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold cursor-pointer" :class="{ 'active text-success': activeTab === 'all' }" @click="activeTab = 'all'">
            <i class="fas fa-layer-group me-1"></i> Toàn bộ lượt đặt
            <span class="badge bg-success ms-1">{{ allBookingsCount }}</span>
          </button>
        </li>
      </ul>
    </div>
    
    <div class="card-body">
      <!-- Thông báo Toast -->
      <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
        <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
        {{ notification.message }}
        <button type="button" class="btn-close" @click="notification.message = ''"></button>
      </div>

      <div v-if="isLoading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
      
      <!-- Bảng danh sách -->
      <div v-else class="table-responsive border rounded bg-white">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Mã Booking / Chủ đơn</th>
              <th>Phòng & Người đại diện nhận</th>
              <th>Giờ nhận phòng</th>
              <th class="text-center">Trạng thái</th>
              <th class="text-end">Tiền cọc</th>
              <th class="text-end px-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredBookings.length === 0">
              <td colspan="6" class="text-center text-muted py-4">
                <span v-if="searchQuery">Không tìm thấy lượt đặt nào khớp với "<strong>{{ searchQuery }}</strong>".</span>
                <span v-else-if="activeTab === 'today'">Hôm nay không có booking chờ xử lý. Hãy chuyển sang thẻ <strong>Toàn bộ lượt đặt</strong> để xem các ngày khác.</span>
                <span v-else>Hiện không có lượt đặt phòng nào đang chờ.</span>
              </td>
            </tr>
            <tr v-else v-for="b in filteredBookings" :key="b.id">
              <td>
                <div class="fw-bold text-dark">{{ b.id }}</div>
                <div class="small text-muted">
                  <i class="fas fa-user me-1"></i>{{ b.customer?.user?.lastName }} {{ b.customer?.user?.firstName }}
                </div>
                <div v-if="b.customer?.user?.pid" class="small text-secondary" style="font-size: 0.75rem;">
                  <i class="fas fa-id-card me-1"></i>CCCD: <strong>{{ b.customer.user.pid }}</strong>
                </div>
              </td>
              <td>
                <div v-for="(d, i) in b.rentalDetails" :key="i" class="mb-1">
                  <span class="badge bg-secondary me-1">P.{{ d.room?.name || 'N/A' }}</span>
                  <span class="small text-muted">({{ d.adultCount }} NL, {{ d.childrenCount }} TE)</span>
                  <span v-if="d.rentalGuests && d.rentalGuests.length > 0" class="small ms-1 text-primary fw-semibold">
                    - Đại diện: {{ d.rentalGuests[0].fullName }}
                    <span v-if="d.rentalGuests[0].pid" class="text-dark fw-normal">[CCCD: {{ d.rentalGuests[0].pid }}]</span>
                    <span v-else-if="d.rentalGuests[0].phoneNumber" class="text-muted fw-normal">({{ d.rentalGuests[0].phoneNumber }})</span>
                  </span>
                </div>
              </td>
              <td class="small fw-semibold" :class="b.status === 'CONFIRMED' ? 'text-primary' : ''">
                {{ formatDateTime(b.rentalDetails[0]?.checkinDate) }}
              </td>
              <td class="text-center">
                <span v-if="b.status === 'PENDING'" class="badge bg-warning text-dark">Chờ cọc</span>
                <span v-else class="badge bg-primary">Đã xác nhận</span>
              </td>
              <td class="text-end fw-bold text-danger">
                {{ b.depositAmount ? formatPrice(b.depositAmount) : (b.status === 'PENDING' ? 'Chưa tính' : 'Đã thu') }}
              </td>
              <td class="text-end px-3">
                <template v-if="b.status === 'PENDING'">
                  <button @click="payDeposit(b)" class="btn btn-sm btn-success py-1 px-2 me-2 shadow-sm" title="Thu tiền cọc">
                    <i class="fas fa-money-bill-wave me-1"></i> Thu cọc
                  </button>
                  <button @click="cancelBooking(b)" class="btn btn-sm btn-outline-danger py-1 px-2 shadow-sm" title="Hủy">
                    <i class="fas fa-times"></i>
                  </button>
                </template>
                <template v-else>
                  <button @click="openCheckInModal(b)" class="btn btn-sm btn-primary shadow-sm py-1 px-3 fw-bold">
                    <i class="fas fa-id-card-clip me-1"></i> Check-in
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== MODAL CHECK-IN & KHAI BÁO KHÁCH LƯU TRÚ TỪNG PHÒNG ==================== -->
    <div v-if="showCheckInModal && selectedBookingForCheckIn" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.55); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body">
          <div class="modal-header bg-primary text-white border-0">
            <div>
              <h5 class="modal-title fw-bold mb-0">
                <i class="fas fa-id-card me-2"></i>Thủ tục Check-in & Khai báo lưu trú (#{{ selectedBookingForCheckIn.id }})
              </h5>
              <small class="opacity-75">
                Người đặt đơn: {{ selectedBookingForCheckIn.customer?.user?.lastName }} {{ selectedBookingForCheckIn.customer?.user?.firstName }}
                (CCCD: {{ selectedBookingForCheckIn.customer?.user?.pid || 'N/A' }})
              </small>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="closeCheckInModal" :disabled="isProcessing"></button>
          </div>

          <form @submit.prevent="submitCheckInWithGuests">
            <div class="modal-body p-4" style="max-height: 70vh; overflow-y: auto;">
              <div v-if="checkInModalError" class="alert alert-danger py-2 small fw-semibold">
                <i class="fas fa-exclamation-triangle me-1"></i> {{ checkInModalError }}
              </div>

              <div class="alert alert-info py-2 px-3 small mb-3">
                <i class="fas fa-info-circle me-1"></i>
                <strong>Quy định lưu trú:</strong> Vui lòng kiểm tra và nhập đầy đủ Họ tên + Số CCCD/Hộ chiếu của tất cả <strong>Người lớn</strong> lưu trú trong từng phòng (Trẻ em chỉ bắt buộc Họ tên). Mỗi số CCCD chỉ được đăng ký ở 1 phòng.
              </div>

              <!-- Lặp qua từng phòng trong đơn -->
              <div v-for="(group, gIdx) in checkInGuestGroups" :key="group.rentalDetailId" class="card border border-secondary-subtle rounded-3 mb-3 shadow-sm">
                <div class="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2 py-2">
                  <div>
                    <span class="fw-bold text-primary fs-6">Phòng {{ group.roomName }}</span>
                    <span class="badge bg-secondary ms-2">{{ group.roomTypeName }}</span>
                    <span class="small text-muted ms-2">
                      (Tối đa: <strong>{{ group.maxAdults }} NL, {{ group.maxChildren }} TE</strong>)
                    </span>
                  </div>
                  <div class="d-flex gap-2">
                    <button type="button" class="btn btn-xs btn-outline-primary fw-bold py-1 px-2"
                            @click="addGuestRow(gIdx, true)"
                            :disabled="countAdults(group) >= group.maxAdults">
                      <i class="fas fa-user-plus me-1"></i>+ Người lớn ({{ countAdults(group) }}/{{ group.maxAdults }})
                    </button>
                    <button v-if="group.maxChildren > 0" type="button" class="btn btn-xs btn-outline-info fw-bold py-1 px-2"
                            @click="addGuestRow(gIdx, false)"
                            :disabled="countChildren(group) >= group.maxChildren">
                      <i class="fas fa-child me-1"></i>+ Trẻ em ({{ countChildren(group) }}/{{ group.maxChildren }})
                    </button>
                  </div>
                </div>

                <div class="card-body p-3">
                  <div v-for="(guest, idx) in group.guests" :key="idx" class="row g-2 align-items-center mb-2 pb-2 border-bottom border-light">
                    <div class="col-md-2">
                      <select v-model="guest.isAdult" class="form-select form-select-sm fw-semibold"
                              :class="guest.isAdult ? 'text-primary border-primary-subtle' : 'text-info border-info-subtle'"
                              @change="validateRoleSwitch(group, guest)">
                        <option :value="true">Người lớn</option>
                        <option :value="false" :disabled="group.maxChildren <= 0">Trẻ em</option>
                      </select>
                    </div>
                    <div class="col-md-4">
                      <input type="text" v-model="guest.fullName" class="form-control form-control-sm"
                             :placeholder="idx === 0 ? 'Họ tên người đại diện (*)' : 'Họ và tên khách (*)'" required>
                    </div>
                    <div class="col-md-3">
                      <input type="text" v-model="guest.pid" class="form-control form-control-sm"
                             :placeholder="guest.isAdult ? 'Số CCCD/Hộ chiếu (*)' : 'CCCD/Định danh (Nếu có)'"
                             :required="guest.isAdult" minlength="9" maxlength="20">
                    </div>
                    <div class="col-md-2">
                      <input type="text" v-model="guest.phoneNumber" class="form-control form-control-sm"
                             placeholder="SĐT (Tùy chọn)">
                    </div>
                    <div class="col-md-1 text-end">
                      <span v-if="idx === 0" class="badge bg-success-subtle text-success border border-success-subtle" title="Người đại diện phòng">Đ.Diện</span>
                      <button v-else type="button" class="btn btn-sm btn-outline-danger py-0 px-2" @click="removeGuestRow(gIdx, idx)" title="Xóa khách này">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer bg-light border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary fw-semibold px-4" @click="closeCheckInModal" :disabled="isProcessing">Hủy</button>
              <button type="submit" class="btn btn-primary fw-bold px-4 shadow-sm" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="fas fa-check-circle me-1"></i> Xác nhận Check-in & Giao phòng
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL CONFIRM (Dùng cho Thu cọc & Hủy đơn) -->
    <div v-if="showConfirmModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
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
import { useRouter } from 'vue-router'
import api from '../../utils/axios'
import { formatPrice, formatDate, formatTime, formatDateTime } from '../../utils/formatters'

const router = useRouter()
const pendingBookings = ref([])
const todayArrivals = ref([])
const allConfirmedBookings = ref([])
const isLoading = ref(true)
const isProcessing = ref(false)
const notification = ref({ type: '', message: '' })

// Quản lý Tab & Tìm kiếm
const activeTab = ref('today') // 'today' | 'all'
const searchQuery = ref('')

// Quản lý Modal Confirm
const showConfirmModal = ref(false)
const confirmConfig = ref({ title: '', message: '', type: 'primary', icon: '', action: null })

// Quản lý Modal Check-in kèm khai báo khách lưu trú
const showCheckInModal = ref(false)
const selectedBookingForCheckIn = ref(null)
const checkInGuestGroups = ref([])
const checkInModalError = ref('')

// Đếm số lượng trên từng tab
const todayAndPendingCount = computed(() => pendingBookings.value.length + todayArrivals.value.length)
const allBookingsCount = computed(() => pendingBookings.value.length + allConfirmedBookings.value.length)

// Danh sách gốc theo Tab (Nếu người dùng đang gõ tìm kiếm thì tự động tìm trên Toàn bộ lượt đặt để không bị sót)
const baseBookingsByTab = computed(() => {
  const useAll = activeTab.value === 'all' || searchQuery.value.trim().length > 0
  const confirmedSource = useAll ? allConfirmedBookings.value : todayArrivals.value
  const combined = [...pendingBookings.value, ...confirmedSource]
  return combined.sort((a, b) => {
    const dateA = new Date(a.rentalDetails?.[0]?.checkinDate || 0)
    const dateB = new Date(b.rentalDetails?.[0]?.checkinDate || 0)
    return dateA - dateB
  })
})

// Lọc theo từ khóa (Tên chủ đơn, CCCD chủ đơn, SĐT, Mã đơn, Phòng, Tên/CCCD/SĐT khách đại diện từng phòng)
const filteredBookings = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return baseBookingsByTab.value

  return baseBookingsByTab.value.filter(b => {
    const rentalIdMatch = b.id?.toLowerCase().includes(q)
    const u = b.customer?.user
    const bookerName = `${u?.lastName || ''} ${u?.firstName || ''}`.toLowerCase()
    const bookerPid = (u?.pid || '').toLowerCase()
    const bookerPhone = (u?.phoneNumber || '').toLowerCase()

    const bookerMatch = bookerName.includes(q) || bookerPid.includes(q) || bookerPhone.includes(q)

    const detailMatch = (b.rentalDetails || []).some(d => {
      const roomMatch = (d.room?.name || '').toLowerCase().includes(q)
      const guestMatch = (d.rentalGuests || []).some(g =>
        (g.fullName || '').toLowerCase().includes(q) ||
        (g.pid || '').toLowerCase().includes(q) ||
        (g.phoneNumber || '').toLowerCase().includes(q)
      )
      return roomMatch || guestMatch
    })

    return rentalIdMatch || bookerMatch || detailMatch
  })
})

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

const fetchBookings = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/api/staff/bookings')
    pendingBookings.value = res.data.pendingBookings || []
    todayArrivals.value = res.data.todayArrivals || []
    allConfirmedBookings.value = res.data.allConfirmedBookings || res.data.todayArrivals || []
  } catch (error) { 
    showNotification('danger', 'Lỗi khi tải danh sách booking.') 
  } finally { 
    isLoading.value = false 
  }
}

const payDeposit = (booking) => {
  const amountText = booking.depositAmount ? `<strong class='text-danger fs-5'>${formatPrice(booking.depositAmount)}</strong>` : 'tiền mặt'
  openConfirm(
    'Thu tiền cọc', 
    `Xác nhận thu ${amountText} từ khách hàng <b>${booking.customer?.user?.lastName} ${booking.customer?.user?.firstName}</b>?`, 
    'success', 
    'fas fa-money-bill-wave', 
    async () => {
      try {
        const res = await api.post(`/api/staff/bookings/${booking.id}/pay-deposit`)
        showNotification('success', res.data.message || 'Thu cọc thành công.')
        await fetchBookings()
      } catch (error) {
        showNotification('danger', error.response?.data?.error || 'Lỗi khi thu tiền cọc.')
      }
    }
  )
}

const cancelBooking = (booking) => {
  openConfirm(
    'Hủy Booking', 
    `Bạn có chắc chắn muốn hủy đơn <b>${booking.id}</b>? Thao tác này không thể hoàn tác.`, 
    'danger', 
    'fas fa-trash-alt', 
    async () => {
      try {
        await api.post(`/api/staff/bookings/${booking.id}/cancel`)
        showNotification('success', 'Đã hủy booking thành công.')
        await fetchBookings()
      } catch (error) {
        showNotification('danger', error.response?.data?.error || 'Lỗi khi hủy booking.')
      }
    }
  )
}

// ==================== LOGIC MODAL CHECK-IN & KHAI BÁO KHÁCH ====================
const countAdults = (group) => group.guests.filter(g => g.isAdult).length
const countChildren = (group) => group.guests.filter(g => !g.isAdult).length

const openCheckInModal = (booking) => {
  selectedBookingForCheckIn.value = booking
  checkInModalError.value = ''

  const bookerUser = booking.customer?.user
  const bookerFullName = bookerUser ? `${bookerUser.lastName || ''} ${bookerUser.firstName || ''}`.trim() : ''
  const bookerPid = bookerUser?.pid || ''
  const bookerPhone = bookerUser?.phoneNumber || ''

  checkInGuestGroups.value = (booking.rentalDetails || []).map((detail, dIdx) => {
    const maxAdults = detail.room?.roomType?.adultMax || 2
    const maxChildren = detail.room?.roomType?.childrenMax || 0
    const plannedAdults = Math.min(Math.max(detail.adultCount || 1, 1), maxAdults)
    const plannedChildren = Math.min(Math.max(detail.childrenCount || 0, 0), maxChildren)

    const existingGuests = detail.rentalGuests || []
    const guestsList = []

    if (existingGuests.length > 0) {
      existingGuests.forEach((eg, idx) => {
        guestsList.push({
          fullName: eg.fullName || '',
          pid: eg.pid || '',
          phoneNumber: eg.phoneNumber || '',
          isAdult: eg.isAdult !== false,
          isRepresentative: idx === 0
        })
      })
    } else if (dIdx === 0) {
      guestsList.push({
        fullName: bookerFullName,
        pid: bookerPid,
        phoneNumber: bookerPhone,
        isAdult: true,
        isRepresentative: true
      })
    } else {
      guestsList.push({
        fullName: '',
        pid: '',
        phoneNumber: '',
        isAdult: true,
        isRepresentative: true
      })
    }

    while (guestsList.filter(g => g.isAdult).length < plannedAdults) {
      guestsList.push({ fullName: '', pid: '', phoneNumber: '', isAdult: true, isRepresentative: false })
    }
    while (guestsList.filter(g => !g.isAdult).length < plannedChildren) {
      guestsList.push({ fullName: '', pid: '', phoneNumber: '', isAdult: false, isRepresentative: false })
    }

    return {
      rentalDetailId: detail.id,
      roomName: detail.room?.name || 'N/A',
      roomTypeName: detail.room?.roomType?.name || '',
      maxAdults,
      maxChildren,
      guests: guestsList
    }
  })

  showCheckInModal.value = true
}

const closeCheckInModal = () => {
  showCheckInModal.value = false
  selectedBookingForCheckIn.value = null
}

const addGuestRow = (groupIdx, isAdult) => {
  const group = checkInGuestGroups.value[groupIdx]
  if (isAdult && countAdults(group) >= group.maxAdults) return
  if (!isAdult && countChildren(group) >= group.maxChildren) return
  group.guests.push({
    fullName: '',
    pid: '',
    phoneNumber: '',
    isAdult,
    isRepresentative: false
  })
}

const removeGuestRow = (groupIdx, guestIdx) => {
  const group = checkInGuestGroups.value[groupIdx]
  if (group.guests.length <= 1) return
  group.guests.splice(guestIdx, 1)
}

const validateRoleSwitch = (group, guest) => {
  if (guest.isAdult && countAdults(group) > group.maxAdults) {
    guest.isAdult = false
    checkInModalError.value = `Phòng ${group.roomName} chỉ cho phép tối đa ${group.maxAdults} người lớn.`
  } else if (!guest.isAdult && countChildren(group) > group.maxChildren) {
    guest.isAdult = true
    checkInModalError.value = `Phòng ${group.roomName} chỉ cho phép tối đa ${group.maxChildren} trẻ em.`
  }
}

const submitCheckInWithGuests = async () => {
  checkInModalError.value = ''
  isProcessing.value = true
  try {
    const payload = {
      roomGuests: checkInGuestGroups.value.map(g => ({
        rentalDetailId: g.rentalDetailId,
        guests: g.guests
      }))
    }
    await api.post(`/api/staff/rentals/${selectedBookingForCheckIn.value.id}/check-in`, payload)
    showNotification('success', 'Check-in và khai báo khách lưu trú thành công!')
    closeCheckInModal()
    await fetchBookings()
    router.push('/employee/staff/stay')
  } catch (error) {
    checkInModalError.value = error.response?.data?.error || 'Lỗi khi thực hiện Check-in.'
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => fetchBookings())
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>