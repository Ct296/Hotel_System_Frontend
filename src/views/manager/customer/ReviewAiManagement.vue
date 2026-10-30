<template>
  <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-body-tertiary">
    <div class="card-header bg-transparent border-bottom-0 pt-4 pb-3">
      <h5 class="fw-bold mb-0 text-body-emphasis"><i class="fas fa-comments text-success me-2"></i>Danh sách Đánh giá & AI PhoBERT</h5>
      <p class="text-body-secondary small mt-1 mb-0">Bấm vào từng bình luận để AI phân tích chi tiết sắc thái ngôn ngữ (Tích cực/Tiêu cực).</p>
    </div>
    <div class="card-body p-0 mt-2">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-secondary">
            <tr>
              <th class="px-4 py-3" style="width: 25%">Khách hàng</th>
              <th class="py-3" style="width: 55%">Nội dung đánh giá</th>
              <th class="py-3 text-end px-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!dashboardData.reviews || dashboardData.reviews.length === 0">
              <td colspan="3" class="text-center py-5 text-body-secondary">Chưa có đánh giá nào.</td>
            </tr>
            <tr v-else v-for="r in dashboardData.reviews" :key="r.id" style="cursor: pointer;" @click="analyzeReview(r)" class="transition-hover">
              <td class="px-4 fw-semibold text-primary">
                {{ r.customer?.user?.lastName }} {{ r.customer?.user?.firstName }} <br>
                <span class="badge bg-warning text-dark mt-1 shadow-sm"><i class="fas fa-star me-1"></i>{{ r.rate }} Sao</span>
              </td>
              <td class="text-body-secondary">{{ r.description }}</td>
              <td class="text-end px-4">
                <button class="btn btn-sm btn-dark rounded-pill fw-bold shadow-sm">Phân tích AI <i class="fas fa-robot ms-1"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL AI -->
    <div v-if="showAiModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 bg-body-tertiary">
          <div class="modal-header bg-dark text-white border-0">
            <h5 class="modal-title fw-bold"><i class="fas fa-brain me-2 text-info"></i>Kết Quả AI PhoBERT Phân Tích</h5>
            <button type="button" class="btn-close btn-close-white" @click="showAiModal = false"></button>
          </div>
          <div class="modal-body p-4 bg-body">
            
            <div v-if="isAiProcessing" class="text-center py-5">
              <div class="spinner-grow text-info mb-3"></div>
              <h5 class="fw-bold text-body-emphasis">AI Đang Đọc Và Phân Tích...</h5>
              <p class="text-body-secondary small">Quá trình này có thể mất vài giây.</p>
            </div>
            
            <div v-else-if="aiResult" class="row g-4">
              <div class="col-12">
                <div class="p-3 bg-body-tertiary rounded-3 border border-secondary-subtle shadow-sm fst-italic text-body-emphasis">
                  "{{ aiResult.original_text }}"
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-0 shadow-sm h-100 text-center bg-body-tertiary">
                  <div class="card-body">
                    <h6 class="fw-bold text-body-secondary small">SẮC THÁI CHUNG</h6>
                    <h4 class="fw-bold mt-3 text-uppercase" :class="aiResult.overall_sentiment === 'positive' ? 'text-success' : (aiResult.overall_sentiment === 'negative' ? 'text-danger' : 'text-body-emphasis')">
                      {{ aiResult.overall_sentiment === 'positive' ? 'Tích Cực (Khen)' : (aiResult.overall_sentiment === 'negative' ? 'Tiêu Cực (Chê)' : 'Trung Lập') }}
                    </h4>
                  </div>
                </div>
              </div>
              <div class="col-md-8">
                <div class="card border-0 shadow-sm h-100 bg-body-tertiary">
                  <div class="card-body">
                    <h6 class="fw-bold text-body-secondary small mb-3">CHI TIẾT KHÍA CẠNH TỪNG DỊCH VỤ</h6>
                    <div v-for="(detail, idx) in aiResult.details" :key="idx" class="d-flex justify-content-between border-bottom border-secondary-subtle pb-2 mb-2">
                      <span class="fw-bold text-body-emphasis">{{ detail.aspect }}</span>
                      <span class="badge" :class="detail.sentiment === 'positive' ? 'bg-success' : (detail.sentiment === 'negative' ? 'bg-danger' : 'bg-secondary')">
                        {{ detail.sentiment === 'positive' ? 'Khen' : (detail.sentiment === 'negative' ? 'Chê' : 'Bình thường') }} 
                        ({{ (detail.confidence * 100).toFixed(1) }}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-5 text-danger fw-bold">
              <i class="fas fa-exclamation-triangle fa-2x mb-2"></i><br>
              Hệ thống AI hiện đang bận hoặc mất kết nối. Vui lòng thử lại sau.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../../utils/axios'

const dashboardData = ref({})
const showAiModal = ref(false)
const isAiProcessing = ref(false)
const aiResult = ref(null)

const fetchDashboard = async () => {
  try { 
    const res = await api.get('/api/manager/customer/dashboard')
    dashboardData.value = res.data 
  } catch (error) { console.error(error) }
}

const analyzeReview = async (review) => {
  showAiModal.value = true
  isAiProcessing.value = true
  aiResult.value = null
  try { 
    // GỌI THÔNG QUA JAVA (Bắc cầu) THAY VÌ GỌI THẲNG PYTHON
    const res = await api.post('/api/manager/customer/ai/analyze-single', { text: review.description })
    aiResult.value = res.data 
  } catch (error) { 
    console.error(error) 
  } finally { 
    isAiProcessing.value = false 
  }
}

onMounted(() => fetchDashboard())
</script>

<style scoped>
.transition-hover {
  transition: all 0.2s;
}
/* Sửa lỗi hover nền tối */
[data-bs-theme="dark"] .transition-hover:hover {
  background-color: var(--bs-secondary-bg) !important;
}
</style>