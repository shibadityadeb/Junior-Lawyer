import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { getMermaidThemeConfig, type IncidentType } from '@/utils/flowchartThemes'

interface FlowchartRendererProps {
  mermaidCode: string
  themeType?: IncidentType
}

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#1e293b',
    primaryTextColor: '#f1f5f9',
    primaryBorderColor: '#475569',
    lineColor: '#64748b',
    secondBkgColor: '#334155',
    tertiaryColor: '#0f172a',
    tertiaryTextColor: '#f1f5f9',
    tertiaryBorderColor: '#475569',
    fontSize: '13px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }
})

export function FlowchartRenderer({ mermaidCode, themeType = 'general' }: FlowchartRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const renderMermaid = async () => {
      if (!containerRef.current || !mermaidCode) return

      try {
        setError(null)
        mermaid.contentLoaded()

        // Create a unique ID for the diagram
        const diagramId = `mermaid-${themeType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Add theme config to the flowchart definition
        const enhancedCode = getMermaidThemeConfig() + '\n' + mermaidCode

        // Render the diagram
        const { svg } = await mermaid.render(diagramId, enhancedCode)

        // Clear previous content and render new diagram
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError('Unable to render flowchart. The diagram format may be invalid.')
      }
    }

    renderMermaid()
  }, [mermaidCode, themeType])

  if (!mermaidCode || mermaidCode.trim().length === 0) {
    return null
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-red-950/20 border border-red-700/50 rounded-lg">
        <p className="text-xs text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full flex justify-center">
      <div
        ref={containerRef}
        className="flex justify-center overflow-x-auto max-w-full"
        style={{ minHeight: '300px' }}
      />
    </div>
  )
}
