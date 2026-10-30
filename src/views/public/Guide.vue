<template>
  <div class="bg-body-tertiary min-vh-100 pb-5">
    <div class="bg-primary text-white py-5" style="background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);">
      <div class="container py-4 text-center">
        <h1 class="fw-bold mb-3">Hướng dẫn sử dụng dịch vụ</h1>
        <p class="lead mb-0 opacity-75">Từng bước đơn giản để tận hưởng trải nghiệm tại ITHotel.</p>
      </div>
    </div>
    
    <div class="container my-5 py-4">
      <div class="text-center mb-5">
        <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-bold mb-2">QUY TRÌNH ĐẶT PHÒNG</span>
        <h2 class="fw-bold text-body-emphasis">4 Bước Đơn Giản</h2>
      </div>
      
      <div class="row g-4 position-relative mb-5 pb-5 border-bottom border-secondary-subtle">
        <div class="d-none d-lg-block position-absolute top-50 start-0 w-100" style="height: 2px; background: var(--bs-border-color); transform: translateY(-50%); z-index: 0;"></div>
        
        <div class="col-12 col-md-6 col-lg-3 position-relative z-1 text-center">
          <div class="bg-body rounded-circle shadow-sm border border-primary d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;"><i class="fas fa-search fs-3 text-primary"></i></div>
          <h5 class="fw-bold text-body-emphasis">1. Tìm phòng</h5>
          <p class="text-body-secondary small px-3">Nhập thời gian nhận/trả trên trang chủ để hệ thống lọc các phòng trống.</p>
        </div>
        <div class="col-12 col-md-6 col-lg-3 position-relative z-1 text-center">
          <div class="bg-body rounded-circle shadow-sm border border-info d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;"><i class="fas fa-check-circle fs-3 text-info"></i></div>
          <h5 class="fw-bold text-body-emphasis">2. Điền thông tin</h5>
          <p class="text-body-secondary small px-3">Xem chi tiết phòng, giá thuê và xác nhận số lượng người lưu trú.</p>
        </div>
        <div class="col-12 col-md-6 col-lg-3 position-relative z-1 text-center">
          <div class="bg-body rounded-circle shadow-sm border border-warning d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;"><i class="fas fa-credit-card fs-3 text-warning"></i></div>
          <h5 class="fw-bold text-body-emphasis">3. Thanh toán cọc</h5>
          <p class="text-body-secondary small px-3">Sử dụng ví VNPay để thanh toán giữ chỗ trong vòng 30 phút.</p>
        </div>
        <div class="col-12 col-md-6 col-lg-3 position-relative z-1 text-center">
          <div class="bg-body rounded-circle shadow-sm border border-success d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;"><i class="fas fa-door-open fs-3 text-success"></i></div>
          <h5 class="fw-bold text-body-emphasis">4. Nhận phòng</h5>
          <p class="text-body-secondary small px-3">Đến quầy Lễ tân đọc mã Booking và trình CCCD để nhận khóa phòng.</p>
        </div>
      </div>
      
      <div class="row g-5 align-items-center mb-5">
        <div class="col-lg-6">
          <h3 class="fw-bold mb-4 text-body-emphasis">Trải nghiệm tại ITHotel</h3>
          <ul class="list-unstyled">
            <li class="d-flex mb-4">
              <div class="text-primary fs-3 me-3"><i class="fas fa-concierge-bell"></i></div>
              <div><h5 class="fw-bold mb-1 text-body-emphasis">Gọi dịch vụ tận phòng</h5><p class="text-body-secondary">Nhân viên sẽ mang đồ ăn, nước uống đến tận cửa phòng bạn.</p></div>
            </li>
            <li class="d-flex mb-4">
              <div class="text-warning fs-3 me-3"><i class="fas fa-crown"></i></div>
              <div><h5 class="fw-bold mb-1 text-body-emphasis">Tích lũy hạng thẻ</h5><p class="text-body-secondary">Mỗi chi tiêu đều được cộng dồn để tự động thăng hạng (Bạc, Vàng...) và nhận mức giảm giá.</p></div>
            </li>
            <li class="d-flex mb-4">
              <div class="text-danger fs-3 me-3"><i class="fas fa-file-invoice-dollar"></i></div>
              <div><h5 class="fw-bold mb-1 text-body-emphasis">Thanh toán trả sau (Check-out)</h5><p class="text-body-secondary">Tất cả chi phí phát sinh sẽ được thanh toán một lần tại quầy khi bạn trả phòng.</p></div>
            </li>
          </ul>
        </div>
        <div class="col-lg-6">
          <img src="https://images.unsplash.com/photo-1551882547-ff40c0d588fa?auto=format&fit=crop&w=800&q=80" class="img-fluid rounded-4 shadow">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>