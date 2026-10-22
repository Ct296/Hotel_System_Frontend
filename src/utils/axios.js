// src/utils/axios.js
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import router from '../router';

const api = axios.create({
    baseURL: 'http://localhost:8080', // Port mặc định của Spring Boot
    withCredentials: true // Cho phép gửi Session Cookie (dùng cho Chat AI)
});

// Request Interceptor: Tự động đính kèm JWT Token
api.interceptors.request.use(
    (config) => {
        // Lưu ý: Gọi useAuthStore() bên trong interceptor để tránh lỗi chưa khởi tạo Pinia
        const authStore = useAuthStore();
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý lỗi từ Backend
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Xử lý khi Token hết hạn hoặc sai Token (401)
            if (error.response.status === 401) {
                const authStore = useAuthStore();
                
                // Lấy role trước khi xóa để biết nên đá về trang login nào
                const isEmp = authStore.isEmployee; 
                
                authStore.clearAuth();
                
                // Đá văng ra trang đăng nhập tương ứng
                if (isEmp) {
                    router.push('/employee/login');
                } else {
                    router.push('/login');
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;