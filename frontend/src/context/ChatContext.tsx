import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { loadConversations, saveConversations, type StoredConversation } from '@/utils/chatStorage'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number // milliseconds since epoch
}

export type Conversation = StoredConversation

interface ChatContextType {
  conversations: Conversation[]
  activeConversationId: string | null
  activeConversation: Conversation | null
  createNewChat: () => void
  switchToChat: (conversationId: string) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  updateChatTitle: (conversationId: string, title: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export { ChatContext }

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { userId, isLoaded } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  // Load conversations from storage when userId changes or auth loads
  // With 10-day retention filtering
  useEffect(() => {
    // Only load when auth is fully loaded
    if (!isLoaded) return

    // Clear state if user logs out
    if (!userId) {
      setConversations([])
      setActiveConversationId(null)
      return
    }

    // Load conversations with retention filtering
    const data = loadConversations(userId)
    
    // Convert stored timestamps (milliseconds) back to numbers for state
    const restoredConversations = data.conversations.map((conv: any) => ({
      ...conv,
      createdAt: typeof conv.createdAt === 'number' ? conv.createdAt : new Date(conv.createdAt).getTime(),
      updatedAt: typeof conv.updatedAt === 'number' ? conv.updatedAt : new Date(conv.updatedAt).getTime(),
      messages: conv.messages.map((msg: any) => ({
        ...msg,
        timestamp: typeof msg.timestamp === 'number' ? msg.timestamp : new Date(msg.timestamp).getTime()
      }))
    }))
    
    setConversations(restoredConversations)
    setActiveConversationId(data.activeConversationId)
  }, [userId, isLoaded])

  // Save conversations to storage whenever they change
  // Only save if user is authenticated
  useEffect(() => {
    if (!userId || !isLoaded) return

    if (conversations.length > 0 || activeConversationId) {
      saveConversations(userId, {
        conversations,
        activeConversationId
      })
    }
  }, [conversations, activeConversationId, userId, isLoaded])

  const createNewChat = () => {
    console.log('[ChatContext.createNewChat] Creating new conversation')
    const now = Date.now()
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New chat',
      messages: [],
      createdAt: now,
      updatedAt: now
    }

    console.log('[ChatContext.createNewChat] New conversation created:', newConversation.id)
    setConversations(prev => [newConversation, ...prev])
    setActiveConversationId(newConversation.id)
    console.log('[ChatContext.createNewChat] Active conversation set to:', newConversation.id)
  }

  const switchToChat = (conversationId: string) => {
    setActiveConversationId(conversationId)
  }

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!activeConversationId) return

    const newMessage: Message = {
      id: generateId(),
      timestamp: Date.now(),
      ...message
    }

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversationId) {
        const updatedConv = {
          ...conv,
          messages: [...conv.messages, newMessage],
          updatedAt: Date.now() // Update the conversation's updatedAt timestamp
        }

        // Auto-generate title from first user message
        if (conv.title === 'New chat' && message.role === 'user' && conv.messages.length === 0) {
          const title = generateTitleFromMessage(message.content)
          updatedConv.title = title
        }

        return updatedConv
      }
      return conv
    }))
  }

  const updateChatTitle = (conversationId: string, title: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, title, updatedAt: Date.now() }
        : conv
    ))
  }

  const generateTitleFromMessage = (content: string): string => {
    const words = content.trim().split(' ')
    if (words.length <= 6) return content
    return words.slice(0, 6).join(' ') + '...'
  }

  const activeConversation = conversations.find(conv => conv.id === activeConversationId) || null

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversationId,
      activeConversation,
      createNewChat,
      switchToChat,
      addMessage,
      updateChatTitle
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}