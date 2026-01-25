import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { MessageCircle, Search, FileText, Upload, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

type AIMode = 'chat' | 'research' | 'document'

export function AIZonePage() {
  const [activeMode, setActiveMode] = useState<AIMode>('chat')
  const [input, setInput] = useState('')

  const modes = [
    {
      id: 'chat' as AIMode,
      name: 'Legal Chat',
      icon: MessageCircle,
      placeholder: 'Ask a legal question…',
      description: 'Get answers to legal questions and general guidance'
    },
    {
      id: 'research' as AIMode,
      name: 'Legal Research',
      icon: Search,
      placeholder: 'Research a law, case, or concept…',
      description: 'Deep dive into legal precedents, statutes, and case law'
    },
    {
      id: 'document' as AIMode,
      name: 'Document Analysis',
      icon: FileText,
      placeholder: 'Upload a legal document to analyze…',
      description: 'Analyze contracts, judgments, and legal documents'
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement AI chat functionality
    console.log('Submitting:', { mode: activeMode, input })
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              AI Zone
            </h1>
            <p className="text-xl text-slate-300">
              Legal assistance, research, and document analysis powered by AI
            </p>
          </div>

          {/* Mode Selector */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
              {modes.map((mode) => {
                const Icon = mode.icon
                return (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(mode.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-colors font-medium text-sm",
                      activeMode === mode.id
                        ? "bg-orange-500 text-white"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{mode.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mode Description */}
          <div className="mb-8 text-center">
            <p className="text-slate-400">
              {modes.find(m => m.id === activeMode)?.description}
            </p>
          </div>

          {/* Main Input Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={modes.find(m => m.id === activeMode)?.placeholder}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Document Upload Area (only for document mode) */}
              {activeMode === 'document' && (
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-slate-600 transition-colors">
                  <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 mb-2">
                    Drop your legal document here, or click to browse
                  </p>
                  <p className="text-sm text-slate-500">
                    Supports PDF, DOC, DOCX files up to 10MB
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-4 border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Choose File
                  </Button>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-500">
                  {activeMode === 'chat' && 'Ask anything about law, legal procedures, or get general guidance'}
                  {activeMode === 'research' && 'Research specific laws, cases, precedents, or legal concepts'}
                  {activeMode === 'document' && 'Upload documents for AI-powered analysis and insights'}
                </div>
                <Button 
                  type="submit" 
                  disabled={!input.trim() && activeMode !== 'document'}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {activeMode === 'document' ? 'Analyze' : 'Send'}
                </Button>
              </div>
            </form>
          </div>

          {/* Sample Prompts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Sample Questions</h3>
              <div className="space-y-2">
                {activeMode === 'chat' && (
                  <>
                    <button className="block w-full text-left text-sm text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition-colors">
                      "What are my rights during a police interrogation?"
                    </button>
                    <button className="block w-full text-left text-sm text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition-colors">
                      "How do I file a consumer complaint?"
                    </button>
                    <button className="block w-full text-left text-sm text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition-colors">
                      "What is the process for property registration?"
                    </button>
                  </>
                )}
                {activeMode === 'research' && (
                  <>
                    <button className="block w-full text-left text-sm text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition-colors">
                      "Research Section 498A of IPC"
                    </button>
                    <button className="block w-full text-left text-sm text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition-colors">
                      "Find cases related to digital evidence admissibility"
                    </button>
                    <button className="block w-full text-left text-sm text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition-colors">
                      "Analyze Consumer Protection Act 2019"
                    </button>
                  </>
                )}
                {activeMode === 'document' && (
                  <>
                    <button className="block w-full text-left text-sm text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition-colors">
                      "Analyze employment contract terms"
                    </button>
                    <button className="block w-full text-left text-sm text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition-colors">
                      "Review rental agreement clauses"
                    </button>
                    <button className="block w-full text-left text-sm text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition-colors">
                      "Extract key points from court judgment"
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Quick Tips</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Be specific with your questions for better results</li>
                <li>• Include relevant context and jurisdiction</li>
                <li>• For documents, ensure text is clear and readable</li>
                <li>• Always verify AI responses with legal professionals</li>
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <MessageCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">AI Assistant Disclaimer</h4>
                <p className="text-amber-800 text-sm">
                  This AI provides information for research purposes only and does not constitute legal advice. 
                  Always consult qualified legal professionals for specific legal matters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}