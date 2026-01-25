import { useEffect, useState, useRef } from 'react'

interface MetricProps {
  value: string
  label: string
  suffix?: string
}

function AnimatedMetric({ value, label, suffix = '' }: MetricProps) {
  const [displayValue, setDisplayValue] = useState('0')
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const numericValue = parseFloat(value.replace(/[^\d.]/g, ''))
    const duration = 2000
    const steps = 60
    const increment = numericValue / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      current += increment
      step++
      
      if (step >= steps) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        if (value.includes('.')) {
          setDisplayValue(current.toFixed(1) + suffix)
        } else {
          setDisplayValue(Math.floor(current).toString() + suffix)
        }
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, value, suffix])

  return (
    <div ref={ref}>
      <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent mb-2">
        {displayValue}
      </div>
      <div className="text-gray-300 font-medium">{label}</div>
    </div>
  )
}

export function MetricsSection() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <div className="text-5xl font-bold text-slate-900 mb-3">
              75%
            </div>
            <div className="text-slate-600 font-medium">Faster Legal Research</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-slate-900 mb-3">
              30s
            </div>
            <div className="text-slate-600 font-medium">Average Response Time</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-slate-900 mb-3">
              99.8%
            </div>
            <div className="text-slate-600 font-medium">Citation Accuracy</div>
          </div>
        </div>
      </div>
    </section>
  )
}