import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { MessageCircle, Plus, Loader, Send, Mic, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api, setAuthToken } from '@/services/api'
import { Sidebar } from '@/components/Sidebar'
import { ChatMessage } from '@/components/ChatMessage'
import { FilePreview } from '@/components/FilePreview'
import { useChat } from '@/context/ChatContext'
import { useSpeechToText } from '@/hooks/useSpeechToText'

export function AIZonePage() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [showVoiceError, setShowVoiceError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { activeConversation, addMessage, createNewChat } = useChat()

  // Speech-to-Text hook
  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported: isSTTSupported,
    error: sttError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechToText({
    language: 'en-IN',
    continuous: true,
    interimResults: true,
  })

  // Update input with transcript
  useEffect(() => {
    if (transcript) {
      setInput((prev) => prev + transcript)
      resetTranscript()
    }
  }, [transcript, resetTranscript])

  // Display STT errors
  useEffect(() => {
    if (sttError) {
      setShowVoiceError(true)
      const timer = setTimeout(() => setShowVoiceError(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [sttError])

  const handleMicClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('[AIZonePage.handleMicClick] Clicked. isListening:', isListening, 'isSupported:', isSTTSupported)
    
    e.preventDefault()
    e.stopPropagation()

    if (!isSTTSupported) {
      console.log('[AIZonePage.handleMicClick] Voice not supported')
      setShowVoiceError(true)
      return
    }

    if (isListening) {
      console.log('[AIZonePage.handleMicClick] Stopping')
      stopListening()
    } else {
      console.log('[AIZonePage.handleMicClick] Starting')
      setShowVoiceError(false)
      startListening()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        setError(`File type not supported: ${file.name}. Allowed: PDF, PNG, JPG, TXT, DOCX`)
        return false
      }
      if (file.size > maxSize) {
        setError(`File too large: ${file.name}. Max 10MB allowed`)
        return false
      }
      return true
    })

    const newFiles = [...uploadedFiles, ...validFiles].slice(0, 2) // Max 2 files
    setUploadedFiles(newFiles)
    e.target.value = '' // Reset input
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  const handleFilePickerClick = () => {
    fileInputRef.current?.click()
  }

  // Always create a new chat when the page loads
  useEffect(() => {
    console.log('[AIZonePage] useEffect: Creating new chat on mount')
    createNewChat()
  }, []) // Empty array - run only once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('[AIZonePage.handleSubmit] Validation check', { 
      inputLength: input.length,
      inputTrimmed: input.trim().length,
      hasActiveConversation: !!activeConversation,
      activeConversationId: activeConversation?.id
    })
    
    if (!input.trim()) {
      console.log('[AIZonePage.handleSubmit] Error: Empty input')
      setError('Please enter a message')
      return
    }
    
    if (!activeConversation) {
      console.log('[AIZonePage.handleSubmit] Error: No active conversation')
      setError('Please start a new conversation')
      return
    }

    const userMessage = input.trim()
    const filesToSend = uploadedFiles.length > 0 ? [...uploadedFiles] : []
    
    console.log('[AIZonePage.handleSubmit] Starting submit', { userMessage, filesCount: filesToSend.length })
    
    setInput('')
    setError(null)
    
    // Add user message immediately
    addMessage({
      role: 'user',
      content: userMessage
    })
    console.log('[AIZonePage.handleSubmit] User message added to chat')

    try {
      setLoading(true)
      
      // Get Clerk token and set it on API client
      const token = await getToken()
      if (token) {
        setAuthToken(token)
      }

      // Send message with files if available
      console.log('[AIZonePage.handleSubmit] Calling API with files:', filesToSend.length)
      const res = await api.ai.chat(userMessage, { files: filesToSend })
      console.log('[AIZonePage.handleSubmit] API response received:', res.data)
      
      // Extract the full AI response object (includes summary, steps, flowchart, etc.)
      const aiResponseData = res.data.data?.aiResponse || {}
      console.log('[AIZonePage.handleSubmit] Extracted AI response data:', aiResponseData)
      
      // Include user message for context-aware rendering (incident type detection)
      const enrichedResponseData = {
        ...aiResponseData,
        userMessage: userMessage,
        usedDocuments: filesToSend.length > 0
      }
      
      // Store the complete response as JSON string so ChatMessage can parse and render it
      const responseContent = JSON.stringify(enrichedResponseData)
      console.log('[AIZonePage.handleSubmit] Adding AI response message')
      
      addMessage({
        role: 'assistant',
        content: responseContent
      })
      console.log('[AIZonePage.handleSubmit] AI response message added')

      // Clear uploaded files only after successful submission
      setUploadedFiles([])
      
    } catch (err: any) {
      console.error('Error sending message:', err)
      
      // Handle rate limit error (429)
      if (err.response?.status === 429) {
        setError(err.response?.data?.message || 'Daily AI request limit reached. Try again after 24 hours.')
        setUploadedFiles([])
        return
      }
      
      // Handle 502 Bad Gateway (AI service issues)
      if (err.response?.status === 502) {
        setError(err.response?.data?.message || 'AI service is temporarily unavailable. Please try again in a moment.')
        return
      }

      // Handle 500 Internal Server Error
      if (err.response?.status === 500) {
        setError(err.response?.data?.message || 'Server error occurred. Please try again.')
        return
      }

      // Handle network errors
      if (err.message === 'Network Error' || !err.response) {
        setError('Network error: Unable to connect to AI service. Please check your connection and try again.')
      }
      // Handle CORS errors
      else if (err.message.includes('CORS')) {
        setError('Connection error: The AI service is not accessible. Please try again later.')
      }
      // Handle file-specific errors
      else if (filesToSend.length > 0) {
        setError(err.response?.data?.message || 'Failed to send documents. Please try again.')
        // Keep files in input so user can retry
        setUploadedFiles(filesToSend)
      } 
      // Handle other API errors
      else {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to send message'
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Back Button */}
        <div className="shrink-0 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-6 py-3 hover:bg-slate-900/50"
            title="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </button>
        </div>
        
        {/* Top Bar */}
        <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm shrink-0">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-white mb-1">
                AI Zone
              </h1>
              <p className="text-sm text-slate-400">
                Legal research and document analysis
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="max-w-3xl mx-auto w-full px-6 py-8 flex-1 flex flex-col overflow-hidden">
            
            {/* Chat Area - Scrollable */}
            <div className="flex-1 overflow-y-auto mb-8">
              {!activeConversation?.messages.length ? (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      How can I help with your legal questions?
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Start a conversation with your legal AI assistant
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeConversation.messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                    />
                  ))}
                  
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 text-white rounded-2xl px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Processing your question...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ChatGPT-Style Input Composer - Pinned at bottom */}
            <div className="relative mt-auto shrink-0">
              {/* Voice Error Message */}
              {showVoiceError && sttError && (
                <div className="px-4 py-2 mb-2 bg-red-900/20 border border-red-700/30 rounded text-xs text-red-300">
                  {sttError}
                </div>
              )}

              {/* Listening Status */}
              {isListening && (
                <div className="px-4 py-2 mb-2 bg-blue-900/20 border border-blue-700/30 rounded text-xs text-blue-300 flex items-center space-x-2">
                  <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  <span>Listening… Click mic again or wait for silence to stop</span>
                </div>
              )}

              {/* Interim Transcript Display */}
              {interimTranscript && (
                <div className="px-4 py-2 mb-2 bg-slate-700/30 border border-slate-600/30 rounded text-xs text-slate-300">
                  {interimTranscript}
                </div>
              )}

              {/* Main Input Panel */}
              <div className="relative">
                {/* Input Container */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg focus-within:border-orange-500 transition-all duration-200">
                  {/* File Preview - Inside Container */}
                  {uploadedFiles.length > 0 && (
                    <div className="px-4 pt-3 pb-2 border-b border-slate-700/50">
                      <FilePreview files={uploadedFiles} onRemove={handleRemoveFile} />
                    </div>
                  )}
                  
                  {/* Main Input Area */}
                  <form onSubmit={handleSubmit} className="relative">
                    <div className="flex items-end p-4 space-x-3">
                      {/* Left Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={handleFilePickerClick}
                          className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 border shadow-sm",
                            uploadedFiles.length > 0
                              ? "bg-orange-500 text-white border-orange-400 hover:bg-orange-600 hover:shadow-md hover:shadow-orange-500/20" 
                              : "text-slate-300 hover:text-white hover:bg-slate-700 border-slate-600 hover:border-slate-500"
                          )}
                          title="Attach files (PDF, images, documents)"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Center Textarea */}
                      <div className="flex-1 relative">
                        {/* Hidden file inputs */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.png,.jpg,.jpeg,.txt,.docx"
                          onChange={handleFileSelect}
                          style={{ display: 'none' }}
                        />
                        
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="AskJunior — your all-time legal assistant"
                          className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none resize-none min-h-[28px] max-h-[120px] text-[15px] leading-6"
                          rows={1}
                          disabled={loading}
                          style={{
                            height: 'auto',
                            minHeight: '28px'
                          }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement
                            target.style.height = 'auto'
                            target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSubmit(e)
                            }
                          }}
                        />
                      </div>

                      {/* Right Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={handleMicClick}
                          disabled={loading || !isSTTSupported}
                          className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                            isListening
                              ? "bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-700"
                              : isSTTSupported
                                ? "text-slate-400 hover:text-white hover:bg-slate-700"
                                : "text-slate-600 cursor-not-allowed"
                          )}
                          title={isSTTSupported ? (isListening ? 'Listening… Click to stop' : 'Click to speak') : 'Voice not supported'}
                        >
                          <Mic className={cn("w-5 h-5", isListening && "animate-pulse")} />
                        </button>
                        
                        <button
                          type="submit"
                          disabled={!input.trim() || loading}
                          className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm",
                            input.trim() && !loading
                              ? "bg-orange-500 hover:bg-orange-600 text-white hover:shadow-md hover:shadow-orange-500/30"
                              : "bg-slate-700 text-slate-400 cursor-not-allowed"
                          )}
                        >
                          {loading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-3 bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>

          </div>
        </main>

        {/* Footer Disclaimer - Pinned at bottom */}
        <footer className="border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-sm shrink-0">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <p className="text-xs text-slate-500 text-center">
              AI provides general legal information only. Not legal advice. Consult qualified legal professionals for specific matters.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}