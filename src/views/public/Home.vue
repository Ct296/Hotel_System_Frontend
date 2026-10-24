<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-section text-white text-center d-flex align-items-center justify-content-center" style="min-height: 70vh; background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat;">
      <div class="container px-4">
        <h1 class="display-3 fw-bold mb-4">Chào mừng đến với ITHotel</h1>
        <p class="lead mb-5 fs-4 text-light">Trải nghiệm không gian nghỉ dưỡng đẳng cấp và dịch vụ hoàn hảo.</p>
        <router-link to="/rooms" class="btn btn-warning btn-lg fw-bold px-5 py-3 rounded-pill shadow text-uppercase transition-all hover-scale">
          <i class="fas fa-calendar-check me-2"></i> Đặt phòng ngay
        </router-link>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-5 bg-white">
      <div class="container py-5">
        <div class="text-center mb-5">
          <h2 class="fw-bold text-dark">Dịch vụ nổi bật</h2>
          <div class="mx-auto bg-primary mt-2" style="height: 3px; width: 60px;"></div>
        </div>
        
        <div class="row g-4 text-center">
          <div class="col-md-4">
            <div class="p-4 border-0 rounded-4 shadow-sm h-100 bg-light feature-card transition-all">
              <div class="icon-box bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4 shadow" style="width: 70px; height: 70px;">
                <i class="fas fa-bed fs-3"></i>
              </div>
              <h4 class="fw-bold">Phòng sang trọng</h4>
              <p class="text-muted mb-0">Đa dạng các loại phòng từ Tiêu chuẩn đến Suite, đáp ứng mọi nhu cầu lưu trú.</p>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="p-4 border-0 rounded-4 shadow-sm h-100 bg-light feature-card transition-all">
              <div class="icon-box bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4 shadow" style="width: 70px; height: 70px;">
                <i class="fas fa-concierge-bell fs-3"></i>
              </div>
              <h4 class="fw-bold">Hỗ trợ 24/7</h4>
              <p class="text-muted mb-0">Đội ngũ nhân viên tận tâm, chuyên nghiệp luôn sẵn sàng phục vụ bạn bất cứ lúc nào.</p>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="p-4 border-0 rounded-4 shadow-sm h-100 bg-light feature-card transition-all">
              <div class="icon-box bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4 shadow" style="width: 70px; height: 70px;">
                <i class="fas fa-map-marked-alt fs-3"></i>
              </div>
              <h4 class="fw-bold">Vị trí đắc địa</h4>
              <p class="text-muted mb-0">Tọa lạc ngay trung tâm, dễ dàng kết nối đến các điểm du lịch và mua sắm.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hover-scale:hover {
  transform: scale(1.05);
}
.feature-card:hover {
  transform: translateY(-5px);
  background-color: #fff !important;
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
}
.transition-all {
  transition: all 0.3s ease;
}
</style>