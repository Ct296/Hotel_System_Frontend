import axios from 'axios';

const api = axios.create({
    // Trỏ đến port 8080 của Spring Boot Backend
    baseURL: 'http://localhost:8080', 
    timeout: 10000, // Hủy request nếu quá 10 giây không có phản hồi
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor cho Request: Tự động gắn Token vào header trước khi gọi API
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho Response: Xử lý lỗi chung từ Backend trả về
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Logic xử lý khi token hết hạn hoặc chưa đăng nhập
            console.warn("Unauthorized! Redirecting to login...");
            
            // Bạn có thể mở comment dòng dưới khi đã cấu hình Vue Router
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;