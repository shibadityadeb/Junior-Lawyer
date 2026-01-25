import { useState, useEffect, useRef } from 'react'
import { FlowchartRenderer } from './FlowchartRenderer'
import { detectIncidentType, getThemeByIncidentType } from '@/utils/flowchartThemes'
import { parseResponseIntoBlocks, Block } from '@/utils/responseParser'

export interface AIResponseData {
  summary: string
  steps: string[]
  legal_references: string[]
  flowchart: string
  disclaimer: string
  userMessage?: string
  clarifyingQuestions?: string[]
  immediateOptions?: string[]
}

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  aiResponseData?: AIResponseData
}

/**
 * Parse AI response string to extract structured data
 * Backend sends: { summary, steps, legal_references, flowchart, disclaimer }
 */
function parseAIResponse(content: string): AIResponseData | null {
  try {
    // Try to parse as JSON if it looks like JSON
    if (content.trim().startsWith('{')) {
      const parsed = JSON.parse(content)
      // Ensure all required fields exist
      if (
        parsed.summary &&
        Array.isArray(parsed.steps) &&
        Array.isArray(parsed.legal_references) &&
        parsed.flowchart &&
        parsed.disclaimer
      ) {
        return parsed
      }
    }
  } catch {
    // Not JSON, fallback to plain text
  }
  return null
}

/**
 * Individual block renderer with reveal animation
 */
function BlockRenderer({ 
  block, 
  isVisible, 
  index 
}: { 
  block: Block
  isVisible: boolean
  index: number
}) {
  const animationDelay = `${index * 120}ms`
  const style = isVisible 
    ? { animation: `blockReveal 150ms ease-out forwards ${animationDelay}` }
    : { opacity: 0 }

  if (block.type === 'heading') {
    return (
      <h3 
        className="text-base font-semibold text-white mt-4 mb-3 first:mt-0"
        style={style}
      >
        {block.content}
      </h3>
    )
  }

  if (block.type === 'paragraph') {
    return (
      <p 
        className="text-sm leading-relaxed text-slate-300 mb-4"
        style={style}
      >
        {block.content}
      </p>
    )
  }

  if (block.type === 'bullet-list' && Array.isArray(block.content)) {
    return (
      <ul 
        className="space-y-2 ml-4 mb-4"
        style={style}
      >
        {block.content.map((item, idx) => (
          <li key={idx} className="text-sm text-slate-300 flex items-start">
            <span className="text-orange-400 font-semibold mr-3">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )
  }

  if (block.type === 'numbered-list' && Array.isArray(block.content)) {
    return (
      <ol 
        className="space-y-3 ml-4 mb-4"
        style={style}
      >
        {block.content.map((item, idx) => (
          <li key={idx} className="text-sm text-slate-300 leading-relaxed">
            <span className="font-semibold text-orange-400">
              Step {idx + 1}:{' '}
            </span>
            {item.replace(/^Step \d+:\s*/, '')}
          </li>
        ))}
      </ol>
    )
  }

  return null
}

/**
 * Enhanced AI Response Renderer with line-by-line reveal animation
 */
function AIResponseRenderer({ data }: { data: AIResponseData }) {
  const [visibleBlockIndex, setVisibleBlockIndex] = useState(-1)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prefersReducedMotion = useRef(false)

  // Detect incident type from user message for enhanced rendering
  const incidentType = data.userMessage ? detectIncidentType(data.userMessage) : 'general'
  const theme = getThemeByIncidentType(incidentType)

  // Build combined text content to parse into blocks
  const combinedText = [
    theme.title,
    theme.empathyOpener,
    data.summary,
    theme.immediateOptions && theme.immediateOptions.length > 0 
      ? `## Your Immediate Options\n${theme.immediateOptions.map(o => `- ${o}`).join('\n')}`
      : '',
    data.steps && data.steps.length > 0
      ? `## What Typically Happens Next\n${data.steps.map((s, i) => `${i + 1}. ${s.replace(/^Step \d+:\s*/, '')}`).join('\n')}`
      : '',
    data.legal_references && data.legal_references.length > 0
      ? `## Relevant Legal Provisions\n${data.legal_references.map(r => `- ${r}`).join('\n')}`
      : '',
    theme.clarifyingQuestions && theme.clarifyingQuestions.length > 0
      ? `## To Give You Better Guidance\n${theme.clarifyingQuestions.map(q => `- ${q}`).join('\n')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  // Parse into blocks
  const blocks = parseResponseIntoBlocks(combinedText)

  // Check for reduced motion preference
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Animate block reveal
  useEffect(() => {
    // If reduced motion or no blocks, show all immediately
    if (prefersReducedMotion.current || blocks.length === 0) {
      setVisibleBlockIndex(blocks.length - 1)
      return
    }

    // Start revealing blocks with 120ms delay between each
    let currentIndex = -1
    const revealNext = () => {
      currentIndex++
      if (currentIndex < blocks.length) {
        setVisibleBlockIndex(currentIndex)
        timerRef.current = setTimeout(revealNext, 120)
      }
    }

    revealNext()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [blocks.length])

  return (
    <div className="w-full space-y-0 text-slate-200">
      {/* Render all blocks, controlling visibility via animation */}
      {blocks.map((block, idx) => (
        <BlockRenderer
          key={idx}
          block={block}
          isVisible={idx <= visibleBlockIndex}
          index={idx}
        />
      ))}

      {/* Flowchart - Renders immediately (no animation, no delay) */}
      {data.flowchart && (
        <div className="mt-6">
          <h4 
            className="text-sm font-semibold text-white mb-3 uppercase tracking-wide"
            style={{ 
              animation: 'blockReveal 150ms ease-out forwards',
              animationDelay: `${blocks.length * 120}ms`
            }}
          >
            {incidentType === 'general' ? 'Process Flowchart' : `${theme.name} Process`}
          </h4>
          <div className="w-full bg-slate-950/60 rounded-lg p-4 border border-slate-700/50 overflow-x-auto">
            <FlowchartRenderer 
              mermaidCode={data.flowchart}
              themeType={incidentType}
            />
          </div>
        </div>
      )}

      {/* Legal Disclaimer - Appears after all blocks */}
      {data.disclaimer && (
        <div 
          className="mt-6 p-3 bg-slate-800/40 border-l-4 border-orange-500/50 rounded text-xs text-slate-400"
          style={{
            animation: 'blockReveal 150ms ease-out forwards',
            animationDelay: `${(blocks.length + 1) * 120}ms`
          }}
        >
          <p className="italic">{data.disclaimer}</p>
        </div>
      )}
    </div>
  )
}

/**
 * Main ChatMessage Component
 * Renders user or assistant messages in ChatGPT-style containers
 */
export function ChatMessage({
  role,
  content,
  aiResponseData,
}: ChatMessageProps) {
  // Try to parse the content if it's an AI response and no explicit data provided
  let parsedData = aiResponseData
  if (role === 'assistant' && !aiResponseData) {
    parsedData = parseAIResponse(content) || undefined
  }

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl px-5 py-3 shadow-md">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    )
  }

  // Assistant message
  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-4xl bg-slate-800/60 border border-slate-700/50 text-white rounded-2xl px-6 py-5 shadow-lg">
        {parsedData ? (
          <AIResponseRenderer data={parsedData} />
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
            {content}
          </p>
        )}
      </div>
    </div>
  )
}
