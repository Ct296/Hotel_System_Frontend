<template>
  <div class="card border-0 shadow-sm rounded-4 mb-4">
    <!-- HEADER + NÚT XEM QUY ĐỊNH TÍNH TIỀN -->
    <div class="card-header bg-white border-0 pt-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
      <h5 class="fw-bold mb-0">
        <i class="fas fa-bed me-2 text-primary"></i>Quản lý Lưu trú & Dọn dẹp
      </h5>
      <button type="button"
              class="btn btn-sm btn-outline-primary rounded-pill fw-bold px-3 shadow-sm d-flex align-items-center gap-2"
              @click="showPricingRuleModal = true">
        <i class="fas fa-info-circle fs-6"></i> Quy tắc tính giờ & Phụ thu
      </button>
    </div>
    
    <div class="card-body">
      <!-- Thông báo Toast -->
      <div v-if="notification.message" :class="`alert alert-${notification.type} alert-dismissible fade show shadow-sm`" role="alert">
        <i :class="notification.type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-triangle me-2'"></i>
        {{ notification.message }}
        <button type="button" class="btn-close" @click="notification.message = ''"></button>
      </div>

      <!-- Tabs + Thanh Tìm kiếm & Số lượng -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3 border-bottom pb-2">
        <ul class="nav nav-pills">
          <li class="nav-item">
            <button class="nav-link fw-bold d-flex align-items-center gap-2"
                    :class="activeTab === 'stay' ? 'active bg-primary text-white shadow-sm' : 'text-secondary'"
                    @click="activeTab = 'stay'">
              <i class="fas fa-user-check"></i> Khách đang ở
              <span class="badge rounded-pill" :class="activeTab === 'stay' ? 'bg-white text-primary' : 'bg-primary text-white'">
                {{ allActiveRentals.length }}
              </span>
            </button>
          </li>
          <li class="nav-item ms-2">
            <button class="nav-link fw-bold d-flex align-items-center gap-2"
                    :class="activeTab === 'cleaning' ? 'active bg-danger text-white shadow-sm' : 'text-secondary'"
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
          <span class="badge bg-light text-dark border px-3 py-2 fw-semibold">
            Hiển thị: <strong class="text-primary">{{ activeTab === 'stay' ? filteredActiveRentals.length : filteredCleaningRentals.length }}</strong>
            / {{ activeTab === 'stay' ? allActiveRentals.length : checkedOutRentals.length }} đơn
          </span>

          <select v-if="activeTab === 'stay'" v-model="stayFilterType" class="form-select form-select-sm shadow-sm" style="width: 145px;">
            <option value="ALL">Mọi hình thức</option>
            <option value="HOURLY">Thuê theo giờ</option>
            <option value="DAILY">Thuê qua đêm</option>
            <option value="OVERDUE">Đang quá hạn ({{ overdueRentals.length }})</option>
          </select>

          <div class="input-group input-group-sm shadow-sm" style="width: 260px;">
            <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-muted"></i></span>
            <input type="text"
                   v-model="searchQuery"
                   class="form-control border-start-0"
                   placeholder="Tìm tên, mã đơn, phòng, SĐT, CCCD...">
            <button v-if="searchQuery" class="btn btn-outline-secondary border-start-0" type="button" @click="searchQuery = ''">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
      
      <div v-else class="tab-content border rounded bg-white">
        <!-- TAB 1: KHÁCH ĐANG Ở -->
        <div v-if="activeTab === 'stay'" class="table-responsive p-2" style="overflow: visible;">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Chủ đơn / Mã</th>
                <th>Phòng & Khách lưu trú</th>
                <th>Thời gian</th>
                <th>Dịch vụ</th>
                <th class="text-center px-2">Sự cố</th>
                <th class="text-end px-3">Tất toán & Out</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredActiveRentals.length === 0">
                <td colspan="6" class="text-center text-muted py-4">
                  <span v-if="searchQuery || stayFilterType !== 'ALL'">Không tìm thấy đơn lưu trú nào khớp với bộ lọc.</span>
                  <span v-else>Hiện không có khách lưu trú.</span>
                </td>
              </tr>
              <tr v-for="r in filteredActiveRentals" :key="r.id" :class="{'table-danger border-danger': isOverdue(r)}">
                <td>
                  <div class="fw-bold">{{ r.customer?.user?.lastName }} {{ r.customer?.user?.firstName }}</div>
                  <div class="small text-muted">{{ r.id }}</div>
                  <div v-if="r.customer?.user?.phoneNumber" class="small text-secondary">
                    <i class="fas fa-phone-alt me-1" style="font-size: 0.7rem;"></i>{{ r.customer.user.phoneNumber }}
                  </div>
                </td>
                <td>
                  <div v-for="detail in r.rentalDetails" :key="detail.id" class="d-flex align-items-center gap-2 mb-1">
                    <span class="badge" :class="isOverdue(r) ? 'bg-danger' : 'bg-secondary'">P.{{ detail.room?.name }}</span>
                    <button type="button" @click="openGuestListModal(detail)" class="btn btn-sm btn-outline-dark py-0 px-2 small shadow-sm" title="Xem / Cập nhật danh sách khách ở phòng này">
                      <i class="fas fa-users text-primary me-1"></i>
                      {{ detail.rentalGuests?.length || (detail.adultCount + detail.childrenCount) }} khách
                    </button>
                  </div>
                </td>
                <td>
                  <div class="small fw-semibold text-success">
                    <i class="fas fa-sign-in-alt me-1"></i>Vào: {{ formatTime(r.rentalDetails[0]?.checkinDate) }}
                  </div>
                  <div class="small text-muted">
                    <i class="fas fa-clock me-1"></i>ĐK:
                    <strong>{{ getPlannedDurationLabel(r) }}</strong>
                  </div>
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
                    
                    <button v-if="getRentalServiceCount(r) > 0" @click="viewServiceHistory(r)" class="btn btn-sm btn-outline-primary shadow-sm fw-bold w-100">
                      <i class="fas fa-list-ul me-1"></i> Lịch sử dịch vụ ({{ getRentalServiceCount(r) }})
                    </button>
                  </div>
                </td>

                <!-- CỘT SỰ CỐ -->
                <td class="text-center px-2">
                  <div class="d-flex flex-column gap-2 align-items-center">
                    <button @click="openIncidentModal(r.rentalDetails[0])" class="btn btn-sm btn-warning shadow-sm fw-bold w-100" title="Báo sự cố mới">
                      <i class="fas fa-exclamation-triangle"></i> Báo sự cố
                    </button>
                    <button v-if="getRentalIncidentCount(r) > 0" @click="viewIncidentHistory(r)" class="btn btn-sm btn-outline-info shadow-sm fw-bold w-100">
                      <i class="fas fa-history"></i> Lịch sử ({{ getRentalIncidentCount(r) }})
                    </button>
                  </div>
                </td>
                
                <!-- CỘT TẤT TOÁN & POPUP ĐỒNG HỒ SỐ CHI TIẾT (ĐỊNH VỊ THÔNG MINH) -->
                <td class="text-end px-3 position-relative" style="min-width: 255px;">
                  <div v-if="!isSettled(r.id)" class="d-flex flex-column align-items-end gap-1">
                    <div class="small text-muted mb-2 d-flex align-items-center justify-content-end gap-1 flex-wrap">
                      <span>Đã ở:</span>
                      <strong class="text-dark">{{ getLiveStayMetrics(r).roundedBillableLabel }}</strong>

                      <!-- NÚT CHỮ i TRONG HÌNH TRÒN (TỰ ĐỘNG TÍNH TOÁN VỊ TRÍ TRÁNH TRÀN MÀN HÌNH) -->
                      <div class="position-relative d-inline-block ms-1"
                           @mouseenter="handleHoverStayInfo($event, r.id)"
                           @mouseleave="hoveredStayInfoId = null">
                        <button type="button"
                                class="btn btn-link p-0 text-primary border-0 d-inline-flex align-items-center"
                                style="text-decoration: none;"
                                @click.stop="handleTogglePinnedStayInfo($event, r.id)"
                                title="Xem chi tiết thời gian lưu trú & làm tròn">
                          <i class="fas fa-info-circle fs-6"></i>
                        </button>

                        <!-- POPUP CHI TIẾT THỜI GIAN LƯU TRÚ & ĐỒNG HỒ SỐ -->
                        <div v-if="hoveredStayInfoId === r.id || pinnedStayInfoId === r.id"
                             class="stay-time-popover shadow-lg border rounded-3 bg-white text-start p-3"
                             :class="popoverDirectionClass"
                             @click.stop>
                          <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                            <span class="fw-bold text-primary small">
                              <i class="fas fa-stopwatch me-1"></i>Chi tiết thời gian #{{ r.id }}
                            </span>
                            <button v-if="pinnedStayInfoId === r.id"
                                    type="button"
                                    class="btn-close"
                                    style="font-size: 0.65rem;"
                                    @click="pinnedStayInfoId = null"></button>
                          </div>

                          <div class="small mb-1 d-flex justify-content-between">
                            <span class="text-muted">Hình thức thuê:</span>
                            <span class="fw-bold text-dark">{{ getLiveStayMetrics(r).typeLabel }}</span>
                          </div>
                          <div class="small mb-1 d-flex justify-content-between">
                            <span class="text-muted">Đăng ký trên đơn:</span>
                            <span class="fw-bold text-dark">{{ getPlannedDurationLabel(r) }}</span>
                          </div>
                          <div class="small mb-1 d-flex justify-content-between">
                            <span class="text-muted">Thực tế nhận phòng:</span>
                            <span class="fw-semibold text-success">{{ getLiveStayMetrics(r).checkinStr }}</span>
                          </div>
                          <div class="small mb-2 d-flex justify-content-between">
                            <span class="text-muted">Dự kiến trả phòng:</span>
                            <span class="fw-semibold text-secondary">{{ getLiveStayMetrics(r).expectedCheckoutStr }}</span>
                          </div>

                          <!-- ĐỒNG HỒ SỐ TĂNG DẦN THEO GIÂY -->
                          <div class="bg-dark text-white rounded-3 p-2 text-center my-2 shadow-sm">
                            <div class="text-white-50" style="font-size: 0.7rem; letter-spacing: 0.5px;">THỜI LƯỢNG ĐÃ LƯU TRÚ THỰC TẾ</div>
                            <div class="fw-bold text-warning font-monospace" style="font-size: 1.05rem; letter-spacing: 0.5px;">
                              <i class="far fa-clock me-1"></i>{{ getLiveStayMetrics(r).digitalClock }}
                            </div>
                          </div>

                          <div class="small d-flex justify-content-between align-items-center pt-1 border-top">
                            <span class="text-muted">Làm tròn tính đơn:</span>
                            <span class="badge bg-primary fs-6">{{ getLiveStayMetrics(r).roundedBillableLabel }}</span>
                          </div>
                          <div class="text-muted fst-italic mt-1" style="font-size: 0.73rem;">
                            {{ getLiveStayMetrics(r).roundingRuleNote }}
                          </div>
                        </div>
                      </div>

                      <span class="mx-1">|</span>
                      <span>Cần thu: <strong class="text-danger fs-6">{{ formatPrice(getBillingSummary(r.id)?.finalAmount) }}</strong></span>
                    </div>

                    <div class="d-flex gap-1 w-100 justify-content-end">
                      <select v-model="paymentForm[r.id]" class="form-select form-select-sm shadow-sm" required style="width:115px;">
                        <option value="CASH">Tiền mặt</option>
                        <option value="BANK">CK Ngân hàng</option>
                      </select>
                      <button type="button" @click="openInvoiceModal(r)" class="btn btn-sm btn-warning fw-bold py-1 px-3 shadow-sm" :disabled="isProcessing">
                        <i class="fas fa-file-invoice-dollar me-1"></i> Tất toán
                      </button>
                    </div>
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
              <tr v-if="filteredCleaningRentals.length === 0"><td colspan="4" class="text-center text-muted py-4">Không có phòng nào đang chờ dọn.</td></tr>
              <tr v-for="r in filteredCleaningRentals" :key="r.id">
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

    <!-- ==================== MODAL BẢNG QUY TẮC TÍNH TIỀN & LÀM TRÒN GIỜ ==================== -->
    <div v-if="showPricingRuleModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.55); z-index: 1090;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body">
          <div class="modal-header bg-primary text-white border-0">
            <h5 class="modal-title fw-bold">
              <i class="fas fa-calculator me-2"></i>Bảng Quy Tắc Tính Giờ Lưu Trú & Phụ Thu Khách Sạn
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="showPricingRuleModal = false"></button>
          </div>
          <div class="modal-body p-4">
            <!-- Bảng 1: Thuê theo giờ -->
            <h6 class="fw-bold text-primary mb-2">
              <i class="fas fa-clock me-2"></i>1. Hình thức Thuê theo giờ (HOURLY) — Ân hạn 15 phút
            </h6>
            <p class="small text-muted mb-2">
              Thời gian lưu trú thực tế được tính từ thời điểm bấm <strong>Check-in thực tế</strong> đến thời điểm trả phòng. Nếu khách nhận phòng sớm hơn giờ hẹn, mốc giờ trả phòng dự kiến ban đầu vẫn được giữ nguyên.
            </p>
            <div class="table-responsive border rounded-3 mb-4">
              <table class="table table-sm table-bordered align-middle mb-0 small">
                <thead class="table-light">
                  <tr>
                    <th class="px-3 py-2">Thời lượng khách ở thực tế</th>
                    <th>Quy tắc làm tròn</th>
                    <th class="text-center">Số giờ tính tiền</th>
                    <th>Ví dụ minh họa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="px-3 fw-semibold">Từ 1 phút đến 60 phút (≤ 1h00p)</td>
                    <td>Tính mức tối thiểu 1 giờ đầu</td>
                    <td class="text-center"><span class="badge bg-primary">1 giờ</span></td>
                    <td class="text-muted">Thuê 2h nhưng mới vào 5p hoặc 45p trả phòng → Tính <strong>1 giờ</strong></td>
                  </tr>
                  <tr>
                    <td class="px-3 fw-semibold">Giờ tiếp theo: lẻ từ 1 đến 15 phút</td>
                    <td class="text-success fw-semibold">Trong 15 phút ân hạn → Miễn phí phút lẻ</td>
                    <td class="text-center"><span class="badge bg-success">Giữ nguyên H giờ</span></td>
                    <td class="text-muted">Ở 1h05p hoặc 1h15p → Tính <strong>1 giờ</strong>; Ở 2h12p → Tính <strong>2 giờ</strong></td>
                  </tr>
                  <tr>
                    <td class="px-3 fw-semibold">Giờ tiếp theo: lẻ từ 16 phút trở lên</td>
                    <td class="text-danger fw-semibold">Vượt quá 15 phút ân hạn → Làm tròn +1 giờ</td>
                    <td class="text-center"><span class="badge bg-danger">H + 1 giờ</span></td>
                    <td class="text-muted">Ở 1h16p hoặc 1h30p → Tính <strong>2 giờ</strong>; Ở 2h20p → Tính <strong>3 giờ</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Bảng 2: Thuê qua đêm / ngày -->
            <h6 class="fw-bold text-primary mb-2">
              <i class="fas fa-moon me-2"></i>2. Hình thức Thuê qua đêm / Ngày (DAILY) — Chuẩn VTOS (14:00 - 12:00)
            </h6>
            <div class="row g-3 small">
              <div class="col-md-6">
                <div class="border rounded-3 p-3 h-100 bg-light">
                  <div class="fw-bold text-dark mb-2"><i class="fas fa-sun text-warning me-1"></i>Phụ thu Nhận phòng sớm (Trước 14:00)</div>
                  <ul class="mb-0 ps-3">
                    <li class="mb-1">Trước <strong>05:00 sáng</strong>: Phụ thu <strong class="text-danger">+100%</strong> giá ngày</li>
                    <li class="mb-1">Từ <strong>05:00 đến trước 09:00</strong>: Phụ thu <strong class="text-danger">+50%</strong> giá ngày</li>
                    <li class="mb-1">Từ <strong>09:00 đến trước 14:00</strong>: Phụ thu <strong class="text-danger">+30%</strong> giá ngày</li>
                    <li>Từ <strong>14:00 trở đi</strong>: Không phụ thu (0%)</li>
                  </ul>
                </div>
              </div>
              <div class="col-md-6">
                <div class="border rounded-3 p-3 h-100 bg-light">
                  <div class="fw-bold text-dark mb-2"><i class="fas fa-hourglass-end text-danger me-1"></i>Phụ thu Trả phòng muộn (Sau 12:00 trưa)</div>
                  <ul class="mb-0 ps-3">
                    <li class="mb-1">Từ <strong>12:00 trở về trước</strong>: Không phụ thu (0%)</li>
                    <li class="mb-1">Từ <strong>sau 12:00 đến 15:00</strong>: Phụ thu <strong class="text-danger">+30%</strong> giá ngày</li>
                    <li class="mb-1">Từ <strong>sau 15:00 đến 18:00</strong>: Phụ thu <strong class="text-danger">+50%</strong> giá ngày</li>
                    <li>Sau <strong>18:00 tối</strong>: Phụ thu <strong class="text-danger">+100%</strong> (Tính thêm 1 đêm)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light border-0">
            <button type="button" class="btn btn-primary fw-bold px-4" @click="showPricingRuleModal = false">Đã hiểu</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL HÓA ĐƠN TẤT TOÁN & CHECK-OUT CHI TIẾT ==================== -->
    <div v-if="showInvoiceModal && selectedRentalForInvoice" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.6); z-index: 1085;">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body">
          <!-- Header Hóa đơn -->
          <div class="modal-header bg-dark text-white border-0 py-3">
            <div>
              <h5 class="modal-title fw-bold mb-0">
                <i class="fas fa-file-invoice-dollar text-warning me-2"></i>HÓA ĐƠN TẤT TOÁN & TRẢ PHÒNG
              </h5>
              <small class="text-white-50">Mã đơn: #{{ selectedRentalForInvoice.id }} — Thời điểm lập: {{ formatDateTime(new Date()) }}</small>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="closeInvoiceModal" :disabled="isProcessing"></button>
          </div>

          <!-- Nội dung Hóa đơn -->
          <div class="modal-body p-4" style="max-height: 72vh; overflow-y: auto;">
            <!-- Khối 1: Thông tin Khách hàng & Thời gian lưu trú -->
            <div class="row g-3 mb-3 p-3 bg-light rounded-3 border">
              <div class="col-md-6">
                <div class="small text-muted text-uppercase fw-bold mb-1">Thông tin khách hàng</div>
                <div class="fw-bold text-dark fs-6">
                  {{ selectedRentalForInvoice.customer?.user?.lastName }} {{ selectedRentalForInvoice.customer?.user?.firstName }}
                </div>
                <div class="small text-secondary">
                  <i class="fas fa-id-card me-1"></i>CCCD: {{ selectedRentalForInvoice.customer?.user?.pid || 'N/A' }}
                  <span class="mx-1">|</span>
                  <i class="fas fa-phone me-1"></i>{{ selectedRentalForInvoice.customer?.user?.phoneNumber || 'N/A' }}
                </div>
                <div class="small mt-1">
                  <i class="fas fa-envelope me-1 text-primary"></i>
                  <span v-if="selectedRentalForInvoice.customer?.user?.email" class="text-success fw-semibold">
                    Hóa đơn điện tử sẽ gửi tới: {{ selectedRentalForInvoice.customer.user.email }}
                  </span>
                  <span v-else class="text-muted fst-italic">Khách chưa đăng ký Email nhận hóa đơn</span>
                </div>
              </div>
              <div class="col-md-6 border-start-md">
                <div class="small text-muted text-uppercase fw-bold mb-1">Chi tiết thời gian lưu trú</div>
                <div class="small">
                  <strong>Nhận phòng thực tế:</strong> {{ formatDateTime(selectedRentalForInvoice.rentalDetails?.[0]?.checkinDate) }}
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
            <h6 class="fw-bold text-dark mb-2"><i class="fas fa-bed text-primary me-2"></i>1. Chi tiết tiền phòng & Phụ thu</h6>
            <div class="table-responsive border rounded-3 mb-3">
              <table class="table table-sm align-middle mb-0">
                <thead class="table-light small">
                  <tr>
                    <th class="px-3 py-2">Hạng mục</th>
                    <th>Chi tiết</th>
                    <th class="text-end px-3">Thành tiền</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr v-for="detail in selectedRentalForInvoice.rentalDetails" :key="detail.id">
                    <td class="px-3 fw-bold text-primary">Phòng {{ detail.room?.name }} ({{ detail.room?.roomType?.name }})</td>
                    <td>
                      Đơn giá áp dụng: <strong>{{ formatPrice(detail.unitPrice) }}</strong> / {{ detail.rentalType === 'DAILY' ? 'đêm' : 'giờ' }}
                      <span class="text-muted ms-1">({{ detail.adultCount }} NL, {{ detail.childrenCount }} TE)</span>
                    </td>
                    <td class="text-end px-3 text-muted">Tính trong tổng gốc</td>
                  </tr>
                  <tr>
                    <td class="px-3 fw-semibold">Tiền phòng gốc</td>
                    <td class="text-muted">Tính theo thời gian lưu trú đã làm tròn ({{ getLiveStayMetrics(selectedRentalForInvoice).roundedBillableLabel }})</td>
                    <td class="text-end px-3 fw-bold text-dark">{{ formatPrice(invoiceBaseRoomAmount) }}</td>
                  </tr>
                  <tr v-if="(currentInvoiceSummary?.earlyCheckinSurcharge || 0) > 0" class="table-warning">
                    <td class="px-3 fw-semibold text-danger"><i class="fas fa-clock me-1"></i>Phụ thu nhận phòng sớm</td>
                    <td class="text-muted">Nhận phòng trước 14:00 (Chế độ thuê ngày)</td>
                    <td class="text-end px-3 fw-bold text-danger">+{{ formatPrice(currentInvoiceSummary.earlyCheckinSurcharge) }}</td>
                  </tr>
                  <tr v-if="(currentInvoiceSummary?.lateCheckoutSurcharge || 0) > 0" class="table-warning">
                    <td class="px-3 fw-semibold text-danger"><i class="fas fa-clock me-1"></i>Phụ thu trả phòng muộn</td>
                    <td class="text-muted">Trả phòng sau 12:00 trưa (Chế độ thuê ngày)</td>
                    <td class="text-end px-3 fw-bold text-danger">+{{ formatPrice(currentInvoiceSummary.lateCheckoutSurcharge) }}</td>
                  </tr>
                </tbody>
                <tfoot class="table-light small">
                  <tr>
                    <td colspan="2" class="text-end fw-bold">Cộng tiền phòng (1):</td>
                    <td class="text-end px-3 fw-bold text-primary fs-6">{{ formatPrice(currentInvoiceSummary?.roomAmount || 0) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Khối 3: Danh sách Dịch vụ đã sử dụng -->
            <h6 class="fw-bold text-dark mb-2"><i class="fas fa-concierge-bell text-success me-2"></i>2. Dịch vụ sử dụng ({{ invoiceServiceList.length }})</h6>
            <div class="table-responsive border rounded-3 mb-3">
              <table class="table table-sm align-middle mb-0">
                <thead class="table-light small">
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
                    <td colspan="5" class="text-center text-muted py-2 fst-italic">Không sử dụng dịch vụ phụ trợ nào.</td>
                  </tr>
                  <tr v-else v-for="svc in invoiceServiceList" :key="svc.id">
                    <td class="px-3 text-muted">{{ formatTime(svc.time) }}</td>
                    <td class="fw-semibold">{{ svc.service?.name }}</td>
                    <td class="text-center fw-bold">{{ svc.count }}</td>
                    <td class="text-end">{{ formatPrice(svc.unitPrice) }}</td>
                    <td class="text-end px-3 fw-bold text-dark">{{ formatPrice(svc.count * svc.unitPrice) }}</td>
                  </tr>
                </tbody>
                <tfoot class="table-light small">
                  <tr>
                    <td colspan="4" class="text-end fw-bold">Cộng tiền dịch vụ (2):</td>
                    <td class="text-end px-3 fw-bold text-success fs-6">{{ formatPrice(currentInvoiceSummary?.serviceAmount || 0) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Khối 4: Sự cố / Đền bù (Nếu có ghi nhận) -->
            <div v-if="invoiceIncidentList.length > 0" class="mb-3">
              <h6 class="fw-bold text-dark mb-2"><i class="fas fa-exclamation-triangle text-warning me-2"></i>Ghi nhận sự cố tại phòng ({{ invoiceIncidentList.length }})</h6>
              <div class="table-responsive border border-warning rounded-3">
                <table class="table table-sm align-middle mb-0 small">
                  <thead class="table-warning">
                    <tr>
                      <th class="px-3">Sự cố</th>
                      <th>Trạng thái</th>
                      <th class="text-end px-3">Tiền phạt ghi nhận</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ic in invoiceIncidentList" :key="ic.id">
                      <td class="px-3"><strong>{{ ic.name }}</strong> - <span class="text-muted">{{ ic.description }}</span></td>
                      <td>{{ ic.status }}</td>
                      <td class="text-end px-3 fw-bold text-danger">{{ ic.money > 0 ? formatPrice(ic.money) : '0 đ' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Khối 5: Bảng Tổng kết Hóa đơn & Chọn phương thức thanh toán -->
            <div class="p-3 rounded-3 border border-2 border-warning bg-warning-subtle">
              <div class="d-flex justify-content-between align-items-center mb-1 small">
                <span class="fw-semibold">Tổng chi phí (Tiền phòng + Phụ thu + Dịch vụ):</span>
                <span class="fw-bold fs-6">{{ formatPrice((currentInvoiceSummary?.roomAmount || 0) + (currentInvoiceSummary?.serviceAmount || 0)) }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-2 small text-success">
                <span class="fw-semibold"><i class="fas fa-check-circle me-1"></i>Trừ tiền cọc đã thanh toán:</span>
                <span class="fw-bold">-{{ formatPrice(currentInvoiceSummary?.depositPaid || 0) }}</span>
              </div>
              <hr class="my-2 border-secondary">
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <span class="fw-bold text-uppercase text-dark fs-6 d-block">CẦN THU THÊM KHI CHECK-OUT:</span>
                  <small class="text-muted">Loại hóa đơn: <strong>{{ currentInvoiceSummary?.billType === 'EARLY_CHECKOUT' ? 'Trả phòng sớm (EARLY_CHECKOUT)' : 'Tất toán chuẩn (FINAL)' }}</strong></small>
                </div>
                <span class="fw-bold text-danger fs-3">{{ formatPrice(currentInvoiceSummary?.finalAmount || 0) }}</span>
              </div>

              <div class="row g-2 align-items-center mt-3 pt-2 border-top border-warning">
                <div class="col-sm-5">
                  <label class="small fw-bold text-dark mb-1">Phương thức thanh toán:</label>
                  <select v-model="paymentForm[selectedRentalForInvoice.id]" class="form-select form-select-sm fw-bold border-dark">
                    <option value="CASH">Tiền mặt tại quầy</option>
                    <option value="BANK">Chuyển khoản Ngân hàng</option>
                  </select>
                </div>
                <div class="col-sm-7">
                  <label class="small fw-bold text-dark mb-1">Mã giao dịch / Ghi chú thanh toán (Tùy chọn):</label>
                  <input type="text" v-model="transactionCodeInput" class="form-control form-control-sm" placeholder="Nhập mã CK nếu khách chuyển khoản...">
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Hóa đơn -->
          <div class="modal-footer bg-light border-0 d-flex justify-content-between rounded-bottom-4 py-3 px-4">
            <button type="button" class="btn btn-outline-dark fw-semibold" @click="printInvoiceReceipt" :disabled="isProcessing">
              <i class="fas fa-print me-1"></i> In hóa đơn
            </button>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-secondary px-4 fw-semibold" @click="closeInvoiceModal" :disabled="isProcessing">Hủy</button>
              <button type="button" class="btn btn-warning px-4 fw-bold shadow-sm" @click="confirmFinalPaymentAndCheckout" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="fas fa-check-double me-1"></i> Xác nhận Thu tiền & Check-out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL QUẢN LÝ DANH SÁCH KHÁCH ĐANG Ở TRONG PHÒNG -->
    <div v-if="showGuestListModal && editingRoomDetail" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.55); z-index: 1070;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body">
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
                <span class="small text-muted">
                  Sức chứa tối đa: <strong>{{ editingRoomMaxAdults }} Người lớn, {{ editingRoomMaxChildren }} Trẻ em</strong>
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

              <div v-for="(guest, idx) in editingGuests" :key="idx" class="row g-2 align-items-center mb-2 pb-2 border-bottom border-light">
                <div class="col-md-2">
                  <select v-model="guest.isAdult" class="form-select form-select-sm fw-semibold">
                    <option :value="true">Người lớn</option>
                    <option :value="false" :disabled="editingRoomMaxChildren <= 0">Trẻ em</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <input type="text" v-model="guest.fullName" class="form-control form-control-sm" placeholder="Họ và tên (*)" required>
                </div>
                <div class="col-md-3">
                  <input type="text" v-model="guest.pid" class="form-control form-control-sm"
                         :placeholder="guest.isAdult ? 'CCCD/Hộ chiếu (*)' : 'CCCD (Nếu có)'"
                         :required="guest.isAdult" minlength="9" maxlength="20">
                </div>
                <div class="col-md-2">
                  <input type="text" v-model="guest.phoneNumber" class="form-control form-control-sm" placeholder="SĐT">
                </div>
                <div class="col-md-1 text-end">
                  <span v-if="idx === 0" class="badge bg-success-subtle text-success border">Đ.Diện</span>
                  <button v-else type="button" class="btn btn-sm btn-outline-danger py-0 px-2" @click="editingGuests.splice(idx, 1)">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light border-0">
              <button type="button" class="btn btn-secondary fw-semibold" @click="showGuestListModal = false">Đóng</button>
              <button type="submit" class="btn btn-primary fw-bold px-4" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span> Lưu danh sách khách
              </button>
            </div>
          </form>
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
                    <th class="text-end">Thành tiền</th>
                    <th class="text-center px-3">Hủy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="currentRoomServices.length === 0">
                    <td colspan="5" class="text-center text-muted py-3">Chưa có dịch vụ nào.</td>
                  </tr>
                  <tr v-for="svc in currentRoomServices" :key="svc.id">
                    <td class="px-3 small text-muted">{{ formatTime(svc.time) }}</td>
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
                <tfoot class="table-light">
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
    <div v-if="showConfirmModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1095;">
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import api from '../../utils/axios'
import { formatPrice, formatDate, formatTime, formatDateTime } from '../../utils/formatters'

const activeTab = ref('stay')
const checkedInRentals = ref([])
const overdueRentals = ref([])
const checkedOutRentals = ref([])
const activeServices = ref([])
const billingSummaries = ref({})
const allIncidents = ref([])
const allServiceUsages = ref([])
const isLoading = ref(true)
const isProcessing = ref(false)

// Tìm kiếm & lọc đơn
const searchQuery = ref('')
const stayFilterType = ref('ALL')

// Đồng hồ thời gian thực & Popup chi tiết giờ lưu trú
const nowTick = ref(Date.now())
let clockInterval = null
const hoveredStayInfoId = ref(null)
const pinnedStayInfoId = ref(null)
const popoverDirectionClass = ref('open-down')
const showPricingRuleModal = ref(false)

// Tự động tính toán khoảng trống màn hình để quyết định mở popup xuống dưới hay lên trên
const updatePopoverDirection = (event) => {
  if (!event || !event.currentTarget) {
    popoverDirectionClass.value = 'open-down'
    return
  }
  const rect = event.currentTarget.getBoundingClientRect()
  const spaceAbove = rect.top
  const spaceBelow = window.innerHeight - rect.bottom
  // Nếu phía dưới còn đủ chỗ (>= 280px) hoặc phía trên quá hẹp (< 300px) -> ưu tiên xổ xuống dưới để không đụng thanh địa chỉ Chrome
  if (spaceBelow >= 280 || spaceAbove < 300) {
    popoverDirectionClass.value = 'open-down'
  } else {
    popoverDirectionClass.value = 'open-up'
  }
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

// Quản lý Modal Hóa đơn Tất toán chi tiết
const showInvoiceModal = ref(false)
const selectedRentalForInvoice = ref(null)
const transactionCodeInput = ref('')

// Quản lý danh sách khách lưu trú trong phòng đang ở
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

// Quản lý Modal Confirm
const showConfirmModal = ref(false)
const confirmConfig = ref({ title: '', message: '', type: 'primary', icon: '', action: null })

const allActiveRentals = computed(() => [...overdueRentals.value, ...checkedInRentals.value])

// Lọc danh sách khách đang ở theo từ khóa và loại hình thuê
const filteredActiveRentals = computed(() => {
  let list = allActiveRentals.value

  if (stayFilterType.value === 'HOURLY') {
    list = list.filter(r => (r.rentalDetails?.[0]?.rentalType || 'HOURLY') === 'HOURLY')
  } else if (stayFilterType.value === 'DAILY') {
    list = list.filter(r => r.rentalDetails?.[0]?.rentalType === 'DAILY')
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

const isOverdue = (r) => r.rentalDetails?.[0]?.status === 'OVERDUE'
const isSettled = (rentalId) => false 

const getBillingSummary = (id) => billingSummaries.value[id]

// Hiển thị thời lượng đăng ký trên đơn (VD: "2 giờ" hoặc "1 đêm (22h)")
const getPlannedDurationLabel = (r) => {
  const d = r?.rentalDetails?.[0]
  if (!d) return '1 giờ'
  const hours = d.lengthOfStay || 1
  if (d.rentalType === 'DAILY') {
    const nights = Math.max(1, Math.round(hours / 22))
    return `${nights} đêm (${hours}h)`
  }
  return `${hours} giờ`
}

// Tính toán đồng hồ số (HH:MM:SS) & giải thích làm tròn theo thời gian thực
const getLiveStayMetrics = (r) => {
  const _tick = nowTick.value
  const d = r?.rentalDetails?.[0]
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

// Lấy toàn bộ detailIds thuộc 1 Rental (hỗ trợ cả đơn nhiều phòng)
const getDetailIdsOfRental = (rental) => {
  if (!rental || !rental.rentalDetails) return []
  return rental.rentalDetails.map(d => d.id)
}

const getRentalIncidentCount = (rental) => {
  if (!allIncidents.value) return 0
  const ids = getDetailIdsOfRental(rental)
  return allIncidents.value.filter(ic => ids.includes(ic.rentalDetailId)).length
}

const getRentalServiceCount = (rental) => {
  if (!allServiceUsages.value) return 0
  const ids = getDetailIdsOfRental(rental)
  return allServiceUsages.value.filter(s => ids.includes(s.rentalDetailId)).length
}

// Computed phục vụ Modal Hóa đơn Tất toán
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

// ---- QUẢN LÝ DANH SÁCH KHÁCH ĐANG Ở TRONG PHÒNG ----
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
    editingGuests.value = [{
      fullName: '',
      pid: '',
      phoneNumber: '',
      isAdult: true,
      isRepresentative: true
    }]
  }
  showGuestListModal.value = true
}

const addEditingGuest = (isAdult) => {
  editingGuests.value.push({
    fullName: '',
    pid: '',
    phoneNumber: '',
    isAdult,
    isRepresentative: false
  })
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
          if (currentRoomServices.value.length === 0) {
            showServiceHistoryModal.value = false
          }
        }
      } catch (error) {
        showNotification('danger', error.response?.data?.error || 'Lỗi khi hủy dịch vụ.')
      }
    }
  )
}

// ---- QUẢN LÝ MODAL HÓA ĐƠN TẤT TOÁN CHI TIẾT ----
const openInvoiceModal = (rental) => {
  selectedRentalForInvoice.value = rental
  transactionCodeInput.value = ''
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
    await api.post(`/api/staff/rentals/${rental.id}/final-payment`, {
      paymentMethod: paymentForm.value[rental.id] || 'CASH',
      transactionCode: transactionCodeInput.value
    })
    await api.post(`/api/staff/rentals/${rental.id}/check-out`)

    showNotification('success', 'Tất toán & Check-out thành công! Hóa đơn đã được gửi tới email khách hàng (nếu có).')
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
  const roomsText = (r.rentalDetails || []).map(d => d.room?.name).join(', ')
  const customerName = `${r.customer?.user?.lastName || ''} ${r.customer?.user?.firstName || ''}`.trim()
  const servicesRows = invoiceServiceList.value.map(svc =>
    `<tr><td>${svc.service?.name || ''}</td><td style="text-align:center">${svc.count}</td><td style="text-align:right">${formatPrice(svc.unitPrice)}</td><td style="text-align:right">${formatPrice(svc.count * svc.unitPrice)}</td></tr>`
  ).join('')

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
      <div>Tổng phát sinh: <strong>${formatPrice((s.roomAmount || 0) + (s.serviceAmount || 0))}</strong></div>
      <div>Trừ tiền cọc đã thanh toán: <strong>-${formatPrice(s.depositPaid || 0)}</strong></div>
      <div style="font-size:18px; margin-top:6px;"><strong>THỰC THU KHI CHECK-OUT: ${formatPrice(s.finalAmount || 0)}</strong></div>
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
.stay-time-popover {
  position: absolute;
  right: 0;
  width: 315px;
  z-index: 1055;
}

/* Khi dòng nằm gần phía trên màn hình -> tự động xổ xuống dưới */
.stay-time-popover.open-down {
  top: calc(100% + 8px);
  bottom: auto;
}

/* Khi dòng nằm ở sát đáy màn hình -> tự động bung ngược lên trên */
.stay-time-popover.open-up {
  bottom: calc(100% + 8px);
  top: auto;
}
</style>