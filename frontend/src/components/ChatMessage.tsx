import { useState, useEffect, useRef } from 'react'
import { FlowchartRenderer } from './FlowchartRenderer'
import { detectIncidentType, getThemeByIncidentType, type IncidentType } from '@/utils/flowchartThemes'
import { parseResponseIntoBlocks, Block } from '@/utils/responseParser'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'

export interface AIResponseData {
  matterSummary?: string
  incidentType?: IncidentType
  clarifyingQuestions?: string[]
  conditionalGuidance?: string
  legalPathways?: string[]
  flowchart?: string
  disclaimer?: string
  userMessage?: string
  // Legacy fields for backward compatibility
  summary?: string
  steps?: string[]
  legal_references?: string[]
  immediateOptions?: string[]
}

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system'
  content: string
  aiResponseData?: AIResponseData
}

/**
 * Parse AI response string to extract structured data
 * Backend sends: { matterSummary, incidentType, clarifyingQuestions, conditionalGuidance, legalPathways, flowchart, disclaimer }
 * Also supports legacy format: { summary, steps, legal_references, flowchart, disclaimer }
 */
function parseAIResponse(content: string): AIResponseData | null {
  try {
    // Try to parse as JSON if it looks like JSON
    if (content.trim().startsWith('{')) {
      const parsed = JSON.parse(content)
      
      // Check for new format (two-phase lawyer-like model)
      if (
        parsed.matterSummary &&
        parsed.incidentType &&
        Array.isArray(parsed.clarifyingQuestions) &&
        parsed.conditionalGuidance &&
        Array.isArray(parsed.legalPathways) &&
        parsed.flowchart &&
        parsed.disclaimer
      ) {
        return parsed
      }
      
      // Fallback: Check for legacy format
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
 * Supports both new two-phase lawyer-like model and legacy format
 */
function AIResponseRenderer({ data }: { data: AIResponseData }) {
  const [visibleBlockIndex, setVisibleBlockIndex] = useState(-1)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prefersReducedMotion = useRef(false)

  // Text-to-Speech hook
  const { isSpeaking, isSupported: isTTSSupported, speak, stop } = useTextToSpeech({
    language: 'en-IN',
  })

  // Use incident type from response if available (new format), else detect from user message
  const incidentType: IncidentType = data.incidentType ? (data.incidentType as IncidentType) : (data.userMessage ? detectIncidentType(data.userMessage) : 'general')
  const theme = getThemeByIncidentType(incidentType)

  // Build combined text content to parse into blocks
  // Support both new two-phase format and legacy format
  const combinedText = [
    // New format: "Understanding Your Situation" heading
    data.matterSummary ? '## Understanding Your Situation' : '',
    data.matterSummary ? data.matterSummary : '',
    
    // Clarifying Questions (new format - Phase 1)
    data.clarifyingQuestions && data.clarifyingQuestions.length > 0
      ? `## Questions to Better Understand Your Situation\n${data.clarifyingQuestions.map(q => `- ${q}`).join('\n')}`
      : '',
    
    // Conditional Guidance (new format - Phase 2)
    data.conditionalGuidance 
      ? `## Legal Guidance\n${data.conditionalGuidance}`
      : '',
    
    // Legal Pathways (new format)
    data.legalPathways && data.legalPathways.length > 0
      ? `## Your Possible Next Steps\n${data.legalPathways.map(p => `- ${p}`).join('\n')}`
      : '',
    
    // Legacy format fallback
    !data.matterSummary && theme?.title ? theme.title : '',
    !data.matterSummary && theme?.empathyOpener ? theme.empathyOpener : '',
    data.summary && !data.matterSummary ? data.summary : '',
    theme?.immediateOptions && Array.isArray(theme.immediateOptions) && theme.immediateOptions.length > 0 && !data.matterSummary
      ? `## Your Immediate Options\n${theme.immediateOptions.map(o => `- ${o}`).join('\n')}`
      : '',
    data.steps && data.steps.length > 0 && !data.conditionalGuidance
      ? `## What Typically Happens Next\n${data.steps.map((s, i) => `${i + 1}. ${s.replace(/^Step \d+:\s*/, '')}`).join('\n')}`
      : '',
    data.legal_references && data.legal_references.length > 0
      ? `## Relevant Legal Provisions\n${data.legal_references.map(r => `- ${r}`).join('\n')}`
      : '',
    theme?.clarifyingQuestions && Array.isArray(theme.clarifyingQuestions) && theme.clarifyingQuestions.length > 0 && !data.clarifyingQuestions
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

  const handleReadAloud = () => {
    if (isSpeaking) {
      stop()
    } else {
      // Extract plain text from combined text (remove markdown)
      const plainText = combinedText
        .replace(/#{1,6}\s+/g, '') // Remove headings
        .replace(/[*\-]\s+/g, '') // Remove bullets
        .replace(/\n/g, ' ') // Remove newlines
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim()

      if (plainText) {
        speak(plainText)
      }
    }
  }

  return (
    <div className="w-full space-y-0 text-slate-200">
      {/* Read Aloud Button - Top Right */}
      {isTTSSupported && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleReadAloud}
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded text-xs font-medium transition-colors ${
              isSpeaking
                ? 'bg-orange-600/20 border border-orange-500/50 text-orange-300 hover:bg-orange-600/30'
                : 'bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            aria-label={isSpeaking ? 'Stop reading' : 'Read response aloud'}
            title={isSpeaking ? 'Stop reading aloud' : 'Read response aloud'}
          >
            {isSpeaking ? (
              <>
                <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                <span>Pause</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.172a1 1 0 011.414 0A6.972 6.972 0 0118 10a6.972 6.972 0 01-1.929 4.928 1 1 0 01-1.414-1.414A4.972 4.972 0 0016 10c0-1.713-.672-3.259-1.757-4.364a1 1 0 010-1.414z" />
                </svg>
                <span>Read aloud</span>
              </>
            )}
          </button>
        </div>
      )}

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
            {data.matterSummary ? `${incidentType === 'general' ? 'Your' : theme?.name || 'Legal'} Decision Path` : (incidentType === 'general' ? 'Process Flowchart' : `${theme?.name || 'Legal'} Process`)}
          </h4>
          <div className="w-full bg-slate-950/60 rounded-lg p-4 border border-slate-700/50 overflow-x-auto">
            <FlowchartRenderer 
              mermaidCode={data.flowchart}
              themeType={incidentType as IncidentType}
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

  // System messages (document confirmations, status updates)
  if (role === 'system') {
    return (
      <div className="flex justify-center mb-4">
        <div className="max-w-2xl bg-slate-700/40 border border-slate-600/50 text-slate-300 rounded-lg px-4 py-2 shadow-sm">
          <p className="text-xs leading-relaxed whitespace-pre-wrap font-medium">{content}</p>
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
