<template>
  <div class="bg-body-tertiary min-vh-100 pb-5">
    <div class="bg-dark text-white text-center py-5 position-relative" style="background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1542314831-c6a4d1409e1c?auto=format&fit=crop&w=1920&q=80') center/cover;">
      <div class="container py-5">
        <h1 class="display-4 fw-bold mb-3">Về ITHotel</h1>
        <p class="lead">Nơi kiến tạo những trải nghiệm nghỉ dưỡng đẳng cấp nhất.</p>
      </div>
    </div>

    <div class="container my-5">
      <div class="row align-items-center mb-5">
        <div class="col-md-6 mb-4 mb-md-0">
          <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" alt="Hotel View" class="img-fluid rounded-4 shadow-lg">
        </div>
        <div class="col-md-6 ps-md-5">
          <h6 class="text-primary fw-bold text-uppercase mb-2">Câu chuyện của chúng tôi</h6>
          <h2 class="fw-bold mb-4 text-body-emphasis">Chào mừng đến với hệ thống ITHotel</h2>
          <p class="text-body-secondary mb-3" style="line-height: 1.8;">
            Được thành lập vào năm 2026 bởi <strong>IT Group</strong>, ITHotel ra đời với sứ mệnh mang đến một không gian nghỉ dưỡng sang trọng, hiện đại nhưng vẫn giữ được nét ấm cúng, gần gũi như chính ngôi nhà của bạn.
          </p>
          <p class="text-body-secondary mb-4" style="line-height: 1.8;">
            Tọa lạc tại trung tâm thành phố, chúng tôi tự hào sở hữu hệ thống phòng nghỉ đa dạng, dịch vụ chăm sóc khách hàng 24/7 chuyên nghiệp và các tiện ích giải trí đỉnh cao. Dù bạn đi công tác hay nghỉ dưỡng, ITHotel luôn là sự lựa chọn hàng đầu.
          </p>
          <router-link to="/rooms" class="btn btn-primary px-4 py-2 fw-bold rounded-pill shadow-sm">Khám phá phòng nghỉ <i class="fas fa-arrow-right ms-2"></i></router-link>
        </div>
      </div>

      <div class="text-center mb-5 mt-5">
        <h2 class="fw-bold text-body-emphasis">Tại sao chọn ITHotel?</h2>
        <div class="bg-warning mx-auto mt-2 mb-4" style="width: 60px; height: 3px;"></div>
      </div>

      <div class="row g-4 text-center">
        <div class="col-md-4">
          <div class="card h-100 border-0 shadow-sm p-4 hover-top rounded-4 bg-body">
            <div class="text-primary mb-3">
              <i class="fas fa-bed fa-3x"></i>
            </div>
            <h5 class="fw-bold text-body-emphasis">Phòng nghỉ tiện nghi</h5>
            <p class="text-body-secondary small">Hệ thống phòng ốc thiết kế hiện đại, trang bị nội thất cao cấp bảo đảm giấc ngủ ngon.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100 border-0 shadow-sm p-4 hover-top rounded-4 bg-body">
            <div class="text-warning mb-3">
              <i class="fas fa-star fa-3x"></i>
            </div>
            <h5 class="fw-bold text-body-emphasis">Dịch vụ 5 sao</h5>
            <p class="text-body-secondary small">Đội ngũ nhân viên chuyên nghiệp, tận tâm, sẵn sàng hỗ trợ khách hàng 24/7.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100 border-0 shadow-sm p-4 hover-top rounded-4 bg-body">
            <div class="text-success mb-3">
              <i class="fas fa-utensils fa-3x"></i>
            </div>
            <h5 class="fw-bold text-body-emphasis">Ẩm thực đa dạng</h5>
            <p class="text-body-secondary small">Thưởng thức tinh hoa ẩm thực Á - Âu tại chuỗi nhà hàng sang trọng ngay bên trong khách sạn.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.hover-top { transition: transform 0.3s ease; }
.hover-top:hover { transform: translateY(-10px); }
</style>