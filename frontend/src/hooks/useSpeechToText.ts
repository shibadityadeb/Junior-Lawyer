import { useState, useRef, useCallback, useEffect } from 'react'

interface UseSpeechToTextOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
}

interface UseSpeechToTextReturn {
  transcript: string
  interimTranscript: string
  isListening: boolean
  isSupported: boolean
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}): UseSpeechToTextReturn {
  const {
    language = 'en-IN',
    continuous = true,
    interimResults = true,
  } = options

  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  // Store recognition and settings in refs to persist across renders
  const recognitionRef = useRef<any>(null)
  const recognitionStartedRef = useRef(false)
  const settingsRef = useRef({ language, continuous, interimResults })

  // Initialize Speech Recognition API ONLY ONCE
  useEffect(() => {
    // Early exit if already initialized
    if (recognitionRef.current) {
      return
    }

    // Get the SpeechRecognition API with full browser compatibility
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition

    if (!SpeechRecognition) {
      console.warn('[useSpeechToText] Speech Recognition not supported')
      setIsSupported(false)
      return
    }

    console.log('[useSpeechToText] Initializing Speech Recognition API')
    setIsSupported(true)

    try {
      // Create recognition instance
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      // Apply settings
      recognition.continuous = settingsRef.current.continuous
      recognition.interimResults = settingsRef.current.interimResults
      recognition.language = settingsRef.current.language
      recognition.maxAlternatives = 1

      // Bind event handlers
      recognition.onstart = () => {
        console.log('[useSpeechToText] Recognition STARTED')
        recognitionStartedRef.current = true
        setIsListening(true)
        setError(null)
      }

      recognition.onresult = (event: any) => {
        console.log('[useSpeechToText] Got result event')
        let interimTrans = ''
        let finalTrans = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript

          if (event.results[i].isFinal) {
            finalTrans += transcript + ' '
          } else {
            interimTrans += transcript
          }
        }

        if (interimTrans) {
          setInterimTranscript(interimTrans)
        }

        if (finalTrans) {
          setTranscript((prev) => prev + finalTrans)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('[useSpeechToText] Recognition error:', event.error)

        let errorMessage = 'Speech Recognition Error'
        switch (event.error) {
          case 'network':
            errorMessage = 'Network error. Please check your connection.'
            break
          case 'audio':
            errorMessage = 'Audio input error. Check your microphone.'
            break
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Check browser permissions.'
            break
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.'
            break
          case 'service-not-allowed':
            errorMessage = 'Speech Recognition service not available.'
            break
          default:
            errorMessage = `Error: ${event.error}`
        }

        setError(errorMessage)
        recognitionStartedRef.current = false
        setIsListening(false)
      }

      recognition.onend = () => {
        console.log('[useSpeechToText] Recognition ENDED')
        recognitionStartedRef.current = false
        setIsListening(false)
      }

      console.log('[useSpeechToText] Recognition initialized successfully')
    } catch (err) {
      console.error('[useSpeechToText] Failed to initialize:', err)
      setIsSupported(false)
    }

    // Cleanup
    return () => {
      if (recognitionRef.current && recognitionStartedRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (err) {
          // Ignore
        }
      }
    }
  }, []) // Empty dependency - init ONLY ONCE

  const startListening = useCallback(() => {
    console.log('[useSpeechToText.startListening] Called')

    if (!recognitionRef.current) {
      console.error('[useSpeechToText.startListening] Recognition not initialized')
      setError('Speech Recognition not initialized')
      return
    }

    if (!isSupported) {
      console.error('[useSpeechToText.startListening] Not supported')
      setError('Speech Recognition not supported')
      return
    }

    if (recognitionStartedRef.current) {
      console.log('[useSpeechToText.startListening] Already listening')
      return
    }

    // Clear previous results
    setTranscript('')
    setInterimTranscript('')
    setError(null)

    try {
      console.log('[useSpeechToText.startListening] Calling recognition.start()')
      recognitionRef.current.start()
    } catch (err: any) {
      console.error('[useSpeechToText.startListening] Error:', err)
      setError(err.message || 'Failed to start listening')
    }
  }, [isSupported])

  const stopListening = useCallback(() => {
    console.log('[useSpeechToText.stopListening] Called')

    if (!recognitionRef.current) {
      console.log('[useSpeechToText.stopListening] No recognition instance')
      return
    }

    try {
      console.log('[useSpeechToText.stopListening] Calling recognition.stop()')
      recognitionRef.current.stop()
    } catch (err: any) {
      console.error('[useSpeechToText.stopListening] Error:', err)
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}
