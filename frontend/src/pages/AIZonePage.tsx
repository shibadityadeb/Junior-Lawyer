import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { MessageCircle, Plus, Loader, Send, FileText, X, Image, Paperclip, Mic, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api, setAuthToken } from '@/services/api'
import { Sidebar } from '@/components/Sidebar'
import { ChatMessage } from '@/components/ChatMessage'
import { useChat } from '@/context/ChatContext'
import { useSpeechToText } from '@/hooks/useSpeechToText'

export function AIZonePage() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<string[]>([])
  const [showVoiceError, setShowVoiceError] = useState(false)
  
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

  const addFile = (fileName: string) => {
    if (attachedFiles.length < 2) {
      setAttachedFiles([...attachedFiles, fileName])
    }
  }

  const removeFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index))
  }

  // Always create a new chat when the page loads
  useEffect(() => {
    createNewChat()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || !activeConversation) {
      setError('Please enter a message')
      return
    }

    const userMessage = input.trim()
    setInput('')
    setError(null)
    
    // Add user message immediately
    addMessage({
      role: 'user',
      content: userMessage
    })

    try {
      setLoading(true)
      
      // Get Clerk token and set it on API client
      const token = await getToken()
      if (token) {
        setAuthToken(token)
      }

      // Call API
      const res = await api.ai.chat(userMessage)
      
      // Extract the full AI response object (includes summary, steps, flowchart, etc.)
      const aiResponseData = res.data.data?.aiResponse || {}
      
      // Include user message for context-aware rendering (incident type detection)
      const enrichedResponseData = {
        ...aiResponseData,
        userMessage: userMessage
      }
      
      // Store the complete response as JSON string so ChatMessage can parse and render it
      const responseContent = JSON.stringify(enrichedResponseData)
      
      addMessage({
        role: 'assistant',
        content: responseContent
      })
      
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.response?.data?.message || 'Failed to send message')
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
                  {/* Main Input Area */}
                  <form onSubmit={handleSubmit} className="relative">
                    <div className="flex items-end p-3 space-x-3">
                      {/* Left Controls */}
                      <div className="relative flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowSidebar(!showSidebar)}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors border",
                            showSidebar 
                              ? "bg-orange-500 text-white border-orange-500" 
                              : "text-slate-300 hover:text-white hover:bg-slate-700 border-slate-600"
                          )}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        
                        {/* Attachment Popover Menu */}
                        {showSidebar && (
                          <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-700 border border-slate-600 rounded-xl shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                            <div className="p-2">
                              <button
                                onClick={() => {
                                  addFile(`Photo_${Date.now()}.jpg`)
                                  setShowSidebar(false)
                                }}
                                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-600 transition-colors text-left"
                                role="menuitem"
                              >
                                <Image className="w-5 h-5 text-slate-400" />
                                <span className="text-sm font-medium text-white">Add photos & files</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  addFile(`Document_${Date.now()}.pdf`)
                                  setShowSidebar(false)
                                }}
                                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-600 transition-colors text-left"
                                role="menuitem"
                              >
                                <FileText className="w-5 h-5 text-slate-400" />
                                <span className="text-sm font-medium text-white">Add documents</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  addFile(`Image_${Date.now()}.png`)
                                  setShowSidebar(false)
                                }}
                                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-600 transition-colors text-left"
                                role="menuitem"
                              >
                                <Paperclip className="w-5 h-5 text-slate-400" />
                                <span className="text-sm font-medium text-white">Add images</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Center Textarea */}
                      <div className="flex-1 relative">
                        {/* Attached Files Preview */}
                        {attachedFiles.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {attachedFiles.map((file, index) => (
                              <div key={index} className="inline-flex items-center bg-slate-700 rounded-full px-2 py-1 text-xs text-slate-300">
                                <FileText className="w-3 h-3 mr-1" />
                                <span className="truncate max-w-20">{file.split('.')[0]}</span>
                                <button
                                  onClick={() => removeFile(index)}
                                  className="ml-1 text-slate-400 hover:text-red-400"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="AskJunior — your all-time legal assistant"
                          className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none resize-none min-h-[24px] max-h-[120px] text-sm leading-6"
                          rows={1}
                          disabled={loading}
                          style={{
                            height: 'auto',
                            minHeight: '24px'
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
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            isListening
                              ? "bg-red-600 text-white"
                              : isSTTSupported
                                ? "text-slate-400 hover:text-white hover:bg-slate-700"
                                : "text-slate-600 cursor-not-allowed"
                          )}
                          title={isSTTSupported ? (isListening ? 'Listening… Click to stop' : 'Click to speak') : 'Voice not supported'}
                        >
                          <Mic className={cn("w-4 h-4", isListening && "animate-pulse")} />
                        </button>
                        
                        <button
                          type="submit"
                          disabled={!input.trim() || loading}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            input.trim() && !loading
                              ? "bg-orange-500 hover:bg-orange-600 text-white"
                              : "bg-slate-600 text-slate-400 cursor-not-allowed"
                          )}
                        >
                          {loading ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
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