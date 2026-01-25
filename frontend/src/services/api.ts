import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post('/auth/login', credentials),
    register: (userData: { email: string; password: string; name: string }) =>
      apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
  },
  news: {
    getAll: () => apiClient.get('/news'),
  },
  categories: {
    getAll: () => apiClient.get('/categories'),
  },
  sos: {
    getHelp: () => apiClient.get('/sos'),
  },
  ai: {
    chat: (message: string) => apiClient.post('/ai/chat', { message }),
    voice: (audioData: FormData) => apiClient.post('/ai/voice', audioData),
    document: (documentData: FormData) => apiClient.post('/ai/document', documentData),
  },
}