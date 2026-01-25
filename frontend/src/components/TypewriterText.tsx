import { useEffect, useState, useRef } from 'react'

interface TypewriterTextProps {
  text: string
  speed?: number // milliseconds per character
  startDelay?: number // milliseconds before typing starts
  onComplete?: () => void
  className?: string
  disabled?: boolean
}

/**
 * TypewriterText Component
 * 
 * Progressively reveals text character-by-character
 * with a smooth typing effect, similar to ChatGPT.
 * 
 * Respects prefers-reduced-motion for accessibility.
 * Prevents re-typing on re-renders.
 */
export function TypewriterText({
  text,
  speed = 25,
  startDelay = 350,
  onComplete,
  className = '',
  disabled = false
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState<string>('')
  const [isComplete, setIsComplete] = useState<boolean>(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const prefersReducedMotion = useRef<boolean>(false)

  // Check for reduced motion preference on mount
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Main typing effect logic
  useEffect(() => {
    // If disabled or no text, show everything immediately
    if (disabled || !text) {
      setDisplayedText(text)
      setIsComplete(true)
      onComplete?.()
      return
    }

    // If reduced motion is preferred, show all text immediately
    if (prefersReducedMotion.current) {
      setDisplayedText(text)
      setIsComplete(true)
      onComplete?.()
      return
    }

    // Only initialize typing once
    if (startTimeRef.current !== null) {
      return
    }

    // Start typing after delay
    const startTimer = setTimeout(() => {
      startTimeRef.current = Date.now()
      let charIndex = 0

      const type = () => {
        if (charIndex <= text.length) {
          setDisplayedText(text.substring(0, charIndex))
          charIndex++

          // Calculate adaptive speed to keep consistent overall timing
          timerRef.current = setTimeout(type, speed)
        } else {
          // Typing complete
          setIsComplete(true)
          onComplete?.()
        }
      }

      type()
    }, startDelay)

    // Cleanup function
    return () => {
      clearTimeout(startTimer)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [text, speed, startDelay, disabled, onComplete])

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && !disabled && !prefersReducedMotion.current && (
        <span className="animate-pulse text-slate-300 ml-0.5">│</span>
      )}
    </span>
  )
}

