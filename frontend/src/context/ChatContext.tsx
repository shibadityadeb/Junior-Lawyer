import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

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

const STORAGE_KEY = 'askjunior_conversations'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  // Load conversations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const restoredConversations = parsed.conversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }))
        setConversations(restoredConversations)
        setActiveConversationId(parsed.activeConversationId)
      } catch (error) {
        console.error('Failed to load conversations:', error)
      }
    }
  }, [])

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0 || activeConversationId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        conversations,
        activeConversationId
      }))
    }
  }, [conversations, activeConversationId])

  const createNewChat = () => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setConversations(prev => [newConversation, ...prev])
    setActiveConversationId(newConversation.id)
  }

  const switchToChat = (conversationId: string) => {
    setActiveConversationId(conversationId)
  }

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!activeConversationId) return

    const newMessage: Message = {
      id: generateId(),
      timestamp: new Date(),
      ...message
    }

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversationId) {
        const updatedConv = {
          ...conv,
          messages: [...conv.messages, newMessage],
          updatedAt: new Date()
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
        ? { ...conv, title, updatedAt: new Date() }
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