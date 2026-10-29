<template>
  <div class="position-relative pb-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Bàn Làm Việc Lễ Tân</h3>
        <p class="text-muted small mb-0">Quản lý đặt phòng, nhận/trả phòng và dịch vụ khách hàng.</p>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <ul class="nav nav-pills mb-4 gap-2 bg-white p-2 rounded-4 shadow-sm" id="staff-tabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link fw-bold px-4 rounded-pill" :class="{ active: currentTab === 'overview' }" @click="currentTab = 'overview'">
          <i class="fas fa-chart-pie me-2"></i>Tổng quan
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link fw-bold px-4 rounded-pill" :class="{ active: currentTab === 'timeline' }" @click="currentTab = 'timeline'">
          <i class="fas fa-calendar-check me-2"></i>Timeline & Walk-in
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link fw-bold px-4 rounded-pill" :class="{ active: currentTab === 'bookings' }" @click="currentTab = 'bookings'">
          <i class="fas fa-list-check me-2"></i>Booking Online
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link fw-bold px-4 rounded-pill" :class="{ active: currentTab === 'stay' }" @click="currentTab = 'stay'">
          <i class="fas fa-bed me-2"></i>Khách đang ở
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link fw-bold px-4 rounded-pill" :class="{ active: currentTab === 'cleaning' }" @click="currentTab = 'cleaning'">
          <i class="fas fa-broom me-2"></i>Dọn phòng
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link fw-bold px-4 rounded-pill" :class="{ active: currentTab === 'history' }" @click="currentTab = 'history'">
          <i class="fas fa-clock-rotate-left me-2"></i>Lịch sử
        </button>
      </li>
    </ul>

    <!-- Content Area (Render Dynamic Component) -->
    <div class="tab-content">
      <transition name="fade" mode="out-in">
        <component :is="activeComponent" @change-tab="handleTabChange" />
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Import các component con (Chúng ta sẽ tạo các file này ở bước sau)
import StaffOverview from './StaffOverview.vue/index.js'
import StaffTimelineWalkIn from './StaffTimelineWalkIn.vue/index.js'
import StaffBookings from './StaffBookings.vue/index.js'
import StaffStay from './StaffStay.vue/index.js'
import StaffCleaning from './StaffCleaning.vue/index.js'
import StaffHistory from './StaffHistory.vue/index.js'

const currentTab = ref('overview')

const componentsMap = {
  overview: StaffOverview,
  timeline: StaffTimelineWalkIn,
  bookings: StaffBookings,
  stay: StaffStay,
  cleaning: StaffCleaning,
  history: StaffHistory
}

const activeComponent = computed(() => componentsMap[currentTab.value])

// Cho phép các component con chuyển tab (vd: Đặt phòng walk-in xong thì nhảy sang tab Khách đang ở)
const handleTabChange = (tabName) => {
  if (componentsMap[tabName]) {
    currentTab.value = tabName
  }
}
</script>

<style scoped>
.nav-pills .nav-link {
  color: #6c757d;
  transition: all 0.2s ease-in-out;
}
.nav-pills .nav-link:hover:not(.active) {
  background-color: #f8f9fa;
}
.nav-pills .nav-link.active {
  background-color: #0d6efd;
  color: white;
  box-shadow: 0 4px 6px rgba(13, 110, 253, 0.2);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>