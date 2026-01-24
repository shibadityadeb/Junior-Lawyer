// Chat-related type definitions
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatRequest {
  message: string
  language?: string
  context?: string
}

export interface ChatResponse {
  id: string
  message: string
  timestamp: Date
}
