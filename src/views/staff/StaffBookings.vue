<template>
  <div class="card border-0 shadow-sm rounded-4 mb-4 bg-body">
    <div class="card-header bg-transparent border-0 pt-4 pb-0">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h5 class="fw-bold mb-1 text-body-emphasis"><i class="fas fa-list-check me-2 text-primary"></i>Xử lý Booking & Khách đến</h5>
          <p class="small text-body-secondary mb-0">Quản lý đơn chờ thu cọc, khách nhận phòng hôm nay và toàn bộ lịch đặt trước.</p>
        </div>

        <!-- Ô TÌM KIẾM NHANH -->
        <div class="input-group input-group-sm shadow-sm" style="max-width: 340px;">
          <span class="input-group-text bg-body-tertiary border-secondary-subtle text-body-secondary"><i class="fas fa-search"></i></span>
          <input type="text" v-model="searchQuery" class="form-control bg-body text-body-emphasis border-secondary-subtle"
                 placeholder="Tìm tên khách, CCCD, SĐT, mã đơn...">
          <button v-if="searchQuery" class="btn btn-outline-secondary border-secondary-subtle" type="button" @click="searchQuery = ''" title="Xóa tìm kiếm">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- 2 THẺ TAB CHUYỂN ĐỔI -->
      <ul class="nav nav-tabs border-secondary-subtle mt-3">
        <li class="nav-item">
          <button class="nav-link fw-bold cursor-pointer" :class="activeTab === 'today' ? 'active text-primary' : 'text-body-secondary'" @click="activeTab = 'today'">
            <i class="fas fa-calendar-day me-1"></i> Hôm nay & Chờ cọc
            <span class="badge bg-primary ms-1">{{ todayAndPendingCount }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold cursor-pointer" :class="activeTab === 'all' ? 'active text-success' : 'text-body-secondary'" @click="activeTab = 'all'">
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
      <!-- Bảng danh sách -->
      <div v-else class="table-responsive" style="overflow: visible;">
        <table class="table align-middle mb-0">
          <thead class="text-body-secondary border-bottom border-secondary-subtle" style="font-size: 0.75rem;">
            <tr>
              <th class="ps-3 py-3 fw-bold border-0 text-uppercase">Mã Booking / Chủ đơn</th>
              <th class="py-3 fw-bold border-0 text-uppercase">Phòng & Khách nhận</th>
              <th class="py-3 fw-bold border-0 text-uppercase text-nowrap">Giờ nhận phòng</th>
              <th class="py-3 fw-bold border-0 text-uppercase text-center text-nowrap">Trạng thái</th>
              <th class="py-3 fw-bold border-0 text-uppercase text-end text-nowrap">Tiền cọc</th>
              <th class="py-3 fw-bold border-0 text-end pe-4" style="width: 60px;"></th>
            </tr>
          </thead>
          <tbody class="border-top-0">
            <tr v-if="filteredBookings.length === 0">
              <td colspan="6" class="text-center text-body-secondary py-5 border-0">
                <span v-if="searchQuery">Không tìm thấy lượt đặt nào khớp với "<strong class="text-body-emphasis">{{ searchQuery }}</strong>".</span>
                <span v-else-if="activeTab === 'today'">Hôm nay không có booking chờ xử lý. Hãy chuyển sang thẻ <strong class="text-body-emphasis">Toàn bộ lượt đặt</strong> để xem các ngày khác.</span>
                <span v-else>Hiện không có lượt đặt phòng nào đang chờ.</span>
              </td>
            </tr>
            <tr v-else v-for="b in filteredBookings" :key="b.id" class="border-bottom border-secondary-subtle">
              <!-- Cột 1: Mã & Chủ đơn -->
              <td class="ps-3 py-3">
                <div class="fw-bold text-body-emphasis">{{ b.id }}</div>
                <div class="small text-body-secondary mt-1">
                  {{ b.customer?.user?.lastName }} {{ b.customer?.user?.firstName }}
                  <span v-if="b.customer?.user?.pid"> • {{ b.customer.user.pid }}</span>
                </div>
                <div v-if="b.customer?.user?.phoneNumber" class="small text-body-secondary" style="font-size: 0.78rem;">
                  {{ b.customer.user.phoneNumber }}
                </div>
              </td>

              <!-- Cột 2: Phòng & Đại diện -->
              <td class="py-3">
                <div v-for="(d, i) in b.rentalDetails" :key="i" class="mb-1">
                  <div class="d-flex align-items-center flex-wrap gap-1">
                    <span class="badge bg-body-tertiary text-body-emphasis border border-secondary-subtle fw-semibold">P.{{ d.room?.name || 'N/A' }}</span>
                    <span class="badge bg-body-tertiary text-body-secondary border border-secondary-subtle fw-normal">{{ d.room?.roomType?.name }}</span>
                    <span class="badge bg-body-tertiary text-body-secondary border border-secondary-subtle fw-normal">
                      <i class="fas fa-user me-1"></i>{{ d.adultCount }}
                      <i class="fas fa-child ms-2 me-1"></i>{{ d.childrenCount }}
                    </span>
                    <span class="badge bg-body-tertiary text-primary border border-secondary-subtle fw-normal">
                      {{ d.rentalType === 'DAILY' ? 'Qua đêm' : 'Theo giờ' }}
                    </span>
                  </div>
                  <div v-if="d.rentalGuests && d.rentalGuests.length > 0" class="small text-body-secondary mt-1" style="font-size: 0.8rem;">
                    Đại diện: <strong class="text-body-emphasis">{{ d.rentalGuests[0].fullName }}</strong>
                    <span v-if="d.rentalGuests[0].pid"> ({{ d.rentalGuests[0].pid }})</span>
                  </div>
                </div>
                <div v-if="b.note" class="small text-warning-emphasis bg-warning-subtle border border-warning-subtle rounded px-2 py-1 mt-1" style="font-size: 0.78rem;">
                  <i class="fas fa-sticky-note me-1"></i><strong>Ghi chú khách:</strong> {{ b.note }}
                </div>
              </td>

              <!-- Cột 3: Giờ nhận phòng -->
              <td class="small fw-semibold text-nowrap" :class="b.status === 'CONFIRMED' ? 'text-primary' : 'text-body-secondary'">
                {{ formatDateTime(b.rentalDetails[0]?.checkinDate) }}
              </td>

              <!-- Cột 4: Trạng thái -->
              <td class="text-center text-nowrap">
                <span v-if="b.status === 'PENDING'" class="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-2 fw-bold">
                  CHỜ CỌC
                </span>
                <span v-else class="badge rounded-pill bg-primary-subtle text-primary px-3 py-2 fw-bold">
                  ĐÃ XÁC NHẬN
                </span>
              </td>

              <!-- Cột 5: Tiền cọc -->
              <td class="text-end fw-bold text-success text-nowrap fs-6">
                {{ b.depositAmount ? formatPrice(b.depositAmount) : (b.status === 'PENDING' ? 'Chưa tính' : 'Đã thu') }}
              </td>

              <!-- Cột 6: Nút 3 gạch không viền giống trang Hạng phòng -->
              <td class="text-end pe-4">
                <div class="dropdown">
                  <button class="btn btn-link text-body-secondary p-0 shadow-none fs-5"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          title="Thao tác">
                    <i class="fas fa-list"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow-sm border-secondary-subtle rounded-3 py-2" style="min-width: 210px;">
                    <li>
                      <button class="dropdown-item py-2 fw-semibold text-info" @click="openDetailModal(b)">
                        <i class="fas fa-eye me-2" style="width: 18px;"></i>Xem chi tiết đơn
                      </button>
                    </li>

                    <!-- Nhánh PENDING (Chờ cọc) -->
                    <li v-if="b.status === 'PENDING'">
                      <button class="dropdown-item py-2 fw-semibold text-success" @click="payDeposit(b)">
                        <i class="fas fa-money-bill-wave me-2" style="width: 18px;"></i>Thu tiền cọc
                      </button>
                    </li>

                    <!-- Nhánh CONFIRMED (Đã xác nhận -> Check-in) -->
                    <li v-else>
                      <button class="dropdown-item py-2 fw-semibold text-primary" @click="openCheckInModal(b)">
                        <i class="fas fa-id-card-clip me-2" style="width: 18px;"></i>Check-in nhận phòng
                      </button>
                    </li>

                    <!-- Đổi phòng -->
                    <li v-for="d in (b.rentalDetails || []).filter(item => item.status === 'PENDING')" :key="'chg-' + d.id">
                      <button class="dropdown-item py-2 fw-semibold text-body-emphasis" @click="openChangeRoomModal(d)">
                        <i class="fas fa-exchange-alt text-primary me-2" style="width: 18px;"></i>
                        {{ (b.rentalDetails || []).filter(item => item.status === 'PENDING').length > 1 ? `Đổi phòng P.${d.room?.name}` : 'Đổi phòng' }}
                      </button>
                    </li>

                    <!-- Hủy đơn -->
                    <li v-if="b.status === 'PENDING'">
                      <button class="dropdown-item py-2 fw-semibold text-danger" @click="cancelBooking(b)">
                        <i class="fas fa-trash-alt me-2" style="width: 18px;"></i>Hủy đơn đặt
                      </button>
                    </li>
                    <li v-else>
                      <button class="dropdown-item py-2 fw-semibold text-danger" @click="openCancelRefundModal(b)">
                        <i class="fas fa-undo-alt me-2" style="width: 18px;"></i>Hủy đơn & Hoàn cọc
                      </button>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== MODAL XEM CHI TIẾT ĐƠN ĐẶT PHÒNG ==================== -->
    <div v-if="showDetailModal && selectedBookingDetail" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.55); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body text-body-emphasis">
          <div class="modal-header bg-dark text-white border-0">
            <div>
              <h5 class="modal-title fw-bold mb-0">
                <i class="fas fa-file-alt text-info me-2"></i>Chi tiết Đơn đặt phòng #{{ selectedBookingDetail.id }}
              </h5>
              <small class="text-white-50">
                Trạng thái: {{ selectedBookingDetail.status === 'PENDING' ? 'Chờ thu cọc' : 'Đã xác nhận (Chờ check-in)' }}
              </small>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="showDetailModal = false"></button>
          </div>

          <div class="modal-body p-4" style="max-height: 72vh; overflow-y: auto;">
            <!-- Thông tin tổng quan & Chủ đơn -->
            <div class="row g-3 mb-4">
              <div class="col-md-7">
                <div class="p-3 rounded-3 bg-body-tertiary border border-secondary-subtle h-100">
                  <div class="small text-uppercase fw-bold text-primary mb-2">
                    <i class="fas fa-user-circle me-1"></i>Thông tin chủ đơn
                  </div>
                  <div class="fw-bold fs-6 mb-1">
                    {{ selectedBookingDetail.customer?.user?.lastName }} {{ selectedBookingDetail.customer?.user?.firstName }}
                  </div>
                  <div class="small text-body-secondary mb-1">
                    <strong>CCCD / Hộ chiếu:</strong> <span class="text-body-emphasis">{{ selectedBookingDetail.customer?.user?.pid || 'N/A' }}</span>
                  </div>
                  <div class="small text-body-secondary mb-1">
                    <strong>Số điện thoại:</strong> <span class="text-body-emphasis">{{ selectedBookingDetail.customer?.user?.phoneNumber || 'N/A' }}</span>
                  </div>
                  <div class="small text-body-secondary mb-1">
                    <strong>Email:</strong> <span class="text-body-emphasis">{{ selectedBookingDetail.customer?.user?.email || 'Chưa cung cấp' }}</span>
                  </div>
                  <div class="small text-body-secondary">
                    <strong>Quốc tịch:</strong> <span class="text-body-emphasis">{{ selectedBookingDetail.customer?.user?.nationality || 'Việt Nam' }}</span>
                    <span class="mx-2">|</span>
                    <strong>Giới tính:</strong> <span class="text-body-emphasis">{{ selectedBookingDetail.customer?.user?.sex === 'FEMALE' ? 'Nữ' : 'Nam' }}</span>
                  </div>
                </div>
              </div>

              <div class="col-md-5">
                <div class="p-3 rounded-3 bg-body-tertiary border border-secondary-subtle h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div class="small text-uppercase fw-bold text-primary mb-2">
                      <i class="fas fa-receipt me-1"></i>Thông tin đơn
                    </div>
                    <div class="d-flex justify-content-between small mb-1">
                      <span class="text-body-secondary">Mã đơn:</span>
                      <strong class="text-body-emphasis">{{ selectedBookingDetail.id }}</strong>
                    </div>
                    <div class="d-flex justify-content-between small mb-1">
                      <span class="text-body-secondary">Số lượng phòng:</span>
                      <strong class="text-body-emphasis">{{ selectedBookingDetail.rentalDetails?.length || 0 }} phòng</strong>
                    </div>
                    <div class="d-flex justify-content-between small mb-1">
                      <span class="text-body-secondary">Trạng thái:</span>
                      <span v-if="selectedBookingDetail.status === 'PENDING'" class="badge bg-warning-subtle text-warning-emphasis">Chờ cọc</span>
                      <span v-else class="badge bg-primary-subtle text-primary">Đã xác nhận</span>
                    </div>
                  </div>
                  <div class="pt-2 mt-2 border-top border-secondary-subtle d-flex justify-content-between align-items-center">
                    <span class="small fw-bold text-body-secondary">Tiền cọc yêu cầu:</span>
                    <span class="fw-bold fs-5 text-danger">{{ formatPrice(selectedBookingDetail.depositAmount || 0) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Danh sách chi tiết từng phòng -->
            <h6 class="fw-bold text-body-emphasis mb-2">
              <i class="fas fa-door-open text-primary me-2"></i>Danh sách phòng & Khách lưu trú dự kiến
            </h6>
            <div v-if="selectedBookingDetail.note" class="alert alert-warning border-warning py-2 px-3 small mb-3">
              <i class="fas fa-sticky-note me-1"></i><strong>Ghi chú của khách khi đặt đơn:</strong> {{ selectedBookingDetail.note }}
            </div>
            <div v-for="(d, idx) in selectedBookingDetail.rentalDetails" :key="d.id || idx" class="card border border-secondary-subtle rounded-3 mb-3 bg-body">
              <div class="card-header bg-body-tertiary border-secondary-subtle py-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <span class="fw-bold text-primary">Phòng {{ d.room?.name || 'N/A' }}</span>
                  <span class="text-body-secondary small ms-2">{{ d.room?.roomType?.name }}</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <span class="badge bg-info-subtle text-info-emphasis">
                    {{ d.rentalType === 'DAILY' ? 'Thuê qua đêm / Ngày' : 'Thuê theo giờ' }}
                  </span>
                  <span class="fw-bold text-danger small">
                    {{ formatPrice(d.unitPrice || 0) }} / {{ d.rentalType === 'DAILY' ? 'đêm' : 'giờ' }}
                  </span>
                </div>
              </div>
              <div class="card-body p-3 small">
                <div class="row g-2 mb-2">
                  <div class="col-md-4">
                    <span class="text-body-secondary d-block">Giờ nhận phòng dự kiến</span>
                    <strong class="text-body-emphasis">{{ formatDateTime(d.checkinDate) }}</strong>
                  </div>
                  <div class="col-md-4">
                    <span class="text-body-secondary d-block">Thời lượng đăng ký</span>
                    <strong class="text-body-emphasis">{{ d.lengthOfStay || 1 }} giờ</strong>
                  </div>
                  <div class="col-md-4">
                    <span class="text-body-secondary d-block">Số khách đăng ký</span>
                    <strong class="text-body-emphasis">{{ d.adultCount }} Người lớn, {{ d.childrenCount }} Trẻ em</strong>
                  </div>
                </div>

                <div v-if="d.note" class="alert alert-secondary py-1 px-2 small mb-2">
                  <strong>Ghi chú:</strong> {{ d.note }}
                </div>

                <div v-if="d.rentalGuests && d.rentalGuests.length > 0" class="mt-2 pt-2 border-top border-secondary-subtle">
                  <div class="fw-semibold text-body-secondary mb-1">Khách đã khai báo:</div>
                  <ul class="mb-0 ps-3">
                    <li v-for="(g, gIdx) in d.rentalGuests" :key="gIdx">
                      <strong>{{ g.fullName }}</strong>
                      <span v-if="g.isRepresentative" class="badge bg-success-subtle text-success ms-1">Đại diện</span>
                      <span class="text-body-secondary ms-1">
                        ({{ g.isAdult !== false ? 'Người lớn' : 'Trẻ em' }}<span v-if="g.pid"> - CCCD: {{ g.pid }}</span><span v-if="g.phoneNumber"> - SĐT: {{ g.phoneNumber }}</span>)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer bg-body-tertiary border-0 rounded-bottom-4">
            <button type="button" class="btn btn-secondary fw-semibold px-4" @click="showDetailModal = false">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL CHECK-IN & KHAI BÁO KHÁCH LƯU TRÚ TỪNG PHÒNG ==================== -->
    <div v-if="showCheckInModal && selectedBookingForCheckIn" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.55); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body text-body-emphasis">
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

              <div v-if="selectedBookingForCheckIn.note" class="alert alert-warning border-warning py-2 px-3 small mb-3">
                <i class="fas fa-sticky-note me-1"></i><strong>Ghi chú từ khách hàng:</strong> {{ selectedBookingForCheckIn.note }}
              </div>

              <div v-for="(group, gIdx) in checkInGuestGroups" :key="group.rentalDetailId" class="card border border-secondary-subtle rounded-3 mb-3 shadow-sm bg-body">
                <div class="card-header bg-body-tertiary d-flex justify-content-between align-items-center flex-wrap gap-2 py-2 border-secondary-subtle">
                  <div>
                    <span class="fw-bold text-primary fs-6">Phòng {{ group.roomName }}</span>
                    <span class="badge bg-secondary ms-2">{{ group.roomTypeName }}</span>
                    <span class="small text-body-secondary ms-2">
                      (Tối đa: <strong class="text-body-emphasis">{{ group.maxAdults }} NL, {{ group.maxChildren }} TE</strong>)
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
                  <div v-for="(guest, idx) in group.guests" :key="idx" class="row g-2 align-items-center mb-2 pb-2 border-bottom border-secondary-subtle">
                    <div class="col-md-2">
                      <select v-model="guest.isAdult" class="form-select form-select-sm fw-semibold bg-body"
                              :class="guest.isAdult ? 'text-primary border-primary-subtle' : 'text-info border-info-subtle'"
                              @change="validateRoleSwitch(group, guest)">
                        <option :value="true">Người lớn</option>
                        <option :value="false" :disabled="group.maxChildren <= 0">Trẻ em</option>
                      </select>
                    </div>
                    <div class="col-md-4">
                      <input type="text" v-model="guest.fullName" class="form-control form-control-sm bg-body text-body-emphasis"
                             :placeholder="idx === 0 ? 'Họ tên người đại diện (*)' : 'Họ và tên khách (*)'" required>
                    </div>
                    <div class="col-md-3">
                      <input type="text" v-model="guest.pid" class="form-control form-control-sm bg-body text-body-emphasis"
                             :placeholder="guest.isAdult ? 'Số CCCD/Hộ chiếu (*)' : 'CCCD/Định danh (Nếu có)'"
                             :required="guest.isAdult" minlength="9" maxlength="20">
                    </div>
                    <div class="col-md-2">
                      <input type="text" v-model="guest.phoneNumber" class="form-control form-control-sm bg-body text-body-emphasis"
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

            <div class="modal-footer bg-body-tertiary border-0 rounded-bottom-4">
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

    <!-- MODAL ĐỔI PHÒNG TRƯỚC KHI NHẬN -->
    <div v-if="showChangeRoomModal && changingDetail" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.55); z-index: 1065;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body text-body-emphasis">
          <div class="modal-header bg-primary text-white border-0">
            <h5 class="modal-title fw-bold"><i class="fas fa-exchange-alt me-2"></i>Đổi phòng trước nhận (P.{{ changingDetail.room?.name }})</h5>
            <button type="button" class="btn-close btn-close-white" @click="showChangeRoomModal = false" :disabled="isProcessing"></button>
          </div>
          <form @submit.prevent="submitChangeRoom">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label class="form-label fw-semibold small text-body-secondary">Lý do đổi phòng</label>
                <select v-model="changeRoomForm.reasonType" class="form-select bg-body text-body-emphasis">
                  <option value="CUSTOMER_REQUEST">Khách chủ động yêu cầu (Tính theo giá phòng mới)</option>
                  <option value="HOTEL_FAULT">Sự cố từ khách sạn (Giữ nguyên giá cũ nếu nâng hạng)</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold small text-body-secondary">Chọn phòng trống thay thế <span class="text-danger">*</span></label>
                <select v-model="changeRoomForm.newRoomId" class="form-select bg-body text-body-emphasis" required>
                  <option value="">-- Chọn phòng trống --</option>
                  <option v-for="rm in availableRoomsForChange" :key="rm.id" :value="rm.id">
                    Phòng {{ rm.name }} - {{ rm.roomType?.name }} ({{ rm.roomType?.adultMax }} NL, {{ rm.roomType?.childrenMax }} TE)
                  </option>
                </select>
                <small v-if="availableRoomsForChange.length === 0" class="text-danger">Không có phòng trống khả dụng trong khung giờ này.</small>
              </div>
              <div class="mb-0">
                <label class="form-label fw-semibold small text-body-secondary">Ghi chú</label>
                <input v-model="changeRoomForm.note" type="text" class="form-control bg-body text-body-emphasis" placeholder="VD: Phòng cũ bảo trì điều hòa...">
              </div>
            </div>
            <div class="modal-footer bg-body-tertiary border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary fw-semibold" @click="showChangeRoomModal = false" :disabled="isProcessing">Hủy</button>
              <button type="submit" class="btn btn-primary fw-bold px-4" :disabled="isProcessing || !changeRoomForm.newRoomId">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Xác nhận đổi phòng
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL HỦY ĐƠN & HOÀN 100% CỌC (LỖI KHÁCH SẠN) -->
    <div v-if="showCancelRefundModal && refundingBooking" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.55); z-index: 1065;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body text-body-emphasis">
          <div class="modal-header bg-danger text-white border-0">
            <h5 class="modal-title fw-bold"><i class="fas fa-undo-alt me-2"></i>Hủy đơn & Hoàn cọc (#{{ refundingBooking.id }})</h5>
            <button type="button" class="btn-close btn-close-white" @click="showCancelRefundModal = false" :disabled="isProcessing"></button>
          </div>
          <form @submit.prevent="submitCancelRefund">
            <div class="modal-body p-4">
              <div class="alert alert-warning small py-2 mb-3">
                Áp dụng khi khách sạn gặp sự cố hết phòng thay thế. Hệ thống sẽ hủy đơn và lập phiếu hoàn <strong>100% tiền cọc</strong> ({{ formatPrice(refundingBooking.depositAmount || 0) }}).
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold small text-body-secondary">Phương thức hoàn tiền</label>
                <select v-model="cancelRefundForm.paymentMethod" class="form-select bg-body text-body-emphasis">
                  <option value="CASH">Tiền mặt tại quầy</option>
                  <option value="BANK">Chuyển khoản Ngân hàng</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold small text-body-secondary">Mã giao dịch hoàn tiền (Nếu chuyển khoản)</label>
                <input v-model="cancelRefundForm.transactionCode" type="text" class="form-control bg-body text-body-emphasis" placeholder="VD: FT2611...">
              </div>
              <div class="mb-0">
                <label class="form-label fw-semibold small text-body-secondary">Lý do hủy & hoàn cọc <span class="text-danger">*</span></label>
                <textarea v-model="cancelRefundForm.note" class="form-control bg-body text-body-emphasis" rows="2" required></textarea>
              </div>
            </div>
            <div class="modal-footer bg-body-tertiary border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary fw-semibold" @click="showCancelRefundModal = false" :disabled="isProcessing">Đóng</button>
              <button type="submit" class="btn btn-danger fw-bold px-4" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Xác nhận Hủy & Hoàn cọc
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL CONFIRM (Dùng cho Thu cọc & Hủy đơn) -->
    <div v-if="showConfirmModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1070;">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body text-body-emphasis">
          <div class="modal-header border-0 pb-0 justify-content-center mt-3">
            <div :class="'text-' + confirmConfig.type" style="font-size: 3rem;">
              <i :class="confirmConfig.icon"></i>
            </div>
          </div>
          <div class="modal-body text-center pt-2 pb-4 px-4">
            <h5 class="fw-bold mb-3 text-body-emphasis">{{ confirmConfig.title }}</h5>
            <p class="text-body-secondary mb-0" style="font-size: 0.95rem;" v-html="confirmConfig.message"></p>
          </div>
          <div class="modal-footer bg-body-tertiary border-0 d-flex justify-content-center rounded-bottom-4 py-3 gap-2">
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
import { formatPrice, formatDateTime } from '../../utils/formatters'

const router = useRouter()
const pendingBookings = ref([])
const todayArrivals = ref([])
const allConfirmedBookings = ref([])
const isLoading = ref(true)
const isProcessing = ref(false)
const notification = ref({ type: '', message: '' })

const activeTab = ref('today')
const searchQuery = ref('')

const showDetailModal = ref(false)
const selectedBookingDetail = ref(null)

const showConfirmModal = ref(false)
const confirmConfig = ref({ title: '', message: '', type: 'primary', icon: '', action: null })

const showCheckInModal = ref(false)
const selectedBookingForCheckIn = ref(null)
const checkInGuestGroups = ref([])
const checkInModalError = ref('')

const showChangeRoomModal = ref(false)
const changingDetail = ref(null)
const availableRoomsForChange = ref([])
const changeRoomForm = ref({ newRoomId: '', reasonType: 'CUSTOMER_REQUEST', note: '' })

const showCancelRefundModal = ref(false)
const refundingBooking = ref(null)
const cancelRefundForm = ref({ paymentMethod: 'CASH', transactionCode: '', note: '' })

const todayAndPendingCount = computed(() => pendingBookings.value.length + todayArrivals.value.length)
const allBookingsCount = computed(() => pendingBookings.value.length + allConfirmedBookings.value.length)

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

const openDetailModal = (booking) => {
  selectedBookingDetail.value = booking
  showDetailModal.value = true
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

const countAdults = (group) => group.guests.filter(g => g.isAdult).length
const countChildren = (group) => group.guests.filter(g => !g.isAdult).length

const openCheckInModal = (booking) => {
  selectedBookingForCheckIn.value = booking
  checkInModalError.value = ''

  const bookerUser = booking.customer?.user
  const bookerFullName = bookerUser ? `${bookerUser.lastName || ''} ${bookerUser.firstName || ''}`.trim() : ''
  const bookerPid = bookerUser?.pid || ''
  const bookerPhone = bookerUser?.phoneNumber || ''

  const pendingDetails = (booking.rentalDetails || []).filter(d => d.status === 'PENDING')
  checkInGuestGroups.value = pendingDetails.map((detail, dIdx) => {
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
  group.guests.push({ fullName: '', pid: '', phoneNumber: '', isAdult, isRepresentative: false })
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

const openChangeRoomModal = async (detail) => {
  changingDetail.value = detail
  changeRoomForm.value = { newRoomId: '', reasonType: 'CUSTOMER_REQUEST', note: '' }
  availableRoomsForChange.value = []
  showChangeRoomModal.value = true
  try {
    const res = await api.get('/api/staff/walk-in/rooms', {
      params: {
        walkInCheckin: detail.checkinDate,
        walkInLengthOfStay: detail.lengthOfStay || 1
      }
    })
    availableRoomsForChange.value = (res.data.walkInRooms || []).filter(rm => rm.id !== detail.room?.id)
  } catch (e) {
    showNotification('danger', 'Không thể tải danh sách phòng trống.')
  }
}

const submitChangeRoom = async () => {
  isProcessing.value = true
  try {
    const res = await api.post(`/api/staff/rental-details/${changingDetail.value.id}/change-room`, changeRoomForm.value)
    showNotification('success', res.data.message || 'Đổi phòng thành công!')
    showChangeRoomModal.value = false
    await fetchBookings()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi khi đổi phòng.')
  } finally {
    isProcessing.value = false
  }
}

const openCancelRefundModal = (booking) => {
  refundingBooking.value = booking
  cancelRefundForm.value = {
    paymentMethod: 'CASH',
    transactionCode: '',
    note: 'Hủy đơn và hoàn 100% tiền cọc do sự cố phòng từ khách sạn'
  }
  showCancelRefundModal.value = true
}

const submitCancelRefund = async () => {
  isProcessing.value = true
  try {
    const res = await api.post(`/api/staff/bookings/${refundingBooking.value.id}/cancel-refund`, cancelRefundForm.value)
    showNotification('success', res.data.message || 'Đã hủy đơn và hoàn tiền cọc.')
    showCancelRefundModal.value = false
    await fetchBookings()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi khi hủy và hoàn cọc.')
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

.adaptive-thead th,
.adaptive-thead td {
  background-color: var(--bs-tertiary-bg) !important;
  color: var(--bs-secondary-color) !important;
  border-color: var(--bs-border-color) !important;
}

.dropdown-item:active {
  background-color: var(--bs-secondary-bg);
  color: inherit;
}
</style>
```[cite: 16]