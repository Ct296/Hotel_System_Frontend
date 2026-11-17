<template>
  <div class="bg-body-tertiary min-vh-100 pb-5">
    
    <!-- BANNER CHÍNH ĐỒNG BỘ -->
    <div class="position-relative hero-section d-flex align-items-center justify-content-center text-center text-white shadow-sm">
      <div class="hero-overlay"></div>
      <div class="container py-4 position-relative z-2">
        <h1 class="fw-bold text-uppercase mb-3 font-serif display-4 text-shadow-sm">Chính sách & Điều khoản Pháp lý</h1>
        <p class="lead mb-0 opacity-75 text-shadow-sm">Văn bản áp dụng chính thức tại Hệ thống Khách sạn ITHotel — Cập nhật: Tháng 11/2026</p>
      </div>
    </div>

    <div class="container my-5">
      <div class="row g-4">
        
        <!-- Sidebar - Sticky TOC -->
        <div class="col-lg-3 d-none d-lg-block">
          <div class="sticky-top" style="top: 100px; z-index: 10;">
            <div class="card border-0 shadow-sm rounded-4 bg-body">
              <div class="card-body p-4">
                <h6 class="fw-bold text-uppercase mb-3 text-body-secondary small font-serif">Danh mục văn bản</h6>
                <nav class="nav flex-column policy-toc small">
                  <a class="nav-link text-body-emphasis fw-semibold px-0 py-2 border-bottom border-secondary-subtle" href="#dieu-khoan">Điều 1. Điều khoản dịch vụ chung</a>
                  <a class="nav-link text-body-emphasis fw-semibold px-0 py-2 border-bottom border-secondary-subtle" href="#dat-phong">Điều 2. Quy định Đặt & Nhận phòng</a>
                  <a class="nav-link text-body-emphasis fw-semibold px-0 py-2 border-bottom border-secondary-subtle" href="#huy-phong">Điều 3. Chính sách Hủy phòng & Hoàn cọc</a>
                  <a class="nav-link text-body-emphasis fw-semibold px-0 py-2 border-bottom border-secondary-subtle" href="#phu-thu">Điều 4. Chính sách Phụ thu Lưu trú</a>
                  <a class="nav-link text-body-emphasis fw-semibold px-0 py-2 border-bottom border-secondary-subtle" href="#bao-mat">Điều 5. Bảo mật Dữ liệu & AI</a>
                  <router-link class="nav-link text-primary fw-bold px-0 py-2 mt-1" to="/business-license">
                    <i class="fas fa-certificate me-1"></i> Hồ sơ & Giấy phép kinh doanh
                  </router-link>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-lg-9">
          <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 policy-content bg-body">
            
            <p class="lead text-body-secondary mb-4" style="font-size: 1rem;">
              Văn bản này quy định quyền và nghĩa vụ pháp lý giữa <strong>Công ty Cổ phần Dịch vụ Lưu trú IT Group (Đơn vị chủ quản Khách sạn ITHotel)</strong> và <strong>Khách hàng sử dụng dịch vụ</strong>. Việc quý khách khởi tạo đơn đặt phòng trực tuyến hoặc làm thủ tục nhận phòng trực tiếp tại quầy đồng nghĩa với việc xác nhận đã đọc, hiểu rõ và cam kết tuân thủ toàn bộ các điều khoản dưới đây.
            </p>

            <!-- ĐIỀU 1: ĐIỀU KHOẢN DỊCH VỤ CHUNG -->
            <section id="dieu-khoan" class="mb-5 pt-2">
              <h4 class="fw-bold mb-3 text-primary font-serif">Điều 1. Điều khoản dịch vụ chung</h4>
              <p><strong>1.1. Phạm vi điều chỉnh:</strong> Điều khoản dịch vụ này điều chỉnh toàn bộ giao dịch đặt phòng trực tuyến qua website chính thức của ITHotel, giao dịch thuê phòng trực tiếp tại quầy lễ tân (Walk-in), việc sử dụng dịch vụ phụ trợ tại phòng và chương trình khách hàng thân thiết.</p>
              <p><strong>1.2. Quy chuẩn ứng xử và an ninh trật tự:</strong> Khách hàng lưu trú có nghĩa vụ tuân thủ pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam và nội quy PCCC của khách sạn. ITHotel có toàn quyền đơn phương chấm dứt hợp đồng lưu trú ngay lập tức, yêu cầu khách rời khỏi cơ sở lưu trú mà không hoàn lại chi phí nếu phát hiện hành vi tàng trữ chất cấm, vũ khí, tổ chức đánh bạc, mại dâm hoặc gây rối trật tự công cộng.</p>
              <p><strong>1.3. Trách nhiệm đối với tài sản cơ sở lưu trú:</strong> Mọi trang thiết bị, nội thất trong phòng được bàn giao nguyên vẹn khi Check-in. Trường hợp xảy ra hư hỏng, mất mát do lỗi cố ý hoặc vô ý của khách lưu trú, khách hàng có trách nhiệm bồi thường theo biên bản sự cố và biểu giá niêm yết của khách sạn trước khi hoàn tất thủ tục Check-out.</p>
            </section>

            <!-- ĐIỀU 2: QUY ĐỊNH ĐẶT & NHẬN PHÒNG -->
            <section id="dat-phong" class="mb-5 pt-2">
              <h4 class="fw-bold mb-3 text-primary font-serif">Điều 2. Quy định Đặt phòng, Đặt hộ & Khai báo cư trú</h4>
              <p><strong>2.1. Điều kiện xác lập giữ phòng:</strong> Đơn đặt phòng trực tuyến ở trạng thái <em>Chờ cọc (PENDING)</em> có thời hạn giữ chỗ tối đa <strong>15 phút</strong> kể từ thời điểm khởi tạo. Đơn đặt phòng chỉ phát sinh hiệu lực pháp lý giữ phòng chính thức (<em>CONFIRMED</em>) sau khi hệ thống ghi nhận giao dịch thanh toán tiền đặt cọc thành công qua cổng VNPay hoặc tại quầy lễ tân.</p>
              <p><strong>2.2. Quy định về người đại diện và Đặt phòng hộ:</strong> Mỗi cá nhân chỉ được phép đứng tên làm khách lưu trú đại diện cho tối đa <strong>01 phòng</strong> trong cùng một khung giờ. Trường hợp một chủ tài khoản đặt nhiều phòng hoặc đặt hộ cho người khác, chủ tài khoản có nghĩa vụ cung cấp chính xác Họ và tên cùng Số điện thoại của người đại diện nhận từng phòng.</p>
              <p><strong>2.3. Nghĩa vụ xuất trình giấy tờ tùy thân khi Check-in:</strong> Căn cứ Điều 30 Luật Cư trú số 68/2020/QH14 và Nghị định 96/2016/NĐ-CP, tại thời điểm nhận phòng, <strong>100% khách lưu trú là người lớn</strong> bắt buộc phải xuất trình Căn cước công dân (CCCD), Hộ chiếu hoặc định danh điện tử VNeID mức độ 2 để nhân viên lễ tân đối chiếu và khai báo lưu trú. Khách sạn có quyền từ chối giao phòng nếu khách lưu trú không cung cấp đủ giấy tờ hợp lệ.</p>
            </section>

            <!-- ĐIỀU 3: CHÍNH SÁCH HỦY PHÒNG & HOÀN TIỀN -->
            <section id="huy-phong" class="mb-5 pt-2">
              <h4 class="fw-bold mb-3 text-primary font-serif">Điều 3. Chính sách Hủy phòng & Xử lý Vi phạm (No-show / Spam)</h4>
              <p><strong>3.1. Hủy đơn khi chưa thanh toán tiền đặt cọc:</strong> Khách hàng có quyền chủ động hủy đơn đặt phòng đang ở trạng thái <em>Chờ cọc (PENDING)</em> mà không chịu phí phạt, hoặc đơn sẽ tự động hủy sau 15 phút nếu không phát sinh giao dịch đặt cọc.</p>
              <p><strong>3.2. Hủy đơn sau khi đã thanh toán tiền đặt cọc (Đơn đã xác nhận):</strong> Khoản tiền đặt cọc là khoản bảo đảm thực hiện hợp đồng lưu trú để khách sạn từ chối các khách hàng khác trong khung giờ đã giữ. Do đó, nếu khách hàng đơn phương hủy đơn sau khi đã đóng cọc, <strong>khoản tiền đặt cọc sẽ không được hoàn trả</strong> dưới mọi hình thức nhằm bù đắp thiệt hại cơ hội kinh doanh của khách sạn.</p>
              <p><strong>3.3. Quy định hủy tự động do khách không đến nhận phòng (No-show):</strong> Quá <strong>60 phút</strong> kể từ thời điểm nhận phòng đã đăng ký trên đơn <em>CONFIRMED</em> mà khách hàng không làm thủ tục Check-in tại quầy và không thông báo gia hạn qua Hotline lễ tân, hệ thống sẽ tự động chuyển trạng thái đơn sang <em>Đã hủy (CANCELLED - No-show)</em>, giải phóng phòng và không hoàn trả tiền đặt cọc.</p>
              <p><strong>3.4. Chế tài ngăn chặn hành vi giữ chỗ ảo (Spam Booking):</strong> Tài khoản khách hàng phát sinh từ <strong>03 lượt hủy đơn trở lên trong vòng 24 giờ</strong> (bao gồm cả tự hủy hoặc để hệ thống tự hủy do quá hạn cọc 15 phút) sẽ bị hệ thống tự động áp dụng trạng thái <em>Tạm khóa tính năng đặt phòng (BOOKING_BLOCKED)</em> trong thời hạn <strong>24 giờ</strong> tiếp theo.</p>
            </section>

            <!-- ĐIỀU 4: CHÍNH SÁCH PHỤ THU LƯU TRÚ (VĂN BẢN PHÁP LÝ) -->
            <section id="phu-thu" class="mb-5 pt-2">
              <h4 class="fw-bold mb-3 text-primary font-serif">Điều 4. Chính sách Phụ thu Lưu trú (Nhận phòng sớm, Trả phòng muộn & Quá giờ)</h4>
              <p><strong>4.1. Căn cứ tính thời gian lưu trú tiêu chuẩn:</strong></p>
              <ul>
                <li class="mb-2">Đối với hình thức <strong>Thuê qua đêm / Theo ngày (DAILY):</strong> Một ngày đêm lưu trú tiêu chuẩn được tính từ <strong>14:00</strong> ngày nhận phòng đến <strong>12:00 trưa</strong> ngày kế tiếp (tổng thời lượng tiêu chuẩn là 22 giờ lưu trú và 02 giờ dọn dẹp khử khuẩn buồng phòng).</li>
                <li class="mb-2">Đối với hình thức <strong>Thuê theo giờ (HOURLY):</strong> Thời lượng lưu trú tối thiểu là <strong>01 giờ (60 phút)</strong> tính từ thời điểm Check-in thực tế.</li>
              </ul>

              <p><strong>4.2. Biểu phí phụ thu Nhận phòng sớm (Early Check-in) — Áp dụng cho hình thức thuê DAILY:</strong></p>
              <p>Trường hợp khách hàng có nhu cầu nhận phòng trước mốc 14:00 tiêu chuẩn (tùy thuộc vào tình trạng phòng trống thực tế tại khách sạn), khoản phụ thu nhận phòng sớm được tính theo tỷ lệ phần trăm trên đơn giá phòng/đêm đã áp dụng của kỳ lưu trú đó:</p>
              <ul>
                <li class="mb-1">Nhận phòng trong khoảng thời gian <strong>trước 05:00 sáng:</strong> Phụ thu <strong>100%</strong> đơn giá phòng 01 đêm.</li>
                <li class="mb-1">Nhận phòng trong khoảng thời gian <strong>từ 05:00 sáng đến trước 09:00 sáng:</strong> Phụ thu <strong>50%</strong> đơn giá phòng 01 đêm.</li>
                <li class="mb-2">Nhận phòng trong khoảng thời gian <strong>từ 09:00 sáng đến trước 14:00 chiều:</strong> Phụ thu <strong>30%</strong> đơn giá phòng 01 đêm.</li>
              </ul>

              <p><strong>4.3. Biểu phí phụ thu Trả phòng muộn (Late Check-out) — Áp dụng cho hình thức thuê DAILY:</strong></p>
              <p>Trường hợp khách hàng hoàn tất thủ tục trả phòng sau mốc 12:00 trưa ngày Check-out dự kiến, khoản phụ thu trả phòng muộn được hệ thống tự động hạch toán vào Hóa đơn tất toán theo định mức:</p>
              <ul>
                <li class="mb-1">Trả phòng trong khoảng thời gian <strong>từ sau 12:00 trưa đến 15:00 chiều:</strong> Phụ thu <strong>30%</strong> đơn giá phòng 01 đêm.</li>
                <li class="mb-1">Trả phòng trong khoảng thời gian <strong>từ sau 15:00 chiều đến 18:00 tối:</strong> Phụ thu <strong>50%</strong> đơn giá phòng 01 đêm.</li>
                <li class="mb-2">Trả phòng <strong>sau 18:00 tối:</strong> Phụ thu <strong>100%</strong> đơn giá phòng 01 đêm (tương đương tính thêm 01 đêm lưu trú mới).</li>
              </ul>

              <p><strong>4.4. Quy tắc làm tròn thời gian đối với hình thức Thuê theo giờ (HOURLY) và Trả phòng sớm:</strong></p>
              <ul>
                <li class="mb-1">Đối với gói thuê theo giờ (<em>HOURLY</em>), thời gian lưu trú thực tế được tính bằng tổng số phút từ lúc Check-in đến lúc lập Hóa đơn tất toán. Phần thời gian phát sinh lẻ từ <strong>01 đến 30 phút</strong> được miễn phí; phần thời gian lẻ từ <strong>31 phút trở lên</strong> được làm tròn thành <strong>01 giờ lưu trú tiếp theo</strong>.</li>
                <li class="mb-1">Trường hợp khách hàng yêu cầu trả phòng sớm hơn thời gian đã đăng ký ban đầu, hệ thống sẽ phân loại hóa đơn thành <em>Hóa đơn thanh toán sớm (EARLY_CHECKOUT)</em> và tính phí dựa trên số giờ/đêm thực tế đã sử dụng (nhưng không thấp hơn mức tối thiểu 01 giờ lưu trú), khấu trừ trực tiếp khoản tiền đặt cọc đã đóng.</li>
              </ul>
            </section>

            <!-- ĐIỀU 5: QUYỀN RIÊNG TƯ & AI -->
            <section id="bao-mat" class="mb-4 pt-2">
              <h4 class="fw-bold mb-3 text-primary font-serif">Điều 5. Bảo mật Dữ liệu Cá nhân & Ứng dụng Trí tuệ Nhân tạo (AI)</h4>
              <p><strong>5.1. Cam kết bảo mật:</strong> Dữ liệu định danh của khách hàng (Họ tên, CCCD/Hộ chiếu, Số điện thoại, Email) được mã hóa và lưu trữ nội bộ để phục vụ mục đích xác thực nhận phòng, gửi hóa đơn điện tử và thực hiện nghĩa vụ khai báo lưu trú với cơ quan Công an có thẩm quyền.</p>
              <p><strong>5.2. Xử lý đánh giá bằng AI:</strong> Nội dung đánh giá công khai của khách hàng được hệ thống AI PhoBERT phân tích sắc thái tự động dưới dạng thống kê ẩn danh nhằm cải thiện chất lượng buồng phòng và dịch vụ.</p>
            </section>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const scrollToHash = () => {
  if (route.hash) {
    setTimeout(() => {
      const el = document.querySelector(route.hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

watch(() => route.hash, () => scrollToHash())
onMounted(() => scrollToHash())
</script>

<style scoped>
.hero-section {
  min-height: auto;
  padding: 120px 0;
  background: url('https://images.unsplash.com/photo-1542314831-c6a4d1409e1c?auto=format&fit=crop&w=1920&q=80') center center / cover no-repeat;
}
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.75));
  z-index: 1;
}
.text-shadow-sm {
  text-shadow: 0 4px 12px rgba(0,0,0,0.5);
}
.font-serif {
  font-family: 'Playfair Display', serif !important;
}
.policy-toc .nav-link {
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  padding-left: 12px !important;
}
.policy-toc .nav-link:hover {
  background-color: var(--bs-secondary-bg);
  color: #0d6efd !important;
  border-left-color: #0d6efd;
}
.policy-content section {
  scroll-margin-top: 100px;
}
.policy-content p, .policy-content li {
  font-size: 0.98rem;
  line-height: 1.8;
}
</style>