import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000'
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const oldToken = localStorage.getItem('token');
                const response = await axios.post('http://localhost:5000/api/refresh-token', {
                    token: oldToken
                });
                const newToken = response.data.token;
                
                localStorage.setItem('token', newToken);
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                
                return axios(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('token');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance; 