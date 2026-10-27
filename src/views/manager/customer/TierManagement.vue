<template>
  <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
    <div class="card-header bg-white border-0 pt-4 pb-3 d-flex justify-content-between align-items-center">
      <h5 class="fw-bold mb-0 text-primary">Các Mốc Hạng Thẻ Hệ Thống</h5>
      <button @click="openCreateTierModal" class="btn btn-sm btn-primary shadow-sm fw-bold"><i class="fas fa-plus me-1"></i> Thêm Hạng Thẻ</button>
    </div>
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr><th class="px-4 py-3">Tên Hạng Thẻ</th><th class="py-3 text-end">Mốc chi tiêu</th><th class="py-3 text-center">Giảm giá (%)</th><th class="py-3">Đặc quyền</th><th class="py-3 text-end px-4">Thao tác</th></tr>
          </thead>
          <tbody>
            <tr v-for="t in dashboardData.tierCustomers" :key="t.id">
              <td class="px-4 fw-bold text-primary"><i class="fas fa-gem text-warning me-2"></i>{{ t.name }}</td>
              <td class="text-end fw-bold text-dark">{{ formatPrice(t.condition) }}</td>
              <td class="text-center fw-bold text-success">-{{ t.discount }}%</td>
              <td class="text-muted small">{{ t.benefit || 'Không có' }}</td>
              <td class="text-end px-4"><button @click="openEditTierModal(t)" class="btn btn-sm btn-outline-primary shadow-sm"><i class="fas fa-edit"></i> Sửa</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- MODAL -->
    <div v-if="showTierModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-primary text-white"><h5 class="modal-title fw-bold">{{ isEditMode ? 'Cập nhật' : 'Tạo mới' }}</h5><button type="button" class="btn-close btn-close-white" @click="showTierModal = false"></button></div>
          <form @submit.prevent="submitTier">
            <div class="modal-body p-4">
              <div class="mb-3"><label class="fw-semibold">Tên Hạng Thẻ</label><input v-model="form.name" type="text" class="form-control" required></div>
              <div class="mb-3"><label class="fw-semibold">Mốc chi tiêu (VNĐ)</label><input v-model="form.condition" type="number" class="form-control fw-bold" required></div>
              <div class="mb-3"><label class="fw-semibold">Giảm giá (%)</label><input v-model="form.discount" type="number" step="0.1" class="form-control text-primary fw-bold" required></div>
              <div class="mb-2"><label class="fw-semibold">Quyền lợi</label><textarea v-model="form.benefit" class="form-control" rows="2"></textarea></div>
            </div>
            <div class="modal-footer bg-light border-0"><button type="submit" class="btn btn-primary fw-bold">Lưu Cấu Hình</button></div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../../utils/axios'

const dashboardData = ref({}); const showTierModal = ref(false); const isEditMode = ref(false)
const form = ref({ tierCustomerId: '', name: '', condition: 0, discount: 0, benefit: '' })
const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0)

const fetchDashboard = async () => {
  try { dashboardData.value = (await api.get('/api/manager/customer/dashboard')).data } catch (error) { console.error(error) }
}

const openCreateTierModal = () => { isEditMode.value = false; form.value = { tierCustomerId: '', name: '', condition: 0, discount: 0, benefit: '' }; showTierModal.value = true }
const openEditTierModal = (tier) => { isEditMode.value = true; form.value = { tierCustomerId: tier.id, name: tier.name, condition: tier.condition, discount: tier.discount, benefit: tier.benefit || '' }; showTierModal.value = true }

const submitTier = async () => {
  try { await api.post('/api/manager/customer/tier-customers', form.value); showTierModal.value = false; fetchDashboard() } 
  catch (error) { alert("Lỗi lưu cấu hình") }
}
onMounted(() => fetchDashboard())
</script>