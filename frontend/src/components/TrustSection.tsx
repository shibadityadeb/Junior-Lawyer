import { AlertCircle, Shield, Eye, Users } from 'lucide-react'

export function TrustSection() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Built on trust and responsibility
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl">
            We prioritize ethical AI practices, data security, and responsible legal assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-8">
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-3 text-lg">
                  Important Legal Disclaimer
                </h3>
                <p className="text-amber-800 leading-relaxed">
                  AskJunior is an AI-powered research tool and does not replace professional 
                  legal advice. Always consult with qualified attorneys for legal matters. 
                  Our AI provides information based on documents you provide, not legal counsel.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-2 text-lg">Data Privacy</h3>
                <p className="text-slate-600 leading-relaxed">
                  Your documents are encrypted and processed securely. We never store 
                  or share your sensitive legal information.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Eye className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-2 text-lg">Transparent AI</h3>
                <p className="text-slate-600 leading-relaxed">
                  Our AI provides citations and sources for all responses, ensuring 
                  transparency in how conclusions are reached.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Users className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibent text-slate-900 mb-2 text-lg">Human Oversight</h3>
                <p className="text-slate-600 leading-relaxed">
                  Our system is designed to augment, not replace, human legal expertise 
                  and professional judgment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}