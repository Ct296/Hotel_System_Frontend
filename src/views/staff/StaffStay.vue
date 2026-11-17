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
                <th>Chủ đơn / Mã</th>
                <th>Phòng & Khách lưu trú</th>
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
                
                <td class="text-end px-3" style="min-width: 230px;">
                  <div v-if="!isSettled(r.id)" class="d-flex flex-column align-items-end gap-1">
                    <div class="small text-muted mb-2">
                       Đã ở: <strong class="text-dark">{{ getBillingSummary(r.id)?.actualStayHours || 0 }}h</strong>
                       <span class="mx-1">|</span>
                       Cần thu: <strong class="text-danger fs-6">{{ formatPrice(getBillingSummary(r.id)?.finalAmount) }}</strong>
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
                  <strong>Nhận phòng:</strong> {{ formatDateTime(selectedRentalForInvoice.rentalDetails?.[0]?.checkinDate) }}
                </div>
                <div class="small">
                  <strong>Trả phòng (Thực tế):</strong> {{ formatDateTime(new Date()) }}
                </div>
                <div class="small mt-1">
                  <strong>Hình thức thuê:</strong>
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle ms-1">
                    {{ selectedRentalForInvoice.rentalDetails?.[0]?.rentalType === 'DAILY' ? 'Thuê qua đêm / Ngày' : 'Thuê theo giờ' }}
                  </span>
                  <span class="ms-2">Tổng giờ ở: <strong>{{ currentInvoiceSummary?.actualStayHours || 1 }} giờ</strong></span>
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
                    <td class="text-muted">Tính theo thời gian lưu trú thực tế ({{ currentInvoiceSummary?.actualStayHours || 1 }} giờ)</td>
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
const incidentRoomName = ref('')
const incidentForm = ref({ rentalDetailId: '', name: '', occurTime: '', description: '' })
const notification = ref({ type: '', message: '' })

// Quản lý Modal Confirm
const showConfirmModal = ref(false)
const confirmConfig = ref({ title: '', message: '', type: 'primary', icon: '', action: null })

const allActiveRentals = computed(() => [...overdueRentals.value, ...checkedInRentals.value])

const isOverdue = (r) => r.rentalDetails[0]?.status === 'OVERDUE'
const isSettled = (rentalId) => false 

const getBillingSummary = (id) => billingSummaries.value[id]

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
  currentServiceRoomName.value = (rental.rentalDetails || []).map(d => d.room?.name).join(', ')
  const ids = getDetailIdsOfRental(rental)
  currentRoomServices.value = allServiceUsages.value.filter(s => ids.includes(s.rentalDetailId))
  showServiceHistoryModal.value = true
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
    <p><strong>Khách hàng:</strong> ${customerName} | <strong>Phòng:</strong> ${roomsText} | <strong>Số giờ ở:</strong> ${s.actualStayHours || 1}h</p>
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

onMounted(() => fetchData())
</script>