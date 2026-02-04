import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
});

// Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Global Error Handling (Catch 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Unauthorized - Clear token and redirect to login
            localStorage.removeItem('token');
            // We can't use useNavigate here as it's not a component, 
            // but we can use window.location
            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const dashboardService = {
    getStudentData: () => api.get('/api/students/dashboard'),
    getFacultyData: () => api.get('/api/dashboard/faculty'),
    getAdminData: () => api.get('/api/dashboard/admin'),
};

export const facultyService = {
    markAttendance: (payload) => api.post('/api/faculty/attendance/mark', payload),
    getCourseStudents: (courseId) => api.get(`/api/courses/${courseId}/students`),
};

export default api;
