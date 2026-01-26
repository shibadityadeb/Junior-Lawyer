import { useState, useRef, useEffect, useContext } from 'react'
import { ChatContext } from '@/context/ChatContext'
import { useSpeechToText } from '@/hooks/useSpeechToText'

/**
 * Chat Input Component with Voice Support
 * Allows users to type or speak their message
 */
export function ChatInput() {
  const { sendMessage, isLoading } = useContext(ChatContext)
  const [message, setMessage] = useState('')
  const [showVoiceError, setShowVoiceError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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

  // Update message input with transcript
  useEffect(() => {
    if (transcript) {
      setMessage((prev) => prev + transcript)
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

  const handleSend = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    // Stop listening if active
    if (isListening) {
      stopListening()
    }

    // Don't send empty messages
    if (!message.trim()) return

    // Don't send while loading
    if (isLoading) return

    // Send message
    sendMessage(message)
    setMessage('')

    // Focus input after sending
    inputRef.current?.focus()
  }

  const handleMicClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('[ChatInput.handleMicClick] Clicked. isListening:', isListening, 'isSupported:', isSTTSupported)
    
    // Prevent default button behavior
    e.preventDefault()
    e.stopPropagation()

    if (!isSTTSupported) {
      console.log('[ChatInput.handleMicClick] Voice not supported')
      setShowVoiceError(true)
      return
    }

    if (isListening) {
      console.log('[ChatInput.handleMicClick] Stopping')
      stopListening()
    } else {
      console.log('[ChatInput.handleMicClick] Starting')
      setShowVoiceError(false)
      startListening()
    }
  }

  const displayTranscript = interimTranscript || transcript

  return (
    <div className="flex flex-col space-y-2">
      {/* Voice Error Message */}
      {showVoiceError && sttError && (
        <div className="px-4 py-2 bg-red-900/20 border border-red-700/30 rounded text-xs text-red-300">
          {sttError}
        </div>
      )}

      {/* Listening Status */}
      {isListening && (
        <div className="px-4 py-2 bg-blue-900/20 border border-blue-700/30 rounded text-xs text-blue-300 flex items-center space-x-2">
          <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          <span>Listening... Click again or wait for silence to stop</span>
        </div>
      )}

      {/* Interim Transcript Display */}
      {displayTranscript && (
        <div className="px-4 py-2 bg-slate-700/30 border border-slate-600/30 rounded text-xs text-slate-300">
          {displayTranscript}
        </div>
      )}

      {/* Chat Input Form */}
      <form onSubmit={handleSend} className="flex items-center space-x-2 px-4 pb-4">
        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            // Send on Enter, unless Shift+Enter (for multiline)
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Type or click the mic to speak..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Chat message input"
        />

        {/* Microphone Button Container with Pulsing Ring */}
        <div className="relative">
          {/* Pulsing ring animation while listening */}
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-lg bg-red-600 opacity-20 animate-pulse"></div>
              <div className="absolute inset-0 rounded-lg border border-red-500 opacity-40 animate-pulse"></div>
            </>
          )}

          <button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading || !isSTTSupported}
            className={`relative p-3 rounded-lg transition-all ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/50'
                : isSTTSupported
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            title={isSTTSupported ? (isListening ? 'Listening… Click to stop' : 'Click to speak') : 'Voice not supported'}
          >
            {isListening ? (
              // Listening icon - animated square
              <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <rect x="5" y="5" width="10" height="10" />
              </svg>
            ) : (
              // Microphone icon
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 1C8.34 1 7 2.34 7 4v6c0 1.66 1.34 3 3 3s3-1.34 3-3V4c0-1.66-1.34-3-3-3zm5 9c0 2.76-2.24 5-5 5s-5-2.24-5-5H3c0 3.53 2.61 6.43 6 6.92V19h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="p-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          aria-label="Send message"
          title="Send message (Ctrl+Enter)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,3.50612381 C0.8376543,2.99147138 0.99,1.99915771 1.99915771,1.99915771 C2.6563168,1.99915771 3.50612381,2.44814095 3.50612381,3.03521743 L3.50612381,3.03521743 L14.856467,0.999157707 C15.1704046,0.999157707 15.3273735,0.8376543 15.3273735,0.8376543 C15.6412045,0.524716099 16.1558569,0.524716099 16.4697946,0.8376543 L19.1272231,3.50612381 C19.4411606,3.81926707 19.4411606,4.3339195 19.1272231,4.64706275 L16.4697946,7.3045913 C16.1558569,7.61773456 15.6412045,7.61773456 15.3273735,7.3045913 Z" />
          </svg>
        </button>
      </form>

      {/* Voice Not Supported Message */}
      {!isSTTSupported && (
        <div className="px-4 text-xs text-slate-400">
          💡 Voice input not supported in this browser. Please use text input instead.
        </div>
      )}
    </div>
  )
}

