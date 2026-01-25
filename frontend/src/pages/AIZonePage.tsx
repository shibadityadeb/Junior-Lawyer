import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { MessageCircle, Plus, Mic, Send, Loader, FileText, X, Image, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api, setAuthToken } from '@/services/api'
import { Sidebar } from '@/components/Sidebar'
import { useChat } from '@/context/ChatContext'

type AIMode = 'chat' | 'research' | 'document'

export function AIZonePage() {
  const { getToken } = useAuth()
  const [activeMode, setActiveMode] = useState<AIMode>('chat')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<string[]>([])
  
  const { activeConversation, addMessage, createNewChat } = useChat()

  const modes = [
    {
      id: 'chat' as AIMode,
      name: 'Legal Chat',
      placeholder: 'Ask a legal question…'
    },
    {
      id: 'research' as AIMode,
      name: 'Legal Research',
      placeholder: 'Research a law, section, or case…'
    },
    {
      id: 'document' as AIMode,
      name: 'Document Analysis',
      placeholder: 'Upload a legal document and ask questions…'
    }
  ]

  const addFile = (fileName: string) => {
    if (attachedFiles.length < 2) {
      setAttachedFiles([...attachedFiles, fileName])
    }
  }

  const removeFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index))
  }

  // Create initial chat if none exists
  useEffect(() => {
    if (!activeConversation) {
      createNewChat()
    }
  }, [activeConversation, createNewChat])

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
      
      // Add assistant response
      const aiResponse = res.data.data?.aiResponse || res.data
      const responseContent = aiResponse?.summary || aiResponse?.message || 'Response received'
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
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
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
        <main className="flex-1 flex flex-col">
          <div className="max-w-3xl mx-auto w-full px-6 py-8 flex-1 flex flex-col">
            
            {/* Chat Area */}
            <div className="flex-1 mb-8">
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
                <div className="space-y-6">
                  {activeConversation.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                        message.role === 'user' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-slate-800 text-white'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 text-white rounded-2xl px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ChatGPT-Style Input Composer */}
            <div className="relative">
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
                          className="w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
                        >
                          <Mic className="w-4 h-4" />
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

        {/* Footer Disclaimer */}
        <footer className="border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
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