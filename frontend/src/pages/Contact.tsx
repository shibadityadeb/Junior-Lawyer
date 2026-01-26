import { useNavigate } from 'react-router-dom'
import { Phone, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Contact() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Button 
          onClick={() => navigate('/')}
          variant="ghost" 
          className="text-slate-300 hover:text-white hover:bg-slate-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 mb-6">
              <Phone className="h-4 w-4 text-orange-500 mr-2" />
              <span className="text-sm text-slate-300">Contact us</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Get in touch
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Reach out to us for help and information about AskJunior.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Support Email */}
          <div className="bg-slate-100 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              support@askjunior.com
            </h2>
            <p className="text-slate-600 text-lg">
              Support's chat
            </p>
          </div>

          {/* Business Email */}
          <div className="bg-slate-100 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              hello@askjunior.com
            </h2>
            <p className="text-slate-600 text-lg">
              Send your offers
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}