import { useState, useRef, useCallback, useEffect } from 'react'

interface UseTextToSpeechOptions {
  language?: string
  rate?: number
  pitch?: number
  volume?: number
}

interface UseTextToSpeechReturn {
  isSpeaking: boolean
  isSupported: boolean
  error: string | null
  speak: (text: string) => void
  stop: () => void
  pause: () => void
  resume: () => void
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}): UseTextToSpeechReturn {
  const {
    language = 'en-IN',
    rate = 1,
    pitch = 1,
    volume = 1,
  } = options

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Initialize Speech Synthesis API
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false)
      setError('Text-to-Speech not supported in this browser')
      return
    }

    synthRef.current = window.speechSynthesis
    setIsSupported(true)

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !synthRef.current) {
        setError('Text-to-Speech not available')
        return
      }

      if (!text || text.trim().length === 0) {
        setError('No text to speak')
        return
      }

      // Cancel any existing speech
      if (synthRef.current.speaking) {
        synthRef.current.cancel()
      }

      setError(null)

      try {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = language
        utterance.rate = rate
        utterance.pitch = pitch
        utterance.volume = volume

        utterance.onstart = () => {
          setIsSpeaking(true)
        }

        utterance.onend = () => {
          setIsSpeaking(false)
        }

        utterance.onerror = (event: any) => {
          let errorMessage = 'Text-to-Speech Error'

          switch (event.error) {
            case 'network':
              errorMessage = 'Network error during speech synthesis'
              break
            case 'synthesis-unavailable':
              errorMessage = 'Speech synthesis not available'
              break
            case 'synthesis-failed':
              errorMessage = 'Failed to synthesize speech'
              break
            case 'invalid-argument':
              errorMessage = 'Invalid arguments for speech synthesis'
              break
            default:
              errorMessage = `Speech synthesis error: ${event.error}`
          }

          setError(errorMessage)
          setIsSpeaking(false)
        }

        utteranceRef.current = utterance
        synthRef.current.speak(utterance)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        setIsSpeaking(false)
      }
    },
    [isSupported, language, rate, pitch, volume]
  )

  const stop = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }, [])

  const pause = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking && !synthRef.current.paused) {
      synthRef.current.pause()
    }
  }, [])

  const resume = useCallback(() => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume()
    }
  }, [])

  return {
    isSpeaking,
    isSupported,
    error,
    speak,
    stop,
    pause,
    resume,
  }
}
