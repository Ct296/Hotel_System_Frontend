<template>
  <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-body-tertiary">
    <div class="card-header bg-transparent border-bottom-0 pt-4 pb-3 d-flex justify-content-between align-items-center">
      <h5 class="fw-bold mb-0 text-primary"><i class="fas fa-medal me-2"></i>Các Mốc Hạng Thẻ Hệ Thống</h5>
      <button @click="openCreateTierModal" class="btn btn-sm btn-primary shadow-sm fw-bold"><i class="fas fa-plus me-1"></i> Thêm Hạng Thẻ</button>
    </div>
    
    <div class="card-body p-0 mt-2">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-secondary">
            <tr>
              <th class="px-4 py-3">Tên Hạng Thẻ</th>
              <th class="py-3 text-end">Mốc chi tiêu cần đạt</th>
              <th class="py-3 text-center">Tỷ lệ Giảm giá</th>
              <th class="py-3">Đặc quyền đi kèm</th>
              <th class="py-3 text-end px-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!dashboardData.tierCustomers || dashboardData.tierCustomers.length === 0">
              <td colspan="5" class="text-center py-5 text-body-secondary">Hệ thống chưa có hạng thẻ nào.</td>
            </tr>
            <tr v-else v-for="t in dashboardData.tierCustomers" :key="t.id">
              <td class="px-4 fw-bold text-primary"><i class="fas fa-gem text-warning me-2"></i>{{ t.name }}</td>
              <td class="text-end fw-bold text-body-emphasis">{{ formatPrice(t.condition) }}</td>
              <td class="text-center fw-bold text-success fs-5">-{{ t.discount }}%</td>
              <td class="text-body-secondary small">{{ t.benefit || 'Không có' }}</td>
              <td class="text-end px-4"><button @click="openEditTierModal(t)" class="btn btn-sm btn-outline-primary shadow-sm fw-semibold"><i class="fas fa-edit me-1"></i> Sửa</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- MODAL -->
    <div v-if="showTierModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-cog me-2"></i>{{ isEditMode ? 'Cập nhật Hạng Thẻ' : 'Tạo Hạng Thẻ Mới' }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="showTierModal = false"></button>
          </div>
          <form @submit.prevent="submitTier">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label class="form-label fw-semibold text-body-secondary small">Tên Hạng Thẻ <span class="text-danger">*</span></label>
                <input v-model="form.name" type="text" class="form-control bg-body text-body-emphasis" placeholder="VD: Thẻ Vàng, Platinum..." required>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold text-body-secondary small">Mốc chi tiêu (VNĐ) <span class="text-danger">*</span></label>
                <input v-model="form.condition" type="number" class="form-control fw-bold bg-body text-body-emphasis" required>
                <small class="text-body-secondary" style="font-size: 0.75rem;">Tổng tiền khách phải tiêu để đạt mốc này.</small>
              </div>
              <div class="mb-4">
                <label class="form-label fw-semibold text-body-secondary small">Giảm giá (%) <span class="text-danger">*</span></label>
                <input v-model="form.discount" type="number" step="0.1" class="form-control text-primary fw-bold bg-body" placeholder="VD: 5, 10.5" required>
              </div>
              <div class="mb-2">
                <label class="form-label fw-semibold text-body-secondary small">Quyền lợi bổ sung</label>
                <textarea v-model="form.benefit" class="form-control bg-body text-body-emphasis" rows="3" placeholder="VD: Đưa đón sân bay miễn phí, Giỏ trái cây phòng..."></textarea>
              </div>
            </div>
            <div class="modal-footer bg-body border-0 rounded-bottom-4">
              <button type="button" class="btn btn-secondary fw-semibold" @click="showTierModal = false">Hủy</button>
              <button type="submit" class="btn btn-primary fw-bold"><i class="fas fa-save me-2"></i>Lưu Cấu Hình</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../../utils/axios'

const dashboardData = ref({})
const showTierModal = ref(false)
const isEditMode = ref(false)
const form = ref({ tierCustomerId: '', name: '', condition: 0, discount: 0, benefit: '' })

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0)

const fetchDashboard = async () => {
  try { 
    dashboardData.value = (await api.get('/api/manager/customer/dashboard')).data 
  } catch (error) { console.error(error) }
}

const openCreateTierModal = () => { 
  isEditMode.value = false
  form.value = { tierCustomerId: '', name: '', condition: 0, discount: 0, benefit: '' }
  showTierModal.value = true 
}

const openEditTierModal = (tier) => { 
  isEditMode.value = true
  form.value = { tierCustomerId: tier.id, name: tier.name, condition: tier.condition, discount: tier.discount, benefit: tier.benefit || '' }
  showTierModal.value = true 
}

const submitTier = async () => {
  try { 
    await api.post('/api/manager/customer/tier-customers', form.value)
    showTierModal.value = false
    fetchDashboard() 
  } catch (error) { 
    alert("Lỗi lưu cấu hình. Vui lòng kiểm tra lại.") 
  }
}

onMounted(() => fetchDashboard())
</script>