<template>
  <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
    <div class="card-header bg-white border-0 pt-4 pb-3">
      <h5 class="fw-bold mb-0 text-dark"><i class="fas fa-comments text-success me-2"></i>Danh sách Đánh giá & AI PhoBERT</h5>
      <p class="text-muted small mt-1 mb-0">Bấm vào bình luận để AI phân tích sắc thái.</p>
    </div>
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr><th class="px-4 py-3" style="width: 20%">Khách hàng</th><th class="py-3" style="width: 60%">Nội dung</th><th class="py-3 text-end px-4">Thao tác</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in dashboardData.reviews" :key="r.id" style="cursor: pointer;" @click="analyzeReview(r)">
              <td class="px-4 fw-semibold text-primary">{{ r.customer?.user?.lastName }} {{ r.customer?.user?.firstName }} <br><span class="badge bg-warning text-dark"><i class="fas fa-star me-1"></i>{{ r.rate }} Sao</span></td>
              <td class="text-muted">{{ r.description }}</td>
              <td class="text-end px-4"><button class="btn btn-sm btn-dark rounded-pill fw-bold shadow-sm">Phân tích AI <i class="fas fa-robot ms-1"></i></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL AI -->
    <div v-if="showAiModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-dark text-white border-0"><h5 class="modal-title fw-bold"><i class="fas fa-brain me-2 text-info"></i>Kết Quả AI</h5><button type="button" class="btn-close btn-close-white" @click="showAiModal = false"></button></div>
          <div class="modal-body p-4 bg-light">
            <div v-if="isAiProcessing" class="text-center py-5"><div class="spinner-grow text-info mb-3"></div><h5 class="fw-bold">AI Đang Phân Tích...</h5></div>
            <div v-else-if="aiResult" class="row g-4">
              <div class="col-12"><div class="p-3 bg-white rounded-3 border shadow-sm fst-italic">"{{ aiResult.original_text }}"</div></div>
              <div class="col-md-4"><div class="card border-0 shadow-sm h-100 text-center"><div class="card-body"><h6 class="fw-bold text-muted small">SẮC THÁI CHUNG</h6><h4 class="fw-bold mt-3 text-uppercase" :class="aiResult.overall_sentiment === 'positive' ? 'text-success' : (aiResult.overall_sentiment === 'negative' ? 'text-danger' : 'text-secondary')">{{ aiResult.overall_sentiment }}</h4></div></div></div>
              <div class="col-md-8"><div class="card border-0 shadow-sm h-100"><div class="card-body"><h6 class="fw-bold text-muted small mb-3">CHI TIẾT KHÍA CẠNH</h6><div v-for="(detail, idx) in aiResult.details" :key="idx" class="d-flex justify-content-between border-bottom pb-2 mb-2"><span class="fw-bold">{{ detail.aspect }}</span><span class="badge bg-primary">{{ (detail.confidence * 100).toFixed(1) }}%</span></div></div></div></div>
            </div>
            <div v-else class="text-center py-5 text-danger fw-bold"><i class="fas fa-exclamation-triangle fa-2x mb-2"></i><br>Lỗi kết nối tới Server AI. (Port 8000)</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../../utils/axios'`

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