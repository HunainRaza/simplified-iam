import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const client = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — automatically attaches JWT to every request
// Django equivalent: a custom requests.Session with auth headers
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — auto-logout on 401
// client.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       useAuthStore.getState().logout();
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   },
// );

// Response interceptor — auto-logout on 401
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // FIXED: Check if the failed request was the login attempt
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    // Only redirect to login if the 401 came from somewhere else (like a protected route)
    if (error.response?.status === 401 && !isLoginRequest) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default client;
