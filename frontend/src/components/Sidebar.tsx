import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Plus, Search, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChat } from '@/context/ChatContext'

export function Sidebar() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const { conversations, activeConversationId, createNewChat, switchToChat } = useChat()

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
  }

  return (
    <div className="w-72 h-screen bg-gradient-to-b from-slate-950 to-slate-900 border-r border-slate-800 flex flex-col">
      {/* Top Section */}
      <div className="p-4 border-b border-slate-800">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AJ</span>
          </div>
          <span className="text-white font-semibold">AskJunior</span>
        </div>

        {/* New Chat Button */}
        <button 
          onClick={createNewChat}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2 flex items-center justify-center space-x-2 transition-colors mb-4"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">New Chat</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => switchToChat(conversation.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-colors mb-1 group",
                activeConversationId === conversation.id
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <div className="flex items-start space-x-3">
                <MessageCircle className="w-4 h-4 mt-0.5 text-slate-400 group-hover:text-slate-300" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{conversation.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatTimestamp(conversation.updatedAt)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'User'}
            </p>
            <p className="text-xs text-slate-400">Legal Assistant</p>
          </div>
        </div>
      </div>
    </div>
  )
}