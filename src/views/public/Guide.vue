<template>
  <div class="bg-body-tertiary min-vh-100 pb-5">
    
    <!-- BANNER CHÍNH ĐỒNG BỘ -->
    <div class="position-relative hero-section d-flex align-items-center justify-content-center text-center text-white shadow-sm">
      <div class="hero-overlay"></div>
      <div class="container py-4 position-relative z-2">
        <h1 class="fw-bold text-uppercase mb-3 font-serif display-4 text-shadow-sm">Cẩm nang & Hướng dẫn lưu trú</h1>
        <p class="lead mb-0 opacity-75 text-shadow-sm">Mọi thông tin quy trình đặt phòng, nhận phòng và khung giờ phụ thu tại ITHotel.</p>
      </div>
    </div>
    
    <div class="container my-5">
      <!-- PHẦN 1: 2 THẺ HƯỚNG DẪN ĐẶT PHÒNG (ONLINE VS TRỰC TIẾP TẠI QUẦY) -->
      <div class="text-center mb-4">
        <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-bold mb-2">HÌNH THỨC ĐẶT PHÒNG</span>
        <h2 class="fw-bold text-body-emphasis font-serif">Quy Trình Dành Cho Quý Khách</h2>
        <p class="text-body-secondary small">Chọn hình thức đặt phòng của bạn để xem hướng dẫn chi tiết từng bước.</p>
      </div>

      <!-- Nút chuyển 2 Thẻ (Tabs) -->
      <div class="d-flex justify-content-center gap-3 mb-4 flex-wrap">
        <button type="button" 
                class="btn px-4 py-3 rounded-4 fw-bold shadow-sm transition-all"
                :class="activeGuideTab === 'online' ? 'btn-primary' : 'bg-body text-body-emphasis border border-secondary-subtle'"
                @click="activeGuideTab = 'online'">
          <i class="fas fa-globe me-2"></i>1. Khách đặt trực tuyến trên Website
        </button>
        <button type="button" 
                class="btn px-4 py-3 rounded-4 fw-bold shadow-sm transition-all"
                :class="activeGuideTab === 'walkin' ? 'btn-primary' : 'bg-body text-body-emphasis border border-secondary-subtle'"
                @click="activeGuideTab = 'walkin'">
          <i class="fas fa-person-walking-luggage me-2"></i>2. Khách thuê trực tiếp tại Quầy Lễ tân
        </button>
      </div>

      <!-- NỘI DUNG THẺ 1: KHÁCH ĐẶT ONLINE TRÊN WEB -->
      <div v-if="activeGuideTab === 'online'" class="card border-0 shadow-sm rounded-4 bg-body p-4 p-lg-5 mb-5">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 border-bottom border-secondary-subtle pb-3 mb-4">
          <div>
            <h4 class="fw-bold text-primary font-serif mb-1">
              <i class="fas fa-laptop-code me-2"></i>Hướng dẫn Đặt phòng Trực tuyến (Online Booking)
            </h4>
            <p class="text-body-secondary small mb-0">Chủ động giữ phòng trước, thanh toán cọc qua VNPay và tích lũy hạng thẻ thành viên.</p>
          </div>
          <router-link to="/rooms" class="btn btn-sm btn-dark rounded-pill px-3 py-2 fw-bold">
            Đặt phòng ngay <i class="fas fa-arrow-right ms-1"></i>
          </router-link>
        </div>

        <div class="row g-4">
          <div class="col-md-6 col-lg-3">
            <div class="p-3 rounded-4 bg-body-tertiary h-100 border border-secondary-subtle">
              <div class="badge bg-primary rounded-pill mb-2 px-3 py-1">Bước 1</div>
              <h6 class="fw-bold text-body-emphasis font-serif">Đăng ký & Đồng bộ CCCD</h6>
              <p class="small text-body-secondary mb-0">
                Đăng ký tài khoản và xác thực OTP qua Email. <strong>Lưu ý:</strong> Nếu bạn từng thuê phòng trực tiếp tại quầy trước đây, hãy nhập đúng số <strong>CCCD và SĐT</strong> lúc đó để hệ thống tự động gộp lịch sử chi tiêu và nâng hạng thẻ cho bạn!
              </p>
            </div>
          </div>

          <div class="col-md-6 col-lg-3">
            <div class="p-3 rounded-4 bg-body-tertiary h-100 border border-secondary-subtle">
              <div class="badge bg-info text-dark rounded-pill mb-2 px-3 py-1">Bước 2</div>
              <h6 class="fw-bold text-body-emphasis font-serif">Chọn phòng & Hình thức thuê</h6>
              <p class="small text-body-secondary mb-0">
                Vào mục <strong>Phòng nghỉ</strong>, chọn thuê <strong>Theo giờ</strong> (tối thiểu 1 giờ) hoặc <strong>Qua đêm / Theo ngày</strong> (mặc định nhận 14:00 - trả 12:00 trưa hôm sau). Bạn có thể chọn 1 hoặc nhiều phòng cùng lúc.
              </p>
            </div>
          </div>

          <div class="col-md-6 col-lg-3">
            <div class="p-3 rounded-4 bg-body-tertiary h-100 border border-secondary-subtle">
              <div class="badge bg-warning text-dark rounded-pill mb-2 px-3 py-1">Bước 3</div>
              <h6 class="fw-bold text-body-emphasis font-serif">Khai báo người đại diện ở</h6>
              <p class="small text-body-secondary mb-0">
                Ở mỗi phòng, chọn <strong>"Tôi lưu trú tại phòng này"</strong> (tối đa 1 phòng) hoặc <strong>"Đặt hộ / Người đi cùng"</strong>. Nếu đặt hộ, bạn chỉ cần nhập Họ tên + SĐT người nhận phòng (CCCD có thể bổ sung tại quầy).
              </p>
            </div>
          </div>

          <div class="col-md-6 col-lg-3">
            <div class="p-3 rounded-4 bg-body-tertiary h-100 border border-secondary-subtle">
              <div class="badge bg-success rounded-pill mb-2 px-3 py-1">Bước 4</div>
              <h6 class="fw-bold text-body-emphasis font-serif">Đóng cọc trong 15 phút</h6>
              <p class="small text-body-secondary mb-0">
                Sau khi xác nhận đặt, hệ thống giữ phòng <strong>15 phút</strong>. Bạn thanh toán tiền cọc qua cổng <strong>VNPay</strong> trong mục <em>Hồ sơ -> Booking & Hóa đơn</em> để chuyển đơn sang trạng thái <strong>Đã xác nhận</strong>.
              </p>
            </div>
          </div>
        </div>

        <div class="alert alert-warning border-warning border-start border-4 mt-4 mb-0 small">
          <strong><i class="fas fa-shield-halved me-1"></i> Quy tắc bảo vệ hệ thống khi đặt Online:</strong>
          Mỗi tài khoản chỉ được giữ tối đa <strong>03 đơn chờ thanh toán cọc</strong> cùng lúc. Nếu hủy đơn hoặc để quá hạn 15 phút liên tiếp từ <strong>03 lần trở lên trong vòng 24 giờ</strong>, tính năng đặt phòng trực tuyến sẽ tạm khóa 24 giờ.
        </div>
      </div>

      <!-- NỘI DUNG THẺ 2: KHÁCH THUÊ TRỰC TIẾP TẠI QUẦY (WALK-IN) -->
      <div v-if="activeGuideTab === 'walkin'" class="card border-0 shadow-sm rounded-4 bg-body p-4 p-lg-5 mb-5">
        <div class="border-bottom border-secondary-subtle pb-3 mb-4">
          <h4 class="fw-bold text-success font-serif mb-1">
            <i class="fas fa-concierge-bell me-2"></i>Hướng dẫn Thuê phòng Trực tiếp tại Quầy (Walk-in)
          </h4>
          <p class="text-body-secondary small mb-0">Dành cho quý khách đến trực tiếp khách sạn mà chưa đặt lịch trước trên website.</p>
        </div>

        <div class="row g-4">
          <div class="col-md-6 col-lg-3">
            <div class="p-3 rounded-4 bg-body-tertiary h-100 border border-secondary-subtle">
              <div class="badge bg-success rounded-pill mb-2 px-3 py-1">Bước 1</div>
              <h6 class="fw-bold text-body-emphasis font-serif">Chọn phòng tại Quầy Lễ tân</h6>
              <p class="small text-body-secondary mb-0">
                Lễ tân sẽ tra cứu bảng <strong>Timeline 24 giờ</strong> theo thời gian thực để tư vấn cho bạn các hạng phòng đang trống phù hợp với nhu cầu (thuê nghỉ theo giờ hoặc qua đêm).
              </p>
            </div>
          </div>

          <div class="col-md-6 col-lg-3">
            <div class="p-3 rounded-4 bg-body-tertiary h-100 border border-secondary-subtle">
              <div class="badge bg-primary rounded-pill mb-2 px-3 py-1">Bước 2</div>
              <h6 class="fw-bold text-body-emphasis font-serif">Xuất trình CCCD / Hộ chiếu</h6>
              <p class="small text-body-secondary mb-0">
                Cung cấp CCCD/Hộ chiếu và Số điện thoại cho lễ tân. Dù bạn chưa tạo tài khoản trên web, hệ thống vẫn tự động tạo hồ sơ khách hàng theo số CCCD để <strong>tích lũy chi tiêu nâng hạng thẻ</strong> cho bạn.
              </p>
            </div>
          </div>

          <div class="col-md-6 col-lg-3">
            <div class="p-3 rounded-4 bg-body-tertiary h-100 border border-secondary-subtle">
              <div class="badge bg-warning text-dark rounded-pill mb-2 px-3 py-1">Bước 3</div>
              <h6 class="fw-bold text-body-emphasis font-serif">Thanh toán cọc & Khai báo ở</h6>
              <p class="small text-body-secondary mb-0">
                Thanh toán khoản tiền cọc phòng bằng tiền mặt hoặc chuyển khoản tại quầy. Đồng thời xuất trình giấy tờ tùy thân của tất cả các thành viên đi cùng để lễ tân làm thủ tục Check-in.
              </p>
            </div>
          </div>

          <div class="col-md-6 col-lg-3">
            <div class="p-3 rounded-4 bg-body-tertiary h-100 border border-secondary-subtle">
              <div class="badge bg-dark rounded-pill mb-2 px-3 py-1">Bước 4</div>
              <h6 class="fw-bold text-body-emphasis font-serif">Nhận chìa khóa & Tận hưởng</h6>
              <p class="small text-body-secondary mb-0">
                Nhận thẻ từ/chìa khóa phòng. Trong quá trình lưu trú, bạn có thể bấm phím <strong>0</strong> trên điện thoại bàn để gọi thêm đồ ăn, thức uống, giặt ủi hoặc báo sự cố bất cứ lúc nào.
              </p>
            </div>
          </div>
        </div>

        <div class="alert alert-info border-info border-start border-4 mt-4 mb-0 small">
          <strong><i class="fas fa-lightbulb me-1"></i> Mẹo hay cho khách Walk-in:</strong>
          Nếu bạn cung cấp địa chỉ <strong>Email</strong> cho lễ tân lúc thuê phòng tại quầy, bạn vẫn sẽ nhận được đầy đủ thông báo xác nhận và <strong>Hóa đơn điện tử chi tiết</strong> gửi thẳng về hộp thư khi Check-out!
        </div>
      </div>

      <!-- PHẦN 2: QUY ĐỊNH THỦ TỤC CHECK-IN TẠI QUẦY -->
      <div class="card border-0 shadow-sm rounded-4 bg-body p-4 p-lg-5 mb-5">
        <div class="row g-4 align-items-center">
          <div class="col-lg-7">
            <span class="badge bg-danger-subtle text-danger rounded-pill px-3 py-1 fw-bold mb-2">QUY ĐỊNH LƯU TRÚ BẮT BUỘC</span>
            <h3 class="fw-bold text-body-emphasis font-serif mb-3">Thủ Tục Khi Đến Nhận Phòng (Check-in)</h3>
            <p class="text-body-secondary small mb-3">
              Tuân thủ theo Điều 30 Luật Cư trú và quy định an ninh trật tự tại cơ sở lưu trú, khi đến nhận phòng tại quầy lễ tân ITHotel, quý khách vui lòng thực hiện các bước sau:
            </p>
            <ul class="list-unstyled small text-body-secondary mb-0">
              <li class="d-flex align-items-start mb-3">
                <i class="fas fa-id-card text-primary fs-5 me-3 mt-1"></i>
                <div>
                  <strong class="text-body-emphasis d-block">1. Xuất trình giấy tờ tùy thân của TOÀN BỘ khách lưu trú:</strong>
                  Khi đặt phòng online chỉ cần thông tin người đại diện, nhưng khi nhận phòng tại quầy, <strong>tất cả Người lớn</strong> thực tế ở trong từng phòng bắt buộc phải xuất trình CCCD / CMND / Hộ chiếu hoặc tài khoản định danh VNeID hợp lệ để lễ tân ghi nhận vào danh sách khách của phòng đó. (Trẻ em đi cùng chỉ cần khai báo Họ tên).
                </div>
              </li>
              <li class="d-flex align-items-start mb-3">
                <i class="fas fa-user-Secret text-success fs-5 me-3 mt-1"></i>
                <div>
                  <strong class="text-body-emphasis d-block">2. Trường hợp nhận phòng Đặt hộ:</strong>
                  Nếu quý khách được bạn bè/người thân hoặc công ty đặt phòng hộ, quý khách chỉ cần đọc <strong>Mã đơn đặt phòng</strong> hoặc <strong>Họ tên + Số điện thoại người nhận phòng</strong> đã đăng ký và xuất trình CCCD của mình để nhận chìa khóa.
                </div>
              </li>
              <li class="d-flex align-items-start">
                <i class="fas fa-hourglass-half text-danger fs-5 me-3 mt-1"></i>
                <div>
                  <strong class="text-body-emphasis d-block">3. Thời hạn giữ phòng đối với đơn đã đặt cọc (Quy định No-show):</strong>
                  Hệ thống sẽ gửi email nhắc lịch trước giờ nhận phòng <strong>02 tiếng</strong>. Nếu quá giờ nhận phòng <strong>15 phút</strong> quý khách chưa đến, hệ thống sẽ gửi email cảnh báo khẩn. Quá <strong>60 phút</strong> kể từ giờ hẹn nhận phòng mà khách không có mặt và không liên hệ Hotline <strong>0901 000 001</strong>, đơn đặt phòng sẽ tự động hủy (No-show) và không hoàn lại tiền cọc.
                </div>
              </li>
            </ul>
          </div>

          <div class="col-lg-5">
            <div class="p-4 rounded-4 bg-body-tertiary border border-secondary-subtle">
              <h6 class="fw-bold text-body-emphasis font-serif mb-3">
                <i class="fas fa-clipboard-Check text-primary me-2"></i>Tóm tắt nhanh cho Khách hàng
              </h6>
              <div class="d-flex justify-content-between py-2 border-bottom border-secondary-subtle small">
                <span class="text-body-secondary">Thời gian giữ đơn chờ đóng cọc:</span>
                <strong class="text-danger">15 phút</strong>
              </div>
              <div class="d-flex justify-content-between py-2 border-bottom border-secondary-subtle small">
                <span class="text-body-secondary">Thời gian chờ Check-in tối đa:</span>
                <strong class="text-danger">60 phút sau giờ hẹn</strong>
              </div>
              <div class="d-flex justify-content-between py-2 border-bottom border-secondary-subtle small">
                <span class="text-body-secondary">Số phòng bản thân đại diện ở:</span>
                <strong class="text-primary">Tối đa 01 phòng/đơn</strong>
              </div>
              <div class="d-flex justify-content-between py-2 border-bottom border-secondary-subtle small">
                <span class="text-body-secondary">CCCD người lớn khi Check-in:</span>
                <strong class="text-success">Bắt buộc 100% khách</strong>
              </div>
              <div class="d-flex justify-content-between pt-2 small">
                <span class="text-body-secondary">Thời gian dọn phòng tiêu chuẩn:</span>
                <strong class="text-body-emphasis">30 phút sau Check-out</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PHẦN 3: THỜI GIAN CHECK-IN / CHECK-OUT & BẢNG PHỤ THU CHI TIẾT -->
      <div class="card border-0 shadow-sm rounded-4 bg-body p-4 p-lg-5">
        <div class="text-center mb-4">
          <span class="badge bg-warning-subtle text-warning-emphasis rounded-pill px-3 py-1 fw-bold mb-2">KHUNG GIỜ & PHỤ THU</span>
          <h3 class="fw-bold text-body-emphasis font-serif">Quy Định Thời Gian Nhận - Trả Phòng & Phụ Thu</h3>
          <p class="text-body-secondary small mb-0">Minh bạch cách tính giờ lưu trú và các mức phụ thu khi nhận phòng sớm hoặc trả phòng muộn.</p>
        </div>

        <!-- Khung giờ chuẩn của 2 hình thức -->
        <div class="row g-4 mb-4">
          <div class="col-md-6">
            <div class="p-4 rounded-4 bg-primary bg-opacity-10 border border-primary-subtle h-100">
              <h5 class="fw-bold text-primary font-serif mb-2"><i class="fas fa-moon me-2"></i>1. Hình thức Thuê Qua Đêm / Theo Ngày (DAILY)</h5>
              <ul class="small text-body-secondary mb-0" style="line-height: 1.8;">
                <li><strong>Giờ nhận phòng (Check-in) tiêu chuẩn:</strong> Từ <strong>14:00</strong> chiều.</li>
                <li><strong>Giờ trả phòng (Check-out) tiêu chuẩn:</strong> Trước <strong>12:00</strong> trưa ngày hôm sau (tương đương 22 giờ lưu trú/đêm).</li>
                <li>Nếu quý khách nhận phòng sớm hơn 14:00 hoặc trả phòng muộn hơn 12:00 trưa, hệ thống sẽ áp dụng <strong>bảng tỷ lệ phụ thu theo khung giờ</strong> bên dưới.</li>
              </ul>
            </div>
          </div>

          <div class="col-md-6">
            <div class="p-4 rounded-4 bg-success bg-opacity-10 border border-success-subtle h-100">
              <h5 class="fw-bold text-success font-serif mb-2"><i class="fas fa-clock me-2"></i>2. Hình thức Thuê Theo Giờ (HOURLY)</h5>
              <ul class="small text-body-secondary mb-0" style="line-height: 1.8;">
                <li><strong>Thời lượng thuê tối thiểu:</strong> <strong>01 giờ</strong>. Linh hoạt nhận và trả phòng vào bất kỳ khung giờ nào trong ngày.</li>
                <li><strong>Quy tắc làm tròn giờ khi Check-out:</strong> Không áp dụng phụ thu theo mốc cố định như thuê ngày. Hệ thống tính theo số phút thực tế lưu trú: phần lẻ từ <strong>01 – 30 phút</strong> được miễn phí làm tròn xuống; phần lẻ <strong>trên 30 phút</strong> sẽ được tính thành <strong>01 giờ tiếp theo</strong>.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Bảng phụ thu Nhận sớm / Trả muộn (Dành cho thuê DAILY) -->
        <div class="row g-4">
          <!-- Bảng Phụ thu Nhận phòng sớm -->
          <div class="col-lg-6">
            <h6 class="fw-bold text-body-emphasis mb-2">
              <i class="fas fa-sign-in-alt text-warning me-2"></i>Bảng Phụ thu Nhận phòng sớm (Trước 14:00)
            </h6>
            <div class="table-responsive border rounded-3">
              <table class="table table-hover align-middle mb-0 small">
                <thead class="table-light">
                  <tr>
                    <th class="px-3 py-2">Khung giờ nhận phòng thực tế</th>
                    <th class="text-end px-3 py-2">Mức phụ thu (% Giá đêm)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="px-3 fw-semibold">Trước 05:00 sáng</td>
                    <td class="text-end px-3 fw-bold text-danger">+100% giá phòng/đêm</td>
                  </tr>
                  <tr>
                    <td class="px-3 fw-semibold">Từ 05:00 đến trước 09:00 sáng</td>
                    <td class="text-end px-3 fw-bold text-warning-emphasis">+50% giá phòng/đêm</td>
                  </tr>
                  <tr>
                    <td class="px-3 fw-semibold">Từ 09:00 đến trước 14:00 chiều</td>
                    <td class="text-end px-3 fw-bold text-primary">+30% giá phòng/đêm</td>
                  </tr>
                  <tr class="table-success">
                    <td class="px-3 fw-semibold">Từ 14:00 chiều trở đi</td>
                    <td class="text-end px-3 fw-bold text-success">0% (Đúng giờ chuẩn)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Bảng Phụ thu Trả phòng muộn -->
          <div class="col-lg-6">
            <h6 class="fw-bold text-body-emphasis mb-2">
              <i class="fas fa-sign-out-alt text-danger me-2"></i>Bảng Phụ thu Trả phòng muộn (Sau 12:00 trưa)
            </h6>
            <div class="table-responsive border rounded-3">
              <table class="table table-hover align-middle mb-0 small">
                <thead class="table-light">
                  <tr>
                    <th class="px-3 py-2">Khung giờ trả phòng thực tế</th>
                    <th class="text-end px-3 py-2">Mức phụ thu (% Giá đêm)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="table-success">
                    <td class="px-3 fw-semibold">Trước hoặc đúng 12:00 trưa</td>
                    <td class="text-end px-3 fw-bold text-success">0% (Đúng giờ chuẩn)</td>
                  </tr>
                  <tr>
                    <td class="px-3 fw-semibold">Từ sau 12:00 đến 15:00 chiều</td>
                    <td class="text-end px-3 fw-bold text-primary">+30% giá phòng/đêm</td>
                  </tr>
                  <tr>
                    <td class="px-3 fw-semibold">Từ sau 15:00 đến 18:00 tối</td>
                    <td class="text-end px-3 fw-bold text-warning-emphasis">+50% giá phòng/đêm</td>
                  </tr>
                  <tr>
                    <td class="px-3 fw-semibold">Sau 18:00 tối</td>
                    <td class="text-end px-3 fw-bold text-danger">+100% giá phòng/đêm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="mt-3 text-end small">
          <router-link to="/policy#phu-thu" class="text-decoration-none fw-bold text-primary">
            Xem văn bản pháp lý quy định chi tiết về Chính sách phụ thu <i class="fas fa-external-link-alt ms-1"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeGuideTab = ref('online') // 'online' | 'walkin'
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
.transition-all {
  transition: all 0.25s ease;
}
</style>