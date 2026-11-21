<template>
  <div class="card border-0 shadow-sm rounded-4 mb-4 bg-body">
    <div class="card-header bg-transparent border-0 pt-4 pb-2">
      <h5 class="fw-bold mb-1 text-body-emphasis">
        <i class="fas fa-book-open me-2 text-primary"></i>Quy định Lễ tân & Nghiệp vụ
      </h5>
      <p class="small text-body-secondary mb-3">
        Tổng hợp quy tắc tính tiền, phụ thu, đổi phòng, xử lý sự cố và hoàn cọc áp dụng tại quầy.
      </p>

      <!-- 4 THẺ TAB CHUYỂN ĐỔI -->
      <ul class="nav nav-pills gap-2 border-bottom border-secondary-subtle pb-3">
        <li class="nav-item">
          <button class="nav-link fw-bold btn-sm"
                  :class="activeTab === 'pricing' ? 'active bg-primary text-white shadow-sm' : 'text-body-secondary bg-body-tertiary'"
                  @click="activeTab = 'pricing'">
            <i class="fas fa-calculator me-1"></i> Tính giờ & Phụ thu
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold btn-sm"
                  :class="activeTab === 'stay' ? 'active bg-primary text-white shadow-sm' : 'text-body-secondary bg-body-tertiary'"
                  @click="activeTab = 'stay'">
            <i class="fas fa-id-card me-1"></i> Check-in & Đổi phòng
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold btn-sm"
                  :class="activeTab === 'incident' ? 'active bg-primary text-white shadow-sm' : 'text-body-secondary bg-body-tertiary'"
                  @click="activeTab = 'incident'">
            <i class="fas fa-exclamation-triangle me-1"></i> Sự cố & Đền bù
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold btn-sm"
                  :class="activeTab === 'cancel' ? 'active bg-primary text-white shadow-sm' : 'text-body-secondary bg-body-tertiary'"
                  @click="activeTab = 'cancel'">
            <i class="fas fa-undo-alt me-1"></i> Hủy đơn & Hoàn cọc
          </button>
        </li>
      </ul>
    </div>

    <div class="card-body p-4">
      <!-- TAB 1: TÍNH GIỜ & PHỤ THU -->
      <div v-if="activeTab === 'pricing'">
        <h6 class="fw-bold text-primary mb-2">
          <i class="fas fa-clock me-2"></i>1. Hình thức Thuê theo giờ (HOURLY) — Ân hạn 15 phút
        </h6>
        <p class="small text-body-secondary mb-3">
          Thời gian lưu trú thực tế tính từ lúc bấm <strong>Check-in thực tế</strong> đến khi tất toán. Nếu khách vào sớm hơn giờ hẹn, mốc trả phòng dự kiến ban đầu vẫn được giữ nguyên.
        </p>
        <div class="table-responsive border border-secondary-subtle rounded-3 mb-4">
          <table class="table table-sm table-bordered align-middle mb-0 small">
            <thead class="adaptive-thead">
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
                <td class="text-body-secondary">Ở 10p hoặc 45p trả phòng → Tính <strong>1 giờ</strong></td>
              </tr>
              <tr>
                <td class="px-3 fw-semibold">Giờ tiếp theo: lẻ từ 1 đến 15 phút</td>
                <td class="text-success fw-semibold">Trong 15 phút ân hạn → Miễn phí phút lẻ</td>
                <td class="text-center"><span class="badge bg-success">Giữ nguyên H giờ</span></td>
                <td class="text-body-secondary">Ở 1h15p → <strong>1 giờ</strong>; Ở 2h12p → <strong>2 giờ</strong></td>
              </tr>
              <tr>
                <td class="px-3 fw-semibold">Giờ tiếp theo: lẻ từ 16 phút trở lên</td>
                <td class="text-danger fw-semibold">Vượt 15 phút ân hạn → Làm tròn +1 giờ</td>
                <td class="text-center"><span class="badge bg-danger">H + 1 giờ</span></td>
                <td class="text-body-secondary">Ở 1h16p → <strong>2 giờ</strong>; Ở 2h20p → <strong>3 giờ</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h6 class="fw-bold text-primary mb-2">
          <i class="fas fa-moon me-2"></i>2. Hình thức Thuê qua đêm / Ngày (DAILY) — Chuẩn 14:00 - 12:00
        </h6>
        <div class="row g-3 small">
          <div class="col-md-6">
            <div class="border border-secondary-subtle rounded-3 p-3 h-100 bg-body-tertiary">
              <div class="fw-bold text-body-emphasis mb-2"><i class="fas fa-sun text-warning me-1"></i>Phụ thu Nhận phòng sớm (Trước 14:00)</div>
              <ul class="mb-0 ps-3">
                <li class="mb-1">Trước <strong>05:00 sáng</strong>: Phụ thu <strong class="text-danger">+100%</strong> giá ngày</li>
                <li class="mb-1">Từ <strong>05:00 đến trước 09:00</strong>: Phụ thu <strong class="text-danger">+50%</strong> giá ngày</li>
                <li class="mb-1">Từ <strong>09:00 đến trước 14:00</strong>: Phụ thu <strong class="text-danger">+30%</strong> giá ngày</li>
                <li>Từ <strong>14:00 trở đi</strong>: Không phụ thu (0%)</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="border border-secondary-subtle rounded-3 p-3 h-100 bg-body-tertiary">
              <div class="fw-bold text-body-emphasis mb-2"><i class="fas fa-hourglass-end text-danger me-1"></i>Phụ thu Trả phòng muộn (Sau 12:00 trưa)</div>
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

      <!-- TAB 2: CHECK-IN & ĐỔI PHÒNG -->
      <div v-if="activeTab === 'stay'" class="row g-3 small">
        <div class="col-md-6">
          <div class="border border-secondary-subtle rounded-3 p-3 h-100 bg-body-tertiary">
            <h6 class="fw-bold text-primary mb-2"><i class="fas fa-id-card me-2"></i>Khai báo lưu trú khi Check-in</h6>
            <ul class="mb-0 ps-3">
              <li class="mb-2">Mỗi phòng bắt buộc có ít nhất <strong>1 người lớn</strong> đứng tên đại diện.</li>
              <li class="mb-2">Tất cả <strong>Người lớn</strong> bắt buộc nhập Họ tên và số CCCD/Hộ chiếu (9–20 ký tự). Trẻ em chỉ bắt buộc Họ tên.</li>
              <li class="mb-2">Một số CCCD/Hộ chiếu không được đăng ký trùng lặp ở 2 phòng khác nhau trong cùng một đơn.</li>
              <li>Số lượng người lớn và trẻ em không được vượt quá sức chứa tối đa của hạng phòng.</li>
            </ul>
          </div>
        </div>
        <div class="col-md-6">
          <div class="border border-secondary-subtle rounded-3 p-3 h-100 bg-body-tertiary">
            <h6 class="fw-bold text-primary mb-2"><i class="fas fa-exchange-alt me-2"></i>Quy tắc Đổi phòng</h6>
            <ul class="mb-0 ps-3">
              <li class="mb-2"><strong>Khách chủ động yêu cầu:</strong> Tính theo đơn giá của phòng mới. Phòng cũ chuyển sang trạng thái <strong>Dọn dẹp</strong>.</li>
              <li class="mb-2"><strong>Sự cố từ khách sạn:</strong> Nếu đổi sang phòng hạng cao hơn vẫn <strong>giữ nguyên giá cũ</strong> (lấy giá thấp hơn). Phòng cũ chuyển sang <strong>Bảo trì</strong>.</li>
              <li><strong>Thời gian dọn dẹp (Buffer):</strong> Hệ thống tự động cộng 30 phút dọn phòng sau giờ trả để tránh trùng lịch.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- TAB 3: SỰ CỐ & ĐỀN BÙ -->
      <div v-if="activeTab === 'incident'" class="small">
        <div class="alert alert-danger border-danger mb-3">
          <i class="fas fa-ban me-2"></i>
          <strong>Quy tắc chặn Check-out:</strong> Nếu đơn thuê còn bất kỳ sự cố nào ở trạng thái <strong>Chờ xử lý (PENDING)</strong> hoặc <strong>Đang xử lý (PROCESSING)</strong> (kể cả sự cố phát sinh ở phòng cũ trước khi đổi phòng), hệ thống sẽ <strong>khóa nút Tất toán & Check-out</strong> cho đến khi Quản lý duyệt xong (<strong>RESOLVED</strong>).
        </div>
        <div class="row g-3">
          <div class="col-md-4">
            <div class="border border-danger-subtle rounded-3 p-3 h-100 bg-body-tertiary">
              <div class="fw-bold text-danger mb-1">Lỗi Khách hàng (CUSTOMER)</div>
              <p class="mb-0 text-body-secondary">Hư hỏng tài sản, làm mất đồ... Số tiền phạt sau khi Quản lý duyệt sẽ tự động <strong>cộng (+)</strong> vào hóa đơn tất toán.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="border border-success-subtle rounded-3 p-3 h-100 bg-body-tertiary">
              <div class="fw-bold text-success mb-1">Lỗi Khách sạn (HOTEL)</div>
              <p class="mb-0 text-body-secondary">Hỏng thiết bị, mất điện/nước ảnh hưởng trải nghiệm... Tiền bồi thường sẽ tự động <strong>trừ (-)</strong> trực tiếp vào hóa đơn khách.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="border border-secondary-subtle rounded-3 p-3 h-100 bg-body-tertiary">
              <div class="fw-bold text-body-emphasis mb-1">Khách quan (NONE)</div>
              <p class="mb-0 text-body-secondary">Sự cố ngoài ý muốn không quy trách nhiệm. Ghi nhận lưu vết để kỹ thuật xử lý, không phát sinh tiền (0 đ).</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: HỦY ĐƠN & HOÀN CỌC -->
      <div v-if="activeTab === 'cancel'" class="small">
        <div class="border border-secondary-subtle rounded-3 p-3 bg-body-tertiary">
          <ul class="mb-0 ps-3">
            <li class="mb-2"><strong>Đơn chờ cọc (PENDING):</strong> Lễ tân có thể thu cọc tiền mặt tại quầy để xác nhận đơn, hoặc hủy đơn nếu khách đổi ý / quá hạn giữ chỗ.</li>
            <li class="mb-2"><strong>Đơn đã xác nhận (CONFIRMED) bị hủy do lỗi khách sạn:</strong> Chọn thao tác <strong>Hủy đơn & Hoàn cọc</strong> để lập phiếu hoàn 100% tiền cọc (Tiền mặt hoặc Chuyển khoản) kèm ghi chú lý do.</li>
            <li><strong>Hoàn tiền chênh lệch khi Check-out:</strong> Nếu tiền cọc + bồi thường sự cố lớn hơn tổng tiền phòng và dịch vụ, hệ thống tự động chuyển hóa đơn sang loại <strong>Phiếu hoàn tiền (REFUND)</strong> để lễ tân hoàn lại phần dư cho khách.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const activeTab = ref('pricing')
</script>

<style scoped>
.adaptive-thead th {
  background-color: var(--bs-tertiary-bg) !important;
  color: var(--bs-secondary-color) !important;
  border-color: var(--bs-border-color) !important;
}
</style>