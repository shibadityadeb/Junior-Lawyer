import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
import { SignedOut, SignedIn, SignInButton } from '@clerk/clerk-react'

export function HeroSection() {
  return (
    <section className="bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-4xl">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-8 tracking-tight">
            Transform Legal Documents into{' '}
            <span className="text-orange-500">Intelligent Research</span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-12 max-w-2xl leading-relaxed">
            Upload case files, judgments, and legal documents. Get precise answers with 
            citations that make legal research faster and more reliable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-20">
            <SignedOut>
              <SignInButton mode="modal">
                <Button 
                  size="lg" 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold h-auto cursor-pointer"
                >
                  Start Free Trial
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button 
                asChild
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold h-auto"
              >
                <Link to="/ai">Go to AI Zone</Link>
              </Button>
            </SignedIn>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-4 text-lg font-semibold h-auto"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Process Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                number: '01',
                title: 'Upload Documents',
                description: 'Add your legal files'
              },
              {
                number: '02',
                title: 'Ask Questions',
                description: 'Query in natural language'
              },
              {
                number: '03',
                title: 'Get Answers',
                description: 'AI-powered responses'
              },
              {
                number: '04',
                title: 'With Citations',
                description: 'Source references included'
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="mb-4">
                  <div className="text-sm font-mono text-orange-500 mb-2">{step.number}</div>
                  <h3 className="font-semibold text-white mb-1 text-lg">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-6 -right-4 w-8 h-px bg-slate-700"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}