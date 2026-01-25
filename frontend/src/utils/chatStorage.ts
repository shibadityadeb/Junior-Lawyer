/**
 * Chat Storage Utility
 * 
 * Handles user-scoped chat persistence with 10-day retention policy.
 * Automatically filters expired conversations on load.
 */

export interface StoredConversation {
  id: string
  title: string
  messages: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: number // milliseconds
  }>
  createdAt: number // milliseconds
  updatedAt: number // milliseconds
}

interface StorageData {
  conversations: StoredConversation[]
  activeConversationId: string | null
}

const RETENTION_DAYS = 10
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000

/**
 * Get storage key scoped to user
 */
export function getStorageKey(userId: string | null): string {
  if (!userId) return ''
  return `askjunior_conversations_${userId}`
}

/**
 * Load conversations from storage with retention filtering
 * - Filters out conversations older than 10 days
 * - Deletes expired conversations from storage
 * - Returns only valid conversations
 */
export function loadConversations(userId: string | null): StorageData {
  if (!userId) {
    return { conversations: [], activeConversationId: null }
  }

  const storageKey = getStorageKey(userId)
  const stored = localStorage.getItem(storageKey)

  if (!stored) {
    return { conversations: [], activeConversationId: null }
  }

  try {
    const data: StorageData = JSON.parse(stored)

    // Filter out expired conversations
    const now = Date.now()
    const validConversations = data.conversations.filter(conv => {
      const ageMs = now - conv.updatedAt
      return ageMs <= RETENTION_MS
    })

    // If conversations were removed, save the cleaned state
    if (validConversations.length < data.conversations.length) {
      const updatedData: StorageData = {
        conversations: validConversations,
        activeConversationId: validConversations.some(c => c.id === data.activeConversationId)
          ? data.activeConversationId
          : null
      }
      localStorage.setItem(storageKey, JSON.stringify(updatedData))
    }

    return {
      conversations: validConversations,
      activeConversationId: validConversations.some(c => c.id === data.activeConversationId)
        ? data.activeConversationId
        : null
    }
  } catch (error) {
    console.error('Failed to load conversations:', error)
    // Return empty state on corrupted storage
    return { conversations: [], activeConversationId: null }
  }
}

/**
 * Save conversations to storage
 * Only saves if user is authenticated
 */
export function saveConversations(
  userId: string | null,
  data: StorageData
): void {
  if (!userId) return

  const storageKey = getStorageKey(userId)
  try {
    localStorage.setItem(storageKey, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save conversations:', error)
  }
}

/**
 * Clear all conversations for a user from storage
 * Used on logout
 */
export function clearConversations(userId: string | null): void {
  if (!userId) return

  const storageKey = getStorageKey(userId)
  try {
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('Failed to clear conversations:', error)
  }
}

/**
 * Get formatted retention info for debugging
 */
export function getRetentionInfo(): string {
  return `Conversations older than ${RETENTION_DAYS} days are automatically removed`
}
