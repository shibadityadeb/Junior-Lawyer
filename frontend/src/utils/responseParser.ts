/**
 * Response Parser Utility
 * 
 * Parses AI response text into logical blocks for sequential reveal animation.
 * Blocks include headings, paragraphs, bullet lists, and numbered steps.
 */

export type BlockType = 'heading' | 'paragraph' | 'bullet-list' | 'numbered-list' | 'divider'

export interface Block {
  type: BlockType
  content: string | string[] // string for heading/paragraph, array for lists
  level?: number // heading level
}

/**
 * Parse response text into logical blocks
 * Respects markdown-like structure and natural paragraph breaks
 */
export function parseResponseIntoBlocks(text: string): Block[] {
  const blocks: Block[] = []
  const lines = text.split('\n')
  
  let i = 0
  
  while (i < lines.length) {
    const line = lines[i]
    
    // Skip empty lines
    if (!line.trim()) {
      i++
      continue
    }
    
    // Heading detection (## or bold uppercase or "Step X:")
    if (line.trim().startsWith('##')) {
      blocks.push({
        type: 'heading',
        content: line.replace(/^#+\s*/, '').trim(),
        level: 2,
      })
      i++
    } else if (line.trim().match(/^(Step \d+:|[A-Z][A-Z\s]+:)/)) {
      // Numbered step or colon-prefixed heading
      blocks.push({
        type: 'heading',
        content: line.trim(),
        level: 3,
      })
      i++
    } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
      // Bullet list
      const bulletItems: string[] = []
      while (i < lines.length && (lines[i].trim().startsWith('-') || lines[i].trim().startsWith('•'))) {
        bulletItems.push(lines[i].replace(/^[-•]\s*/, '').trim())
        i++
      }
      if (bulletItems.length > 0) {
        blocks.push({
          type: 'bullet-list',
          content: bulletItems,
        })
      }
    } else if (line.trim().match(/^\d+\./)) {
      // Numbered list
      const numberedItems: string[] = []
      while (i < lines.length && lines[i].trim().match(/^\d+\./)) {
        numberedItems.push(lines[i].replace(/^\d+\.\s*/, '').trim())
        i++
      }
      if (numberedItems.length > 0) {
        blocks.push({
          type: 'numbered-list',
          content: numberedItems,
        })
      }
    } else {
      // Regular paragraph
      let paragraph = line.trim()
      i++
      
      // Combine lines until we hit an empty line or special marker
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].trim().startsWith('##') &&
        !lines[i].trim().startsWith('-') &&
        !lines[i].trim().startsWith('•') &&
        !lines[i].trim().match(/^\d+\./) &&
        !lines[i].trim().match(/^(Step \d+:|[A-Z][A-Z\s]+:)/)
      ) {
        paragraph += ' ' + lines[i].trim()
        i++
      }
      
      if (paragraph) {
        blocks.push({
          type: 'paragraph',
          content: paragraph,
        })
      }
    }
  }
  
  return blocks
}

/**
 * Convert blocks back to structured JSX-renderable format
 * Used by ChatMessage component for rendering
 */
export function blocksToSections(blocks: Block[]) {
  return blocks.map((block, idx) => ({
    id: `block-${idx}`,
    ...block,
  }))
}
