<template>
  <div class="card border-0 shadow-sm rounded-4 mb-4 bg-body">
    <!-- HEADER + NÚT XEM QUY ĐỊNH TÍNH TIỀN -->
    <div class="card-header bg-transparent border-0 pt-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
      <h5 class="fw-bold mb-0 text-body-emphasis">
        <i class="fas fa-bed me-2 text-primary"></i>Quản lý Lưu trú & Dọn dẹp
      </h5>
    </div>

    <div class="card-body">
      <!-- Thông báo Toast -->
      <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
        <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
        {{ notification.message }}
        <button type="button" class="btn-close" @click="notification.message = ''"></button>
      </div>

      <!-- Tabs + Thanh Tìm kiếm & Số lượng -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3 border-bottom border-secondary-subtle pb-2">
        <ul class="nav nav-pills">
          <li class="nav-item">
            <button class="nav-link fw-bold d-flex align-items-center gap-2"
                    :class="activeTab === 'stay' ? 'active bg-primary text-white shadow-sm' : 'text-body-secondary'"
                    @click="activeTab = 'stay'">
              <i class="fas fa-user-check"></i> Khách đang ở
              <span class="badge rounded-pill" :class="activeTab === 'stay' ? 'bg-white text-primary' : 'bg-primary text-white'">
                {{ allActiveRentals.length }}
              </span>
            </button>
          </li>
          <li class="nav-item ms-2">
            <button class="nav-link fw-bold d-flex align-items-center gap-2"
                    :class="activeTab === 'cleaning' ? 'active bg-danger text-white shadow-sm' : 'text-body-secondary'"
                    @click="activeTab = 'cleaning'">
              <i class="fas fa-broom"></i> Phòng cần dọn
              <span class="badge rounded-pill" :class="activeTab === 'cleaning' ? 'bg-white text-danger' : 'bg-danger text-white'">
                {{ checkedOutRentals.length }}
              </span>
            </button>
          </li>
        </ul>

        <!-- Bộ lọc & Tìm kiếm nhanh -->
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <span class="badge bg-body-tertiary text-body-emphasis border border-secondary-subtle px-3 py-2 fw-semibold">
            Hiển thị: <strong class="text-primary">{{ activeTab === 'stay' ? filteredActiveRentals.length : filteredCleaningRentals.length }}</strong>
            / {{ activeTab === 'stay' ? allActiveRentals.length : checkedOutRentals.length }} đơn
          </span>

          <select v-if="activeTab === 'stay'" v-model="stayFilterType" class="form-select form-select-sm shadow-sm bg-body text-body-emphasis border-secondary-subtle" style="width: 145px;">
            <option value="ALL">Mọi hình thức</option>
            <option value="HOURLY">Thuê theo giờ</option>
            <option value="DAILY">Thuê qua đêm</option>
            <option value="OVERDUE">Đang quá hạn ({{ overdueRentals.length }})</option>
          </select>

          <div class="input-group input-group-sm shadow-sm" style="width: 260px;">
            <span class="input-group-text bg-body-tertiary border-secondary-subtle border-end-0 text-body-secondary"><i class="fas fa-search"></i></span>
            <input type="text"
                   v-model="searchQuery"
                   class="form-control bg-body text-body-emphasis border-secondary-subtle border-start-0"
                   placeholder="Tìm tên, mã đơn, phòng, SĐT, CCCD...">
            <button v-if="searchQuery" class="btn btn-outline-secondary border-secondary-subtle border-start-0" type="button" @click="searchQuery = ''">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>

      <div v-else class="tab-content border border-secondary-subtle rounded bg-body">
        <!-- TAB 1: KHÁCH ĐANG Ở -->
        <div v-if="activeTab === 'stay'" class="table-responsive" style="overflow: visible;">
          <table class="table align-middle mb-0">
            <thead class="text-body-secondary border-bottom border-secondary-subtle" style="font-size: 0.75rem;">
              <tr>
                <th class="ps-3 py-3 fw-bold border-0 text-uppercase">Chủ đơn / Mã</th>
                <th class="py-3 fw-bold border-0 text-uppercase">Phòng & Trạng thái</th>
                <th class="py-3 fw-bold border-0 text-uppercase">Thời gian lưu trú</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-center">Dịch vụ / Sự cố</th>
                <th class="py-3 fw-bold border-0 text-uppercase text-end text-nowrap">Tạm tính</th>
                <th class="py-3 fw-bold border-0 text-end pe-4" style="width: 60px;"></th>
              </tr>
            </thead>
            <tbody class="border-top-0">
              <tr v-if="filteredActiveRentals.length === 0">
                <td colspan="6" class="text-center text-body-secondary py-5 border-0">
                  <span v-if="searchQuery || stayFilterType !== 'ALL'">Không tìm thấy đơn lưu trú nào khớp với bộ lọc.</span>
                  <span v-else>Hiện không có khách lưu trú.</span>
                </td>
              </tr>
              <tr v-for="r in filteredActiveRentals" :key="r.id" class="border-bottom border-secondary-subtle" :class="{'table-danger': isOverdue(r)}">
                <!-- Cột 1: Chủ đơn -->
                <td class="ps-3 py-3">
                  <div class="fw-bold text-body-emphasis">{{ r.customer?.user?.lastName }} {{ r.customer?.user?.firstName }}</div>
                  <div class="small text-body-secondary mt-1">
                    {{ r.id }}
                    <span v-if="r.customer?.user?.phoneNumber"> • {{ r.customer.user.phoneNumber }}</span>
                  </div>
                </td>

                <!-- Cột 2: Phòng & Trạng thái -->
                <td class="py-3">
                  <div class="d-flex align-items-center flex-wrap gap-1 mb-1">
                    <template v-for="detail in r.rentalDetails" :key="detail.id">
                      <span v-if="detail.status === 'MOVED'"
                            class="badge bg-body-tertiary text-body-secondary border border-secondary-subtle text-decoration-line-through fw-normal"
                            :title="detail.note">
                        P.{{ detail.room?.name }}
                      </span>
                      <template v-else-if="detail.status !== 'CANCELLED'">
                        <span class="badge border fw-semibold"
                              :class="detail.status === 'OVERDUE' ? 'bg-danger text-white border-danger' : 'bg-body-tertiary text-body-emphasis border-secondary-subtle'">
                          P.{{ detail.room?.name }}
                        </span>
                        <span class="badge bg-body-tertiary text-body-secondary border border-secondary-subtle fw-normal">
                          <i class="fas fa-users me-1"></i>{{ detail.rentalGuests?.length || (detail.adultCount + detail.childrenCount) }} khách
                        </span>
                      </template>
                    </template>
                  </div>
                  <div>
                    <span class="badge rounded-pill fw-semibold d-inline-flex align-items-center gap-1"
                          :class="getStayStatusBadge(r).badgeClass"
                          style="font-size: 0.72rem;">
                      <i :class="getStayStatusBadge(r).icon"></i>
                      {{ getStayStatusBadge(r).text }}
                    </span>
                  </div>
                </td>

                <!-- Cột 3: Thời gian + Popover live -->
                <td class="py-3 position-relative">
                  <div class="small fw-semibold text-success">
                    Vào: {{ formatTime(getActiveDetail(r)?.checkinDate) }}
                    <span class="text-body-secondary fw-normal ms-1">(ĐK: {{ getPlannedDurationLabel(r) }})</span>
                  </div>
                  <div class="small text-body-secondary mt-1 d-flex align-items-center gap-1">
                    <span>Đã ở: <strong class="text-body-emphasis">{{ getLiveStayMetrics(r).roundedBillableLabel }}</strong></span>
                    <div class="position-relative d-inline-block"
                         @mouseenter="handleHoverStayInfo($event, r.id)"
                         @mouseleave="hoveredStayInfoId = null">
                      <button type="button"
                              class="btn btn-link p-0 text-primary border-0 d-inline-flex align-items-center"
                              style="text-decoration: none;"
                              @click.stop="handleTogglePinnedStayInfo($event, r.id)"
                              title="Xem chi tiết thời gian lưu trú & làm tròn">
                        <i class="fas fa-info-circle"></i>
                      </button>

                      <div v-if="hoveredStayInfoId === r.id || pinnedStayInfoId === r.id"
                           class="stay-time-popover shadow-lg border border-secondary-subtle rounded-3 bg-body text-body-emphasis text-start p-3"
                           :class="popoverDirectionClass"
                           @click.stop>
                        <div class="d-flex justify-content-between align-items-center border-bottom border-secondary-subtle pb-2 mb-2">
                          <span class="fw-bold text-primary small">
                            <i class="fas fa-stopwatch me-1"></i>Chi tiết thời gian #{{ r.id }}
                          </span>
                          <button v-if="pinnedStayInfoId === r.id" type="button" class="btn-close" style="font-size: 0.65rem;" @click="pinnedStayInfoId = null"></button>
                        </div>
                        <div class="small mb-1 d-flex justify-content-between">
                          <span class="text-body-secondary">Hình thức thuê:</span>
                          <span class="fw-bold">{{ getLiveStayMetrics(r).typeLabel }}</span>
                        </div>
                        <div class="small mb-1 d-flex justify-content-between">
                          <span class="text-body-secondary">Đăng ký trên đơn:</span>
                          <span class="fw-bold">{{ getPlannedDurationLabel(r) }}</span>
                        </div>
                        <div class="small mb-1 d-flex justify-content-between">
                          <span class="text-body-secondary">Thực tế nhận phòng:</span>
                          <span class="fw-semibold text-success">{{ getLiveStayMetrics(r).checkinStr }}</span>
                        </div>
                        <div class="small mb-2 d-flex justify-content-between">
                          <span class="text-body-secondary">Dự kiến trả phòng:</span>
                          <span class="fw-semibold text-body-secondary">{{ getLiveStayMetrics(r).expectedCheckoutStr }}</span>
                        </div>
                        <div class="bg-dark text-white rounded-3 p-2 text-center my-2 shadow-sm">
                          <div class="text-white-50" style="font-size: 0.7rem;">THỜI LƯỢNG ĐÃ LƯU TRÚ THỰC TẾ</div>
                          <div class="fw-bold text-warning font-monospace" style="font-size: 1rem;">
                            <i class="far fa-clock me-1"></i>{{ getLiveStayMetrics(r).digitalClock }}
                          </div>
                        </div>
                        <div class="small d-flex justify-content-between align-items-center pt-1 border-top border-secondary-subtle">
                          <span class="text-body-secondary">Làm tròn tính đơn:</span>
                          <span class="badge bg-primary">{{ getLiveStayMetrics(r).roundedBillableLabel }}</span>
                        </div>
                        <div class="text-body-secondary fst-italic mt-1" style="font-size: 0.73rem;">
                          {{ getLiveStayMetrics(r).roundingRuleNote }}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Cột 4: Tóm tắt Dịch vụ & Sự cố -->
                <td class="text-center py-3">
                  <div class="d-flex flex-column align-items-center gap-1">
                    <span class="badge bg-body-tertiary text-body-secondary border border-secondary-subtle fw-normal">
                      <i class="fas fa-concierge-bell text-primary me-1"></i>{{ getRentalServiceCount(r) }} dịch vụ
                    </span>
                    <span v-if="getUnresolvedIncidents(r).length > 0" class="badge bg-danger text-white fw-semibold">
                      <i class="fas fa-ban me-1"></i>{{ getUnresolvedIncidents(r).length }} sự cố chưa xong
                    </span>
                    <span v-else-if="getRentalIncidentCount(r) > 0" class="badge bg-info-subtle text-info-emphasis fw-normal">
                      <i class="fas fa-history me-1"></i>{{ getRentalIncidentCount(r) }} sự cố
                    </span>
                  </div>
                </td>

                <!-- Cột 5: Tạm tính / Trạng thái tất toán -->
                <td class="text-end py-3 text-nowrap">
                  <template v-if="!isSettled(r.id)">
                    <div v-if="getNetPayable(r.id) > 0">
                      <div class="fw-bold text-danger fs-6">{{ formatPrice(getNetPayable(r.id)) }}</div>
                      <div class="small text-body-secondary" style="font-size: 0.75rem;">Cần thu thêm</div>
                    </div>
                    <div v-else-if="getNetPayable(r.id) === 0">
                      <div class="fw-bold text-primary fs-6">0 đ</div>
                      <div class="small text-body-secondary" style="font-size: 0.75rem;">Hòa tiền</div>
                    </div>
                    <div v-else>
                      <div class="fw-bold text-success fs-6">{{ formatPrice(Math.abs(getNetPayable(r.id))) }}</div>
                      <div class="small text-body-secondary" style="font-size: 0.75rem;">Cần hoàn khách</div>
                    </div>
                  </template>
                  <template v-else>
                    <span class="badge rounded-pill bg-success-subtle text-success px-3 py-2 fw-bold">
                      <i class="fas fa-check-circle me-1"></i>ĐÃ TẤT TOÁN
                    </span>
                  </template>
                </td>

                <!-- Cột 6: Nút 3 gạch không viền -->
                <td class="text-end pe-4 py-3">
                  <div class="dropdown">
                    <button class="btn btn-link text-body-secondary p-0 shadow-none fs-5"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            title="Thao tác">
                      <i class="fas fa-list"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm border-secondary-subtle rounded-3 py-2" style="min-width: 220px;">
                      <!-- Tất toán / Check-out -->
                      <li v-if="!isSettled(r.id)">
                        <button class="dropdown-item py-2 fw-semibold text-success" @click="openInvoiceModal(r)">
                          <i class="fas fa-file-invoice-dollar me-2" style="width: 18px;"></i>Tất toán & Check-out
                        </button>
                      </li>
                      <li v-else>
                        <button class="dropdown-item py-2 fw-semibold text-danger"
                                :disabled="getUnresolvedIncidents(r).length > 0"
                                @click="checkOut(r.id)">
                          <i class="fas fa-door-open me-2" style="width: 18px;"></i>Check-out trả phòng
                        </button>
                      </li>

                      <li><hr class="dropdown-divider my-1"></li>

                      <!-- Dịch vụ -->
                      <li>
                        <button class="dropdown-item py-2 fw-semibold text-primary" @click="openAddServiceModal(r)">
                          <i class="fas fa-plus-circle me-2" style="width: 18px;"></i>Thêm dịch vụ
                        </button>
                      </li>
                      <li v-if="getRentalServiceCount(r) > 0">
                        <button class="dropdown-item py-2 fw-semibold text-body-emphasis" @click="viewServiceHistory(r)">
                          <i class="fas fa-list-ul text-primary me-2" style="width: 18px;"></i>Lịch sử dịch vụ ({{ getRentalServiceCount(r) }})
                        </button>
                      </li>

                      <!-- Sự cố -->
                      <li>
                        <button class="dropdown-item py-2 fw-semibold text-warning" @click="openIncidentModal(getActiveDetail(r))">
                          <i class="fas fa-exclamation-triangle me-2" style="width: 18px;"></i>Báo sự cố
                        </button>
                      </li>
                      <li v-if="getRentalIncidentCount(r) > 0">
                        <button class="dropdown-item py-2 fw-semibold text-info" @click="viewIncidentHistory(r)">
                          <i class="fas fa-history me-2" style="width: 18px;"></i>Lịch sử sự cố ({{ getRentalIncidentCount(r) }})
                        </button>
                      </li>

                      <li><hr class="dropdown-divider my-1"></li>

                      <!-- Khách & Đổi phòng cho từng phòng đang ở -->
                      <template v-for="detail in (r.rentalDetails || []).filter(d => d.status === 'CHECKED_IN' || d.status === 'OVERDUE')" :key="'act-' + detail.id">
                        <li>
                          <button class="dropdown-item py-2 fw-semibold text-body-emphasis" @click="openGuestListModal(detail)">
                            <i class="fas fa-users text-secondary me-2" style="width: 18px;"></i>Khách lưu trú (P.{{ detail.room?.name }})
                          </button>
                        </li>
                        <li>
                          <button class="dropdown-item py-2 fw-semibold text-body-emphasis" @click="openChangeRoomModal(detail)">
                            <i class="fas fa-exchange-alt text-primary me-2" style="width: 18px;"></i>Đổi phòng (P.{{ detail.room?.name }})
                          </button>
                        </li>
                      </template>
                    </ul>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TAB 2: DỌN PHÒNG -->
        <div v-if="activeTab === 'cleaning'" class="table-responsive p-2">
          <table class="table table-hover align-middle mb-0">
            <thead class="adaptive-thead">
              <tr><th class="px-4 py-3">Phòng</th><th>Khách vừa trả</th><th>Trạng thái</th><th class="text-end px-3">Thao tác</th></tr>
            </thead>
            <tbody>
              <tr v-if="filteredCleaningRentals.length === 0"><td colspan="4" class="text-center text-body-secondary py-4">Không có phòng nào đang chờ dọn.</td></tr>
              <tr v-for="r in filteredCleaningRentals" :key="r.id">
                <td class="px-4 fw-bold fs-5 text-primary">{{ r.rentalDetails[0]?.room?.name }}</td>
                <td class="text-body-secondary">{{ r.customer?.user?.lastName }} {{ r.customer?.user?.firstName }}</td>
                <td><span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle"><i class="fas fa-spray-can me-1"></i> Đang dọn dẹp</span></td>
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

    <!-- ==================== MODAL HÓA ĐƠN TẤT TOÁN & CHECK-OUT CHI TIẾT ==================== -->
    <div v-if="showInvoiceModal && selectedRentalForInvoice" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.6); z-index: 1085;">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body text-body-emphasis">
          <div class="modal-header bg-dark text-white border-0 py-3">
            <div>
              <h5 class="modal-title fw-bold mb-0">
                <i class="fas fa-file-invoice-dollar text-warning me-2"></i>HÓA ĐƠN TẤT TOÁN & TRẢ PHÒNG
              </h5>
              <small class="text-white-50">Mã đơn: #{{ selectedRentalForInvoice.id }} — Thời điểm lập: {{ formatDateTime(new Date()) }}</small>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="closeInvoiceModal" :disabled="isProcessing"></button>
          </div>

          <div class="modal-body p-4" style="max-height: 72vh; overflow-y: auto;">
            <!-- Khối 1: Thông tin Khách hàng & Thời gian lưu trú -->
            <div class="row g-3 mb-3 p-3 bg-body-tertiary rounded-3 border border-secondary-subtle">
              <div class="col-md-6">
                <div class="small text-body-secondary text-uppercase fw-bold mb-1">Thông tin khách hàng</div>
                <div class="fw-bold text-body-emphasis fs-6">
                  {{ selectedRentalForInvoice.customer?.user?.lastName }} {{ selectedRentalForInvoice.customer?.user?.firstName }}
                </div>
                <div class="small text-body-secondary">
                  <i class="fas fa-id-card me-1"></i>CCCD: {{ selectedRentalForInvoice.customer?.user?.pid || 'N/A' }}
                  <span class="mx-1">|</span>
                  <i class="fas fa-phone me-1"></i>{{ selectedRentalForInvoice.customer?.user?.phoneNumber || 'N/A' }}
                </div>
                <div class="small mt-1">
                  <i class="fas fa-envelope me-1 text-primary"></i>
                  <span v-if="selectedRentalForInvoice.customer?.user?.email" class="text-success fw-semibold">
                    Hóa đơn điện tử sẽ gửi tới: {{ selectedRentalForInvoice.customer.user.email }}
                  </span>
                  <span v-else class="text-body-secondary fst-italic">Khách chưa đăng ký Email nhận hóa đơn</span>
                </div>
              </div>
              <div class="col-md-6 border-start-md">
                <div class="small text-body-secondary text-uppercase fw-bold mb-1">Chi tiết thời gian lưu trú</div>
                <div class="small">
                  <strong>Nhận phòng thực tế:</strong> {{ formatDateTime(getActiveDetail(selectedRentalForInvoice)?.checkinDate) }}
                </div>
                <div class="small">
                  <strong>Trả phòng thực tế:</strong> {{ formatDateTime(new Date()) }}
                </div>
                <div class="small mt-1">
                  <strong>Thời lượng thực tế:</strong>
                  <span class="badge bg-dark text-warning font-monospace ms-1">{{ getLiveStayMetrics(selectedRentalForInvoice).digitalClock }}</span>
                  <span class="ms-2">Tính đơn: <strong class="text-primary">{{ getLiveStayMetrics(selectedRentalForInvoice).roundedBillableLabel }}</strong></span>
                </div>
              </div>
            </div>

            <!-- Khối 2: Chi tiết Tiền phòng & Phụ thu -->
            <h6 class="fw-bold text-body-emphasis mb-2"><i class="fas fa-bed text-primary me-2"></i>1. Chi tiết tiền phòng & Phụ thu</h6>
            <div class="table-responsive border border-secondary-subtle rounded-3 mb-3">
              <table class="table table-sm align-middle mb-0">
                <thead class="adaptive-thead small">
                  <tr>
                    <th class="px-3 py-2">Hạng mục</th>
                    <th>Chi tiết</th>
                    <th class="text-end px-3">Thành tiền</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr v-for="detail in selectedRentalForInvoice.rentalDetails" :key="detail.id">
                    <td class="px-3 fw-bold" :class="detail.status === 'MOVED' ? 'text-body-secondary' : 'text-primary'">
                      Phòng {{ detail.room?.name }} ({{ detail.room?.roomType?.name }})
                      <span v-if="detail.status === 'MOVED'" class="badge bg-secondary ms-1">Chặng cũ - Đã chuyển</span>
                      <div v-if="detail.note" class="small fw-normal text-body-secondary fst-italic">{{ detail.note }}</div>
                    </td>
                    <td>
                      Đơn giá áp dụng: <strong>{{ formatPrice(detail.unitPrice) }}</strong> / {{ detail.rentalType === 'DAILY' ? 'đêm' : 'giờ' }}
                      <span class="text-body-secondary ms-1">({{ detail.adultCount }} NL, {{ detail.childrenCount }} TE)</span>
                    </td>
                    <td class="text-end px-3 text-body-secondary">Tính trong tổng gốc</td>
                  </tr>
                  <tr>
                    <td class="px-3 fw-semibold">Tiền phòng gốc</td>
                    <td class="text-body-secondary">Tính theo thời gian lưu trú đã làm tròn ({{ getLiveStayMetrics(selectedRentalForInvoice).roundedBillableLabel }})</td>
                    <td class="text-end px-3 fw-bold text-body-emphasis">{{ formatPrice(invoiceBaseRoomAmount) }}</td>
                  </tr>
                  <tr v-if="(currentInvoiceSummary?.earlyCheckinSurcharge || 0) > 0" class="table-warning">
                    <td class="px-3 fw-semibold text-danger"><i class="fas fa-clock me-1"></i>Phụ thu nhận phòng sớm</td>
                    <td class="text-body-secondary">Nhận phòng trước 14:00 (Chế độ thuê ngày)</td>
                    <td class="text-end px-3 fw-bold text-danger">+{{ formatPrice(currentInvoiceSummary.earlyCheckinSurcharge) }}</td>
                  </tr>
                  <tr v-if="(currentInvoiceSummary?.lateCheckoutSurcharge || 0) > 0" class="table-warning">
                    <td class="px-3 fw-semibold text-danger"><i class="fas fa-clock me-1"></i>Phụ thu trả phòng muộn</td>
                    <td class="text-body-secondary">Trả phòng sau 12:00 trưa (Chế độ thuê ngày)</td>
                    <td class="text-end px-3 fw-bold text-danger">+{{ formatPrice(currentInvoiceSummary.lateCheckoutSurcharge) }}</td>
                  </tr>
                </tbody>
                <tfoot class="adaptive-thead small">
                  <tr>
                    <td colspan="2" class="text-end fw-bold">Cộng tiền phòng (1):</td>
                    <td class="text-end px-3 fw-bold text-primary fs-6">{{ formatPrice(currentInvoiceSummary?.roomAmount || 0) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Khối 3: Danh sách Dịch vụ đã sử dụng -->
            <h6 class="fw-bold text-body-emphasis mb-2"><i class="fas fa-concierge-bell text-success me-2"></i>2. Dịch vụ sử dụng ({{ invoiceServiceList.length }})</h6>
            <div class="table-responsive border border-secondary-subtle rounded-3 mb-3">
              <table class="table table-sm align-middle mb-0">
                <thead class="adaptive-thead small">
                  <tr>
                    <th class="px-3 py-2">Thời gian</th>
                    <th>Tên dịch vụ</th>
                    <th class="text-center">SL</th>
                    <th class="text-end">Đơn giá</th>
                    <th class="text-end px-3">Thành tiền</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr v-if="invoiceServiceList.length === 0">
                    <td colspan="5" class="text-center text-body-secondary py-2 fst-italic">Không sử dụng dịch vụ phụ trợ nào.</td>
                  </tr>
                  <tr v-else v-for="svc in invoiceServiceList" :key="svc.id">
                    <td class="px-3 text-body-secondary">{{ formatTime(svc.time) }}</td>
                    <td class="fw-semibold">{{ svc.service?.name }}</td>
                    <td class="text-center fw-bold">{{ svc.count }}</td>
                    <td class="text-end">{{ formatPrice(svc.unitPrice) }}</td>
                    <td class="text-end px-3 fw-bold text-body-emphasis">{{ formatPrice(svc.count * svc.unitPrice) }}</td>
                  </tr>
                </tbody>
                <tfoot class="adaptive-thead small">
                  <tr>
                    <td colspan="4" class="text-end fw-bold">Cộng tiền dịch vụ (2):</td>
                    <td class="text-end px-3 fw-bold text-success fs-6">{{ formatPrice(currentInvoiceSummary?.serviceAmount || 0) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Khối 4: Sự cố / Đền bù / Bồi thường -->
            <div v-if="invoiceIncidentList.length > 0" class="mb-3">
              <h6 class="fw-bold text-body-emphasis mb-2"><i class="fas fa-exclamation-triangle text-warning me-2"></i>3. Ghi nhận sự cố tại phòng ({{ invoiceIncidentList.length }})</h6>
              <div class="table-responsive border border-warning rounded-3">
                <table class="table table-sm align-middle mb-0 small">
                  <thead class="table-warning">
                    <tr>
                      <th class="px-3">Sự cố</th>
                      <th>Trạng thái</th>
                      <th class="text-end px-3">Phạt / Bồi thường</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ic in invoiceIncidentList" :key="ic.id">
                      <td class="px-3"><strong>{{ ic.name }}</strong> - <span class="text-body-secondary">{{ ic.description }}</span></td>
                      <td>{{ ic.status }}</td>
                      <td class="text-end px-3 fw-bold">
                        <span v-if="ic.money > 0 && ic.responsible === 'CUSTOMER'" class="text-danger">+{{ formatPrice(ic.money) }} (Phạt)</span>
                        <span v-else-if="ic.money > 0 && ic.responsible === 'HOTEL'" class="text-success">-{{ formatPrice(ic.money) }} (Bồi thường)</span>
                        <span v-else class="text-body-secondary">0 đ</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- CẢNH BÁO CHẶN TẤT TOÁN NẾU CÒN SỰ CỐ CHƯA GIẢI QUYẾT -->
            <div v-if="unresolvedIncidentsForInvoice.length > 0" class="alert alert-danger border-danger shadow-sm mb-3">
              <div class="fw-bold mb-1">
                <i class="fas fa-exclamation-circle me-1"></i>
                Không thể tất toán & Check-out: Còn {{ unresolvedIncidentsForInvoice.length }} sự cố chưa giải quyết xong!
              </div>
              <div class="small">
                Vui lòng liên hệ Quản lý vận hành duyệt và chuyển trạng thái các sự cố sau sang <strong>Đã giải quyết (RESOLVED)</strong> trước khi thu tiền:
                <ul class="mb-0 mt-1 ps-3">
                  <li v-for="ic in unresolvedIncidentsForInvoice" :key="ic.id">
                    <strong>{{ ic.name }}</strong> (Phòng {{ ic.roomName || 'N/A' }} - Trạng thái: {{ ic.status }})
                  </li>
                </ul>
              </div>
            </div>

            <!-- Khối 5: Bảng Tổng kết Hóa đơn (3 nhánh: Thu thêm / Hòa 0đ / Hoàn tiền) -->
            <div class="p-3 rounded-3 border border-2 bg-body-tertiary"
                 :class="getNetPayable(selectedRentalForInvoice.id) < 0 ? 'border-success' : (getNetPayable(selectedRentalForInvoice.id) === 0 ? 'border-primary' : 'border-warning')">
              <div class="d-flex justify-content-between align-items-center mb-1 small">
                <span class="fw-semibold">Tổng tiền phòng + Phụ thu + Dịch vụ:</span>
                <span class="fw-bold fs-6">{{ formatPrice((currentInvoiceSummary?.roomAmount || 0) + (currentInvoiceSummary?.serviceAmount || 0)) }}</span>
              </div>
              <div v-if="(getSettlementInfo(selectedRentalForInvoice.id).incidentPenalty || 0) > 0" class="d-flex justify-content-between align-items-center mb-1 small text-danger">
                <span class="fw-semibold"><i class="fas fa-plus-circle me-1"></i>Phạt sự cố (Lỗi khách hàng):</span>
                <span class="fw-bold">+{{ formatPrice(getSettlementInfo(selectedRentalForInvoice.id).incidentPenalty) }}</span>
              </div>
              <div v-if="(getSettlementInfo(selectedRentalForInvoice.id).incidentCompensation || 0) > 0" class="d-flex justify-content-between align-items-center mb-1 small text-success">
                <span class="fw-semibold"><i class="fas fa-minus-circle me-1"></i>Bồi thường sự cố (Lỗi khách sạn):</span>
                <span class="fw-bold">-{{ formatPrice(getSettlementInfo(selectedRentalForInvoice.id).incidentCompensation) }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-2 small text-success">
                <span class="fw-semibold"><i class="fas fa-check-circle me-1"></i>Trừ tiền cọc đã thanh toán:</span>
                <span class="fw-bold">-{{ formatPrice(currentInvoiceSummary?.depositPaid || 0) }}</span>
              </div>
              <hr class="my-2 border-secondary-subtle">

              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <span v-if="getNetPayable(selectedRentalForInvoice.id) > 0" class="fw-bold text-uppercase text-body-emphasis fs-6 d-block">
                    CẦN THU THÊM KHI CHECK-OUT:
                  </span>
                  <span v-else-if="getNetPayable(selectedRentalForInvoice.id) === 0" class="fw-bold text-uppercase text-primary fs-6 d-block">
                    HÒA TIỀN — ĐÓNG ĐƠN 0 ĐỒNG:
                  </span>
                  <span v-else class="fw-bold text-uppercase text-success fs-6 d-block">
                    <i class="fas fa-hand-holding-usd me-1"></i>KHÁCH SẠN CẦN HOÀN LẠI CHO KHÁCH:
                  </span>
                  <small class="text-body-secondary">
                    Loại hóa đơn: <strong>{{ getNetPayable(selectedRentalForInvoice.id) < 0 ? 'Phiếu hoàn tiền (REFUND)' : 'Tất toán (FINAL)' }}</strong>
                  </small>
                </div>
                <span class="fw-bold fs-3" :class="getNetPayable(selectedRentalForInvoice.id) < 0 ? 'text-success' : (getNetPayable(selectedRentalForInvoice.id) === 0 ? 'text-primary' : 'text-danger')">
                  {{ formatPrice(Math.abs(getNetPayable(selectedRentalForInvoice.id))) }}
                </span>
              </div>

              <div class="row g-2 align-items-center mt-3 pt-2 border-top border-secondary-subtle">
                <div v-if="getNetPayable(selectedRentalForInvoice.id) !== 0" class="col-sm-4">
                  <label class="small fw-bold text-body-emphasis mb-1">
                    {{ getNetPayable(selectedRentalForInvoice.id) < 0 ? 'Phương thức hoàn tiền:' : 'Phương thức thu tiền:' }}
                  </label>
                  <select v-model="paymentForm[selectedRentalForInvoice.id]" class="form-select form-select-sm fw-bold bg-body text-body-emphasis border-secondary-subtle">
                    <option value="CASH">Tiền mặt tại quầy</option>
                    <option value="BANK">Chuyển khoản Ngân hàng</option>
                  </select>
                </div>
                <div v-if="getNetPayable(selectedRentalForInvoice.id) !== 0" class="col-sm-4">
                  <label class="small fw-bold text-body-emphasis mb-1">Mã giao dịch (Tùy chọn):</label>
                  <input type="text" v-model="transactionCodeInput" class="form-control form-control-sm bg-body text-body-emphasis border-secondary-subtle" placeholder="Nhập mã CK nếu có...">
                </div>
                <div :class="getNetPayable(selectedRentalForInvoice.id) !== 0 ? 'col-sm-4' : 'col-12'">
                  <label class="small fw-bold text-body-emphasis mb-1">Ghi chú hóa đơn:</label>
                  <input type="text" v-model="paymentNoteInput" class="form-control form-control-sm bg-body text-body-emphasis border-secondary-subtle" placeholder="VD: Bồi thường sự cố máy lạnh...">
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer bg-body-tertiary border-0 d-flex justify-content-between rounded-bottom-4 py-3 px-4">
            <button type="button" class="btn btn-outline-secondary text-body-emphasis fw-semibold" @click="printInvoiceReceipt" :disabled="isProcessing">
              <i class="fas fa-print me-1"></i> In hóa đơn
            </button>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-secondary px-4 fw-semibold" @click="closeInvoiceModal" :disabled="isProcessing">Hủy</button>
              <button type="button"
                      class="btn px-4 fw-bold shadow-sm"
                      :class="getNetPayable(selectedRentalForInvoice.id) === 0 ? 'btn-primary' : 'btn-success'"
                      @click="confirmFinalPaymentAndCheckout"
                      :disabled="isProcessing || unresolvedIncidentsForInvoice.length > 0">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="fas fa-check-double me-1"></i>
                {{ getNetPayable(selectedRentalForInvoice.id) < 0 ? 'Xác nhận Hoàn tiền & Check-out' : (getNetPayable(selectedRentalForInvoice.id) === 0 ? 'Xác nhận Đóng đơn 0đ & Check-out' : 'Xác nhận Thu tiền & Check-out') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL QUẢN LÝ DANH SÁCH KHÁCH ĐANG Ở TRONG PHÒNG -->
    <div v-if="showGuestListModal && editingRoomDetail" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.55); z-index: 1070;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body text-body-emphasis">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title fw-bold">
              <i class="fas fa-users me-2 text-info"></i>Danh sách khách lưu trú - Phòng {{ editingRoomDetail.room?.name }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="showGuestListModal = false"></button>
          </div>
          <form @submit.prevent="saveRoomGuests">
            <div class="modal-body p-4">
              <div v-if="guestModalError" class="alert alert-danger py-2 small fw-semibold">
                <i class="fas fa-exclamation-triangle me-1"></i> {{ guestModalError }}
              </div>

              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="small text-body-secondary">
                  Sức chứa tối đa: <strong class="text-body-emphasis">{{ editingRoomMaxAdults }} Người lớn, {{ editingRoomMaxChildren }} Trẻ em</strong>
                </span>
                <div class="d-flex gap-2">
                  <button type="button" class="btn btn-sm btn-outline-primary fw-bold" @click="addEditingGuest(true)"
                          :disabled="editingGuests.filter(g => g.isAdult).length >= editingRoomMaxAdults">
                    <i class="fas fa-user-plus me-1"></i>+ Người lớn
                  </button>
                  <button v-if="editingRoomMaxChildren > 0" type="button" class="btn btn-sm btn-outline-info fw-bold" @click="addEditingGuest(false)"
                          :disabled="editingGuests.filter(g => !g.isAdult).length >= editingRoomMaxChildren">
                    <i class="fas fa-child me-1"></i>+ Trẻ em
                  </button>
                </div>
              </div>

              <div v-for="(guest, idx) in editingGuests" :key="idx" class="row g-2 align-items-center mb-2 pb-2 border-bottom border-secondary-subtle">
                <div class="col-md-2">
                  <select v-model="guest.isAdult" class="form-select form-select-sm fw-semibold bg-body text-body-emphasis">
                    <option :value="true">Người lớn</option>
                    <option :value="false" :disabled="editingRoomMaxChildren <= 0">Trẻ em</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <input type="text" v-model="guest.fullName" class="form-control form-control-sm bg-body text-body-emphasis" placeholder="Họ và tên (*)" required>
                </div>
                <div class="col-md-3">
                  <input type="text" v-model="guest.pid" class="form-control form-control-sm bg-body text-body-emphasis"
                         :placeholder="guest.isAdult ? 'CCCD/Hộ chiếu (*)' : 'CCCD (Nếu có)'"
                         :required="guest.isAdult" minlength="9" maxlength="20">
                </div>
                <div class="col-md-2">
                  <input type="text" v-model="guest.phoneNumber" class="form-control form-control-sm bg-body text-body-emphasis" placeholder="SĐT">
                </div>
                <div class="col-md-1 text-end">
                  <span v-if="idx === 0" class="badge bg-success-subtle text-success border border-success-subtle">Đ.Diện</span>
                  <button v-else type="button" class="btn btn-sm btn-outline-danger py-0 px-2" @click="editingGuests.splice(idx, 1)">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="modal-footer bg-body-tertiary border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary fw-semibold" @click="showGuestListModal = false">Đóng</button>
              <button type="submit" class="btn btn-primary fw-bold px-4" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Lưu danh sách khách
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL ĐỔI PHÒNG GIỮA KỲ (SPLIT RENTAL DETAIL) -->
    <div v-if="showChangeRoomModal && changingDetail" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.55); z-index: 1080;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body text-body-emphasis">
          <div class="modal-header bg-primary text-white border-0">
            <h5 class="modal-title fw-bold"><i class="fas fa-exchange-alt me-2"></i>Đổi phòng đang ở (P.{{ changingDetail.room?.name }})</h5>
            <button type="button" class="btn-close btn-close-white" @click="showChangeRoomModal = false" :disabled="isProcessing"></button>
          </div>
          <form @submit.prevent="submitChangeRoom">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label class="form-label fw-semibold small text-body-secondary">Loại đổi phòng</label>
                <select v-model="changeRoomForm.reasonType" class="form-select bg-body text-body-emphasis">
                  <option value="CUSTOMER_REQUEST">Khách chủ động yêu cầu (Phòng cũ → Dọn dẹp, tính giá phòng mới)</option>
                  <option value="HOTEL_FAULT">Sự cố từ khách sạn (Phòng cũ → Bảo trì, giữ nguyên giá cũ nếu nâng hạng)</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold small text-body-secondary">Chọn phòng trống chuyển sang <span class="text-danger">*</span></label>
                <select v-model="changeRoomForm.newRoomId" class="form-select bg-body text-body-emphasis" required>
                  <option value="">-- Chọn phòng trống --</option>
                  <option v-for="rm in availableRoomsForChange" :key="rm.id" :value="rm.id">
                    Phòng {{ rm.name }} - {{ rm.roomType?.name }} ({{ rm.roomType?.adultMax }} NL, {{ rm.roomType?.childrenMax }} TE)
                  </option>
                </select>
                <small v-if="availableRoomsForChange.length === 0" class="text-danger">Hiện không có phòng trống khả dụng.</small>
              </div>
              <div class="mb-0">
                <label class="form-label fw-semibold small text-body-secondary">Ghi chú đổi phòng</label>
                <input v-model="changeRoomForm.note" type="text" class="form-control bg-body text-body-emphasis" placeholder="VD: Máy lạnh không mát, khách muốn đổi phòng view phố...">
              </div>
            </div>
            <div class="modal-footer bg-body-tertiary border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary fw-semibold" @click="showChangeRoomModal = false" :disabled="isProcessing">Hủy</button>
              <button type="submit" class="btn btn-primary fw-bold px-4" :disabled="isProcessing || !changeRoomForm.newRoomId">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Xác nhận chuyển phòng
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>


    <!-- MODAL THÊM DỊCH VỤ -->
    <div v-if="showAddServiceModal && selectedRentalForService" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1065;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body text-body-emphasis">
          <div class="modal-header bg-primary text-white border-0">
            <h5 class="modal-title fw-bold">
              <i class="fas fa-concierge-bell me-2"></i>Thêm dịch vụ — #{{ selectedRentalForService.id }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="showAddServiceModal = false"></button>
          </div>
          <form @submit.prevent="submitAddServiceModal">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label class="form-label fw-semibold small text-body-secondary">Chọn dịch vụ <span class="text-danger">*</span></label>
                <select v-model="serviceForm[selectedRentalForService.id].serviceId" class="form-select bg-body text-body-emphasis" required>
                  <option value="" disabled>-- Chọn dịch vụ --</option>
                  <option v-for="s in activeServices" :key="s.id" :value="s.id">
                    {{ s.name }} ({{ formatPrice(s.basePrice) }} / {{ s.unit || 'lần' }})
                  </option>
                </select>
              </div>
              <div class="mb-0">
                <label class="form-label fw-semibold small text-body-secondary">Số lượng <span class="text-danger">*</span></label>
                <input type="number" v-model="serviceForm[selectedRentalForService.id].quantity" class="form-control bg-body text-body-emphasis" min="1" required>
              </div>
            </div>
            <div class="modal-footer bg-body-tertiary border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary fw-semibold" @click="showAddServiceModal = false">Hủy</button>
              <button type="submit" class="btn btn-primary fw-bold px-4" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Thêm vào đơn
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL XEM NHANH DỊCH VỤ -->
    <div v-if="showServiceHistoryModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body text-body-emphasis">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-concierge-bell me-2"></i>Dịch vụ đã gọi - P.{{ currentServiceRoomName }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="showServiceHistoryModal = false"></button>
          </div>
          <div class="modal-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="adaptive-thead">
                  <tr>
                    <th class="px-3">Thời gian</th>
                    <th>Dịch vụ</th>
                    <th class="text-center">SL</th>
                    <th class="text-end">Thành tiền</th>
                    <th class="text-center px-3">Hủy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="currentRoomServices.length === 0">
                    <td colspan="5" class="text-center text-body-secondary py-3">Chưa có dịch vụ nào.</td>
                  </tr>
                  <tr v-for="svc in currentRoomServices" :key="svc.id">
                    <td class="px-3 small text-body-secondary">{{ formatTime(svc.time) }}</td>
                    <td class="fw-bold">{{ svc.service?.name }}</td>
                    <td class="text-center">{{ svc.count }}</td>
                    <td class="text-end fw-bold text-danger">{{ formatPrice(svc.count * svc.unitPrice) }}</td>
                    <td class="text-center px-3">
                      <button type="button"
                              class="btn btn-sm btn-outline-danger py-0 px-2"
                              title="Hủy dịch vụ này (chưa thanh toán)"
                              :disabled="isProcessing"
                              @click="removeServiceUsage(svc)">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="adaptive-thead">
                  <tr>
                    <td colspan="3" class="text-end fw-bold">Tổng cộng:</td>
                    <td colspan="2" class="text-end px-3 fw-bold text-danger fs-5">
                      {{ formatPrice(currentRoomServices.reduce((sum, s) => sum + (s.count * s.unitPrice), 0)) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div class="modal-footer bg-body-tertiary border-0 rounded-bottom-4">
            <button type="button" class="btn btn-secondary fw-semibold px-4" @click="showServiceHistoryModal = false">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL BÁO SỰ CỐ -->
    <div v-if="showIncidentModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1070;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body text-body-emphasis">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title fw-bold"><i class="fas fa-exclamation-triangle me-2"></i>Báo sự cố phòng {{ incidentRoomName }}</h5>
            <button type="button" class="btn-close" @click="showIncidentModal = false"></button>
          </div>
          <form @submit.prevent="submitIncident">
            <div class="modal-body p-4">
              <div class="mb-3"><label class="fw-semibold small text-body-secondary">Tên sự cố</label><input v-model="incidentForm.name" type="text" class="form-control bg-body text-body-emphasis" required placeholder="Hư bồn cầu, vỡ ly..."></div>
              <div class="mb-3"><label class="fw-semibold small text-body-secondary">Thời gian xảy ra</label><input v-model="incidentForm.occurTime" type="datetime-local" class="form-control bg-body text-body-emphasis" required></div>
              <div class="mb-0"><label class="fw-semibold small text-body-secondary">Mô tả chi tiết</label><textarea v-model="incidentForm.description" class="form-control bg-body text-body-emphasis" rows="2" required></textarea></div>
            </div>
            <div class="modal-footer bg-body-tertiary border-0 rounded-bottom-4">
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
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body text-body-emphasis">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-history me-2"></i>Sự cố phòng đang thuê</h5>
            <button type="button" class="btn-close btn-close-white" @click="showIncidentHistoryModal = false"></button>
          </div>
          <div class="modal-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="adaptive-thead">
                  <tr>
                    <th class="px-3">Thời gian</th>
                    <th>Sự cố</th>
                    <th>Trạng thái</th>
                    <th>Hướng xử lý</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ic in currentRoomIncidents" :key="ic.id">
                    <td class="px-3 small text-body-secondary">{{ formatDate(ic.occurTime) }}</td>
                    <td>
                      <span class="fw-bold d-block">{{ ic.name }}</span>
                      <span class="small text-body-secondary">{{ ic.description }}</span>
                    </td>
                    <td>
                      <span class="badge"
                            :class="ic.status === 'RESOLVED' ? 'bg-success' : (ic.status === 'PROCESSING' ? 'bg-warning text-dark' : 'bg-secondary')">
                        {{ ic.status === 'RESOLVED' ? 'Đã giải quyết' : (ic.status === 'PROCESSING' ? 'Đang xử lý' : 'Chờ xử lý') }}
                      </span>
                    </td>
                    <td class="small text-body-secondary">
                      <div v-if="ic.handle">{{ ic.handle }}</div>
                      <div v-if="ic.money > 0 && ic.responsible === 'CUSTOMER'" class="text-danger fw-bold mt-1">Phạt: +{{ formatPrice(ic.money) }}</div>
                      <div v-else-if="ic.money > 0 && ic.responsible === 'HOTEL'" class="text-success fw-bold mt-1">Bồi thường: -{{ formatPrice(ic.money) }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer bg-body-tertiary border-0 rounded-bottom-4">
            <button type="button" class="btn btn-secondary fw-semibold px-4" @click="showIncidentHistoryModal = false">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL CONFIRM -->
    <div v-if="showConfirmModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1095;">
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import api from '../../utils/axios'
import { formatPrice, formatDate, formatTime, formatDateTime } from '../../utils/formatters'

const activeTab = ref('stay')
const checkedInRentals = ref([])
const overdueRentals = ref([])
const checkedOutRentals = ref([])
const activeServices = ref([])
const billingSummaries = ref({})
const settlementDetails = ref({})
const allIncidents = ref([])
const allServiceUsages = ref([])
const isLoading = ref(true)
const isProcessing = ref(false)

const searchQuery = ref('')
const stayFilterType = ref('ALL')

const nowTick = ref(Date.now())
let clockInterval = null
const hoveredStayInfoId = ref(null)
const pinnedStayInfoId = ref(null)
const popoverDirectionClass = ref('open-down')

const updatePopoverDirection = (event) => {
  if (!event || !event.currentTarget) {
    popoverDirectionClass.value = 'open-down'
    return
  }
  const rect = event.currentTarget.getBoundingClientRect()
  const spaceAbove = rect.top
  const spaceBelow = window.innerHeight - rect.bottom
  popoverDirectionClass.value = (spaceBelow >= 280 || spaceAbove < 300) ? 'open-down' : 'open-up'
}

const handleHoverStayInfo = (event, rentalId) => {
  updatePopoverDirection(event)
  hoveredStayInfoId.value = rentalId
}

const handleTogglePinnedStayInfo = (event, rentalId) => {
  updatePopoverDirection(event)
  pinnedStayInfoId.value = pinnedStayInfoId.value === rentalId ? null : rentalId
}

const serviceForm = ref({})
const paymentForm = ref({})
const showIncidentModal = ref(false)
const showIncidentHistoryModal = ref(false)
const showServiceHistoryModal = ref(false)

const showInvoiceModal = ref(false)
const selectedRentalForInvoice = ref(null)
const transactionCodeInput = ref('')
const paymentNoteInput = ref('')

const showChangeRoomModal = ref(false)
const changingDetail = ref(null)
const availableRoomsForChange = ref([])
const changeRoomForm = ref({ newRoomId: '', reasonType: 'CUSTOMER_REQUEST', note: '' })

const showGuestListModal = ref(false)
const editingRoomDetail = ref(null)
const editingGuests = ref([])
const guestModalError = ref('')

const editingRoomMaxAdults = computed(() => editingRoomDetail.value?.room?.roomType?.adultMax || 2)
const editingRoomMaxChildren = computed(() => editingRoomDetail.value?.room?.roomType?.childrenMax || 0)

const currentRoomIncidents = ref([])
const currentRoomServices = ref([])
const currentServiceRoomName = ref('')
const currentViewingRental = ref(null)
const incidentRoomName = ref('')
const incidentForm = ref({ rentalDetailId: '', name: '', occurTime: '', description: '' })
const notification = ref({ type: '', message: '' })

const showConfirmModal = ref(false)
const confirmConfig = ref({ title: '', message: '', type: 'primary', icon: '', action: null })

const allActiveRentals = computed(() => [...overdueRentals.value, ...checkedInRentals.value])

const getActiveDetail = (r) =>
  (r?.rentalDetails || []).find(d => d.status === 'CHECKED_IN' || d.status === 'OVERDUE') || r?.rentalDetails?.[0]

const isOverdue = (r) => (r?.rentalDetails || []).some(d => d.status === 'OVERDUE')
const isSettled = (rentalId) => Boolean(settlementDetails.value[rentalId]?.settled)
const getBillingSummary = (id) => billingSummaries.value[id]
const getSettlementInfo = (rentalId) => settlementDetails.value[rentalId] || {}

const getNetPayable = (rentalId) => {
  const info = settlementDetails.value[rentalId]
  if (info && info.netPayable !== undefined && info.netPayable !== null) return info.netPayable
  return billingSummaries.value[rentalId]?.finalAmount || 0
}

// Badge trạng thái lưu trú thời gian thực (Đang ở / Sắp hết giờ / Quá hạn X phút)
const getStayStatusBadge = (r) => {
  const _tick = nowTick.value
  const d = getActiveDetail(r)
  const checkinRaw = d?.checkinDate ? new Date(d.checkinDate) : new Date()
  const plannedHours = d?.lengthOfStay || 1
  const expectedOutMs = checkinRaw.getTime() + plannedHours * 3600 * 1000
  const diffMinutes = Math.floor((expectedOutMs - _tick) / 60000)

  if (diffMinutes < 0 || isOverdue(r)) {
    const overMins = Math.max(1, Math.abs(diffMinutes))
    const h = Math.floor(overMins / 60)
    const m = overMins % 60
    const timeStr = h > 0 ? `${h}h ${m}p` : `${overMins} phút`
    return {
      text: `Quá hạn ${timeStr}`,
      badgeClass: 'bg-danger-subtle text-danger border border-danger-subtle',
      icon: 'fas fa-exclamation-circle'
    }
  }

  if (diffMinutes <= 30) {
    return {
      text: `Sắp hết (${Math.max(1, diffMinutes)} phút)`,
      badgeClass: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
      icon: 'fas fa-hourglass-half'
    }
  }

  const h = Math.floor(diffMinutes / 60)
  const m = diffMinutes % 60
  const remainStr = h > 0 ? `${h}h ${m}p` : `${m}p`
  return {
    text: `Đang ở (còn ${remainStr})`,
    badgeClass: 'bg-success-subtle text-success border border-success-subtle',
    icon: 'fas fa-check-circle'
  }
}

const filteredActiveRentals = computed(() => {
  let list = allActiveRentals.value

  if (stayFilterType.value === 'HOURLY') {
    list = list.filter(r => (getActiveDetail(r)?.rentalType || 'HOURLY') === 'HOURLY')
  } else if (stayFilterType.value === 'DAILY') {
    list = list.filter(r => getActiveDetail(r)?.rentalType === 'DAILY')
  } else if (stayFilterType.value === 'OVERDUE') {
    list = list.filter(r => isOverdue(r))
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return list

  return list.filter(r => {
    const idMatch = r.id?.toLowerCase().includes(q)
    const fullName = `${r.customer?.user?.lastName || ''} ${r.customer?.user?.firstName || ''}`.toLowerCase()
    const phone = (r.customer?.user?.phoneNumber || '').toLowerCase()
    const pid = (r.customer?.user?.pid || '').toLowerCase()
    const roomMatch = (r.rentalDetails || []).some(d =>
      d.room?.name?.toLowerCase().includes(q) ||
      (d.rentalGuests || []).some(g => g.fullName?.toLowerCase().includes(q) || g.pid?.toLowerCase().includes(q))
    )
    return idMatch || fullName.includes(q) || phone.includes(q) || pid.includes(q) || roomMatch
  })
})

const filteredCleaningRentals = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return checkedOutRentals.value
  return checkedOutRentals.value.filter(r => {
    const roomName = (r.rentalDetails?.[0]?.room?.name || '').toLowerCase()
    const fullName = `${r.customer?.user?.lastName || ''} ${r.customer?.user?.firstName || ''}`.toLowerCase()
    return roomName.includes(q) || fullName.includes(q) || (r.id || '').toLowerCase().includes(q)
  })
})

const getPlannedDurationLabel = (r) => {
  const d = getActiveDetail(r)
  if (!d) return '1 giờ'
  const hours = d.lengthOfStay || 1
  if (d.rentalType === 'DAILY') {
    const nights = Math.max(1, Math.round(hours / 22))
    return `${nights} đêm (${hours}h)`
  }
  return `${hours} giờ`
}

const getLiveStayMetrics = (r) => {
  const _tick = nowTick.value
  const d = getActiveDetail(r)
  const rentalType = d?.rentalType || 'HOURLY'
  const checkinRaw = d?.checkinDate ? new Date(d.checkinDate) : new Date()
  const plannedHours = d?.lengthOfStay || 1
  const expectedOut = new Date(checkinRaw.getTime() + plannedHours * 3600 * 1000)

  const diffMs = Math.max(0, _tick - checkinRaw.getTime())
  const totalSeconds = Math.floor(diffMs / 1000)
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  const pad = (n) => String(n).padStart(2, '0')
  const digitalClock = `${pad(hrs)} giờ ${pad(mins)} phút ${pad(secs)} giây`

  const totalMinutes = Math.floor(totalSeconds / 60)
  let roundedHours = 1
  let roundingRuleNote = ''

  if (totalMinutes <= 60) {
    roundedHours = 1
    roundingRuleNote = 'Mới ở dưới 60 phút → Tính tối thiểu 1 giờ đầu.'
  } else {
    const fullH = Math.floor(totalMinutes / 60)
    const remM = totalMinutes % 60
    if (remM <= 15) {
      roundedHours = fullH
      roundingRuleNote = `Lẻ ${remM} phút (≤ 15p ân hạn) → Làm tròn xuống ${fullH} giờ.`
    } else {
      roundedHours = fullH + 1
      roundingRuleNote = `Lẻ ${remM} phút (> 15p ân hạn) → Làm tròn lên ${fullH + 1} giờ.`
    }
  }

  return {
    typeLabel: rentalType === 'DAILY' ? 'Thuê qua đêm / Ngày' : 'Thuê theo giờ',
    checkinStr: formatDateTime(checkinRaw),
    expectedCheckoutStr: formatDateTime(expectedOut),
    digitalClock,
    roundedHours,
    roundedBillableLabel: `${roundedHours}h`,
    roundingRuleNote
  }
}

const getDetailIdsOfRental = (rental) => {
  if (!rental || !rental.rentalDetails) return []
  return rental.rentalDetails.map(d => d.id)
}

const getRentalIncidentCount = (rental) => {
  if (!allIncidents.value) return 0
  const ids = getDetailIdsOfRental(rental)
  return allIncidents.value.filter(ic => ids.includes(ic.rentalDetailId)).length
}

const getUnresolvedIncidents = (rental) => {
  if (!allIncidents.value || !rental) return []
  const ids = getDetailIdsOfRental(rental)
  return allIncidents.value.filter(ic => ids.includes(ic.rentalDetailId) && ic.status !== 'RESOLVED')
}

const unresolvedIncidentsForInvoice = computed(() => {
  return getUnresolvedIncidents(selectedRentalForInvoice.value)
})

const getRentalServiceCount = (rental) => {
  if (!allServiceUsages.value) return 0
  const ids = getDetailIdsOfRental(rental)
  return allServiceUsages.value.filter(s => ids.includes(s.rentalDetailId)).length
}

const currentInvoiceSummary = computed(() => {
  if (!selectedRentalForInvoice.value) return null
  return getBillingSummary(selectedRentalForInvoice.value.id)
})

const invoiceBaseRoomAmount = computed(() => {
  const s = currentInvoiceSummary.value
  if (!s) return 0
  return Math.max(0, (s.roomAmount || 0) - (s.earlyCheckinSurcharge || 0) - (s.lateCheckoutSurcharge || 0))
})

const invoiceServiceList = computed(() => {
  if (!selectedRentalForInvoice.value || !allServiceUsages.value) return []
  const ids = getDetailIdsOfRental(selectedRentalForInvoice.value)
  return allServiceUsages.value.filter(s => ids.includes(s.rentalDetailId))
})

const invoiceIncidentList = computed(() => {
  if (!selectedRentalForInvoice.value || !allIncidents.value) return []
  const ids = getDetailIdsOfRental(selectedRentalForInvoice.value)
  return allIncidents.value.filter(ic => ids.includes(ic.rentalDetailId))
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

const fetchData = async () => {
  isLoading.value = true
  try {
    const [resActive, resCleaning, resIncidents, resHistory] = await Promise.all([
      api.get('/api/staff/rentals/active'),
      api.get('/api/staff/rentals/cleaning'),
      api.get('/api/staff/incidents'),
      api.get('/api/staff/history')
    ])

    checkedInRentals.value = resActive.data.checkedInRentals || []
    overdueRentals.value = resActive.data.overdueRentals || []
    activeServices.value = resActive.data.activeServices || []
    billingSummaries.value = resActive.data.billingSummaries || {}
    settlementDetails.value = resActive.data.settlementDetails || {}
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

const openGuestListModal = (detail) => {
  editingRoomDetail.value = detail
  guestModalError.value = ''
  if (detail.rentalGuests && detail.rentalGuests.length > 0) {
    editingGuests.value = detail.rentalGuests.map((g, idx) => ({
      fullName: g.fullName || '',
      pid: g.pid || '',
      phoneNumber: g.phoneNumber || '',
      isAdult: g.isAdult !== false,
      isRepresentative: idx === 0
    }))
  } else {
    editingGuests.value = [{ fullName: '', pid: '', phoneNumber: '', isAdult: true, isRepresentative: true }]
  }
  showGuestListModal.value = true
}

const addEditingGuest = (isAdult) => {
  editingGuests.value.push({ fullName: '', pid: '', phoneNumber: '', isAdult, isRepresentative: false })
}

const saveRoomGuests = async () => {
  guestModalError.value = ''
  isProcessing.value = true
  try {
    const res = await api.put(`/api/staff/rental-details/${editingRoomDetail.value.id}/guests`, editingGuests.value)
    showNotification('success', res.data.message || 'Đã cập nhật danh sách khách.')
    showGuestListModal.value = false
    await fetchData()
  } catch (error) {
    guestModalError.value = error.response?.data?.error || 'Lỗi khi lưu danh sách khách.'
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
      params: { walkInLengthOfStay: detail.lengthOfStay || 1 }
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
    await fetchData()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi khi đổi phòng.')
  } finally {
    isProcessing.value = false
  }
}

const showAddServiceModal = ref(false)
const selectedRentalForService = ref(null)

const openAddServiceModal = (rental) => {
  if (!serviceForm.value[rental.id]) {
    serviceForm.value[rental.id] = { serviceId: '', quantity: 1 }
  }
  selectedRentalForService.value = rental
  showAddServiceModal.value = true
}

const submitAddServiceModal = async () => {
  if (!selectedRentalForService.value) return
  await addService(selectedRentalForService.value.id)
  showAddServiceModal.value = false
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
    form.serviceId = ''
    form.quantity = 1
    await fetchData()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi thêm dịch vụ')
  } finally {
    isProcessing.value = false
  }
}

const viewServiceHistory = (rental) => {
  currentViewingRental.value = rental
  currentServiceRoomName.value = (rental.rentalDetails || []).map(d => d.room?.name).join(', ')
  const ids = getDetailIdsOfRental(rental)
  currentRoomServices.value = allServiceUsages.value.filter(s => ids.includes(s.rentalDetailId))
  showServiceHistoryModal.value = true
}

const removeServiceUsage = (svc) => {
  const serviceName = svc.service?.name || 'dịch vụ này'
  openConfirm(
    'Hủy dịch vụ',
    `Xác nhận hủy <strong>${svc.count}x ${serviceName}</strong> khỏi đơn thuê? (Chỉ áp dụng khi đơn chưa thanh toán tất toán)`,
    'danger',
    'fas fa-trash-alt',
    async () => {
      try {
        const res = await api.delete(`/api/staff/service-usages/${svc.id}`)
        showNotification('success', res.data.message || 'Đã hủy dịch vụ thành công.')
        await fetchData()
        if (currentViewingRental.value) {
          const ids = getDetailIdsOfRental(currentViewingRental.value)
          currentRoomServices.value = allServiceUsages.value.filter(s => ids.includes(s.rentalDetailId))
          if (currentRoomServices.value.length === 0) showServiceHistoryModal.value = false
        }
      } catch (error) {
        showNotification('danger', error.response?.data?.error || 'Lỗi khi hủy dịch vụ.')
      }
    }
  )
}

const openInvoiceModal = (rental) => {
  selectedRentalForInvoice.value = rental
  transactionCodeInput.value = ''
  paymentNoteInput.value = ''
  showInvoiceModal.value = true
}

const closeInvoiceModal = () => {
  showInvoiceModal.value = false
  selectedRentalForInvoice.value = null
}

const confirmFinalPaymentAndCheckout = async () => {
  if (!selectedRentalForInvoice.value) return
  const rental = selectedRentalForInvoice.value
  isProcessing.value = true
  try {
    const payRes = await api.post(`/api/staff/rentals/${rental.id}/final-payment`, {
      paymentMethod: paymentForm.value[rental.id] || 'CASH',
      transactionCode: transactionCodeInput.value,
      note: paymentNoteInput.value
    })
    await api.post(`/api/staff/rentals/${rental.id}/check-out`)

    showNotification('success', (payRes.data?.message || 'Tất toán thành công!') + ' Đã hoàn tất Check-out.')
    closeInvoiceModal()
    activeTab.value = 'cleaning'
    await fetchData()
  } catch (error) {
    showNotification('danger', error.response?.data?.error || 'Lỗi tất toán')
  } finally {
    isProcessing.value = false
  }
}

const printInvoiceReceipt = () => {
  if (!selectedRentalForInvoice.value) return
  const r = selectedRentalForInvoice.value
  const s = currentInvoiceSummary.value || {}
  const info = getSettlementInfo(r.id)
  const net = getNetPayable(r.id)
  const roomsText = (r.rentalDetails || []).map(d => d.room?.name).join(', ')
  const customerName = `${r.customer?.user?.lastName || ''} ${r.customer?.user?.firstName || ''}`.trim()
  const servicesRows = invoiceServiceList.value.map(svc =>
    `<tr><td>${svc.service?.name || ''}</td><td style="text-align:center">${svc.count}</td><td style="text-align:right">${formatPrice(svc.unitPrice)}</td><td style="text-align:right">${formatPrice(svc.count * svc.unitPrice)}</td></tr>`
  ).join('')

  const finalLabel = net < 0
    ? `HOÀN LẠI CHO KHÁCH (REFUND): ${formatPrice(Math.abs(net))}`
    : (net === 0 ? `HÒA TIỀN (0 ĐỒNG): 0 đ` : `THỰC THU KHI CHECK-OUT: ${formatPrice(net)}`)

  const printWin = window.open('', '', 'width=800,height=700')
  printWin.document.write(`
    <html><head><title>Hóa đơn #${r.id}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; line-height: 1.5; color: #222; }
      h2, h4 { margin: 4px 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #ccc; padding: 8px; font-size: 13px; }
      th { background: #f4f4f4; text-align: left; }
      .total-box { margin-top: 16px; padding: 12px; border: 2px solid #222; }
    </style></head><body>
    <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:10px;">
      <h2>KHÁCH SẠN ITHOTEL</h2>
      <div>HÓA ĐƠN TẤT TOÁN & TRẢ PHÒNG (#${r.id})</div>
    </div>
    <p><strong>Khách hàng:</strong> ${customerName} | <strong>Phòng:</strong> ${roomsText} | <strong>Số giờ tính đơn:</strong> ${getLiveStayMetrics(r).roundedBillableLabel}</p>
    <h4>1. Tiền phòng & Phụ thu</h4>
    <table>
      <tr><td>Tiền phòng gốc</td><td style="text-align:right">${formatPrice(invoiceBaseRoomAmount.value)}</td></tr>
      <tr><td>Phụ thu nhận phòng sớm</td><td style="text-align:right">${formatPrice(s.earlyCheckinSurcharge || 0)}</td></tr>
      <tr><td>Phụ thu trả phòng muộn</td><td style="text-align:right">${formatPrice(s.lateCheckoutSurcharge || 0)}</td></tr>
      <tr><th>Cộng tiền phòng</th><th style="text-align:right">${formatPrice(s.roomAmount || 0)}</th></tr>
    </table>
    <h4 style="margin-top:16px;">2. Dịch vụ sử dụng</h4>
    <table>
      <thead><tr><th>Dịch vụ</th><th style="text-align:center">SL</th><th style="text-align:right">Đơn giá</th><th style="text-align:right">Thành tiền</th></tr></thead>
      <tbody>${servicesRows || '<tr><td colspan="4" style="text-align:center">Không sử dụng dịch vụ</td></tr>'}</tbody>
      <tfoot><tr><th colspan="3">Cộng dịch vụ</th><th style="text-align:right">${formatPrice(s.serviceAmount || 0)}</th></tr></tfoot>
    </table>
    <div class="total-box">
      <div>Tổng tiền phòng + Dịch vụ: <strong>${formatPrice((s.roomAmount || 0) + (s.serviceAmount || 0))}</strong></div>
      ${(info.incidentPenalty || 0) > 0 ? `<div>Phạt sự cố (Lỗi khách): <strong>+${formatPrice(info.incidentPenalty)}</strong></div>` : ''}
      ${(info.incidentCompensation || 0) > 0 ? `<div>Bồi thường sự cố (Lỗi KS): <strong>-${formatPrice(info.incidentCompensation)}</strong></div>` : ''}
      <div>Trừ tiền cọc đã thanh toán: <strong>-${formatPrice(s.depositPaid || 0)}</strong></div>
      <div style="font-size:18px; margin-top:6px;"><strong>${finalLabel}</strong></div>
    </div>
    </body></html>
  `)
  printWin.document.close()
  printWin.print()
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

const openIncidentModal = (detail) => {
  if (!detail) return
  incidentRoomName.value = detail.room?.name
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
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

const viewIncidentHistory = (rental) => {
  const ids = getDetailIdsOfRental(rental)
  currentRoomIncidents.value = allIncidents.value.filter(ic => ids.includes(ic.rentalDetailId))
  showIncidentHistoryModal.value = true
}

onMounted(() => {
  fetchData()
  clockInterval = setInterval(() => {
    nowTick.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
})
</script>

<style scoped>
.adaptive-thead th,
.adaptive-thead td {
  background-color: var(--bs-tertiary-bg) !important;
  color: var(--bs-secondary-color) !important;
  border-color: var(--bs-border-color) !important;
}

.stay-time-popover {
  position: absolute;
  right: 0;
  width: 315px;
  z-index: 1055;
}

.stay-time-popover.open-down {
  top: calc(100% + 8px);
  bottom: auto;
}

.stay-time-popover.open-up {
  bottom: calc(100% + 8px);
  top: auto;
}
</style>