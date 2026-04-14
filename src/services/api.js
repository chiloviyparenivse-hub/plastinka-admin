import axios from 'axios';

const API_URL = 'https://plastinka-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Токен добавлен к запросу:', config.url);
  } else {
    console.log('⚠️ Нет токена для запроса:', config.url);
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ Ответ:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('❌ Ошибка 401 - токен недействителен');
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;