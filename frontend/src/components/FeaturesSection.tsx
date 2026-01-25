import { cn } from '@/lib/utils'
import { 
  MessageCircle, 
  FileText, 
  AlertTriangle, 
  Scale, 
  Globe, 
  Shield 
} from 'lucide-react'

const features = [
  {
    icon: MessageCircle,
    title: 'AI Chat (Text + Voice)',
    description: 'Natural language conversations with voice input support for seamless legal consultations.'
  },
  {
    icon: FileText,
    title: 'Legal Document Analysis',
    description: 'Upload and analyze contracts, judgments, and legal documents with AI-powered insights.'
  },
  {
    icon: AlertTriangle,
    title: 'SOS Legal Help',
    description: 'Emergency legal assistance and guidance for urgent situations and time-sensitive matters.'
  },
  {
    icon: Scale,
    title: 'Civil & Criminal Guidance',
    description: 'Comprehensive support for both civil and criminal law matters with expert recommendations.'
  },
  {
    icon: Globe,
    title: 'Multilingual Support',
    description: 'Access legal assistance in multiple languages for broader accessibility and understanding.'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade security with end-to-end encryption to protect your sensitive legal data.'
  }
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white mb-6 max-w-3xl">
            Everything you need for legal research
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl">
            Streamline your workflow with AI-powered tools designed specifically for legal professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isGlass = index % 3 === 1 // Only middle column gets glass treatment
            return (
              <div 
                key={index} 
                className={cn(
                  "p-8 rounded-lg transition-colors duration-200",
                  isGlass 
                    ? "glass-subtle hover:bg-white/10" 
                    : "bg-slate-900 hover:bg-slate-800 border border-slate-800"
                )}
              >
                <Icon className="w-8 h-8 text-blue-400 mb-6" />
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}