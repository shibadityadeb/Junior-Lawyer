import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 35000, // 35 seconds to allow Claude API time to respond
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add Clerk token
// Token will be added dynamically from components using the useAuth hook
apiClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clerk will handle redirect to auth
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// Export a function to add token to request headers
export const setAuthToken = (token: string) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common['Authorization']
  }
}

export default apiClient

// API endpoints
export const api = {
  ai: {
    chat: (message: string) => apiClient.post('/ai/chat', { message }),
    voice: (audioData: FormData) => apiClient.post('/ai/voice', audioData),
    document: (documentData: FormData) => apiClient.post('/ai/document', documentData),
  },
}