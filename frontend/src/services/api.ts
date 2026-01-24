import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Placeholder API service methods
export const chatAPI = {
  sendMessage: (message: string, language?: string) => {
    // TODO: Implement chat message sending
    return Promise.resolve({ message })
  },
  
  uploadDocument: (file: File) => {
    // TODO: Implement document upload
    return Promise.resolve({ success: true })
  },
}

export default apiClient
