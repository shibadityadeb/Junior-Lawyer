import axios from 'axios'

// Get API base URL from environment
// VITE_API_BASE_URL must be set at build time or runtime
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// If not set via environment, use production default
if (!API_BASE_URL || API_BASE_URL === 'undefined') {
  // Production fallback to Render backend
  API_BASE_URL = 'https://junior-lawyer.onrender.com'
  console.warn('[API] Using fallback production URL:', API_BASE_URL)
}

// Validate that we have a valid URL
if (!API_BASE_URL || API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
  console.error('[API] Invalid API_BASE_URL:', API_BASE_URL)
  throw new Error(
    'Invalid API_BASE_URL configuration. ' +
    'Expected a valid production URL (e.g., https://junior-lawyer.onrender.com), ' +
    `got: ${API_BASE_URL}`
  )
}

console.log('[API] Initialized with base URL:', API_BASE_URL)

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
    console.log('[API] Request to:', config.url, 'with method:', config.method)
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor with detailed error logging
apiClient.interceptors.response.use(
  (response) => {
    console.log('[API] Response received from:', response.config.url, 'status:', response.status)
    return response
  },
  (error) => {
    console.error('[API] Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data
    })
    
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
    chat: (message: string, options?: { documentContext?: string; files?: File[] }) => {
      // If files are attached, send as multipart/form-data
      if (options?.files && options.files.length > 0) {
        const formData = new FormData()
        formData.append('message', message)
        options.files.forEach(file => {
          formData.append('files', file)
        })
        return apiClient.post('/ai/chat', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }
      
      // Otherwise send as JSON
      return apiClient.post('/ai/chat', { 
        message,
        documentContext: options?.documentContext || ''
      })
    },
    voice: (audioData: FormData) => apiClient.post('/ai/voice', audioData),
    document: (documentData: FormData) => apiClient.post('/ai/document', documentData),
  },
  documents: {
    extract: (files: FormData) => 
      apiClient.post('/documents/extract', files, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    validate: (files: FormData) =>
      apiClient.post('/documents/validate', files, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
  },
}