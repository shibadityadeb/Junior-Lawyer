import { HelpCircle, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Accordion } from '@/components/ui/accordion'

const faqItems = [
  {
    id: 'what-is-askjunior',
    question: 'Is AskJunior a lawyer?',
    answer: 'No, AskJunior is not a lawyer and does not provide legal advice. We are an AI-powered legal information platform that helps you understand legal concepts, analyze documents, and access legal templates. For specific legal advice, you should always consult with a qualified attorney in your jurisdiction.'
  },
  {
    id: 'legal-advice',
    question: 'Is this legal advice?',
    answer: 'No, the information provided by AskJunior is for educational and informational purposes only and should not be construed as legal advice. Every legal situation is unique, and laws vary by jurisdiction. Always consult with a licensed attorney for advice specific to your situation.'
  },
  {
    id: 'data-handling',
    question: 'How is my data handled?',
    answer: 'We take your privacy seriously. Your conversations and uploaded documents are encrypted and stored securely. We do not share your personal information with third parties without your consent. You can delete your data at any time through your account settings.'
  },
  {
    id: 'document-analysis',
    question: 'How does document analysis work?',
    answer: 'Our AI analyzes your uploaded documents using advanced natural language processing. It can identify key terms, clauses, potential issues, and provide summaries. The AI can process various document formats including PDFs, Word documents, and text files.'
  },
  {
    id: 'voice-security',
    question: 'Is voice input secure?',
    answer: 'Yes, voice input is processed securely. Audio is converted to text using encrypted connections and is not stored permanently on our servers. The voice-to-text conversion happens in real-time, and the audio data is immediately discarded after processing.'
  },
  {
    id: 'supported-jurisdictions',
    question: 'What jurisdictions does AskJunior support?',
    answer: 'AskJunior primarily focuses on common law principles and U.S. federal law, with some state-specific information. However, legal information should always be verified with local attorneys as laws vary significantly by jurisdiction.'
  },
  {
    id: 'document-templates',
    question: 'Are the document templates legally binding?',
    answer: 'Our templates provide a starting point for common legal documents, but they may need customization for your specific situation. We recommend having any important legal document reviewed by an attorney before signing.'
  },
  {
    id: 'pricing',
    question: 'How much does AskJunior cost?',
    answer: 'AskJunior offers both free and premium features. Basic document templates and limited AI interactions are available for free. Premium features include unlimited AI conversations, advanced document analysis, and priority support.'
  }
]

export function FAQ() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <Button 
          onClick={() => navigate('/')}
          variant="ghost" 
          className="text-slate-300 hover:text-white hover:bg-slate-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 mb-6">
            <HelpCircle className="h-4 w-4 text-orange-500 mr-2" />
            <span className="text-sm text-slate-300">Frequently Asked Questions</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            FAQ
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Find answers to common questions about AskJunior, our AI legal assistant, and how we can help with your legal needs.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mb-16">
          <Accordion items={faqItems} />
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Still have questions?
          </h3>
          <p className="text-slate-300 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/contact')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg"
            >
              Contact Support
            </Button>
            <Button
              onClick={() => navigate('/ai')}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-6 py-3 rounded-lg"
            >
              Try AI Assistant
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}