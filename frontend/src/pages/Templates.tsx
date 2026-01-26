import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { getTemplateCategories, downloadTemplate } from '@/utils/templateLoader'

export function Templates() {
  const navigate = useNavigate()
  const categories = getTemplateCategories()
  const [expandedCategory, setExpandedCategory] = useState<string | null>(categories[0]?.key)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleDownload = (templatePath: string, templateName: string, templateId: string) => {
    setDownloadingId(templateId)
    try {
      downloadTemplate(templatePath, templateName)
    } finally {
      setTimeout(() => setDownloadingId(null), 500)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Button 
              onClick={() => navigate('/')}
              variant="ghost" 
              className="text-slate-300 hover:text-white hover:bg-slate-800 mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>

            <div className="max-w-4xl">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-8 tracking-tight">
                Professional Legal{' '}
                <span className="text-orange-500">Document Templates</span>
              </h1>
              
              <p className="text-xl text-slate-300 mb-12 max-w-2xl leading-relaxed">
                Ready-to-use legal document templates. Download, customize, and use for your business.
              </p>

              <Button 
                onClick={() => navigate('/ai')}
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold h-auto"
              >
                Customize with AI
              </Button>
            </div>
          </div>
        </section>

        {/* Templates by Category */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category.key} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => setExpandedCategory(
                      expandedCategory === category.key ? null : category.key
                    )}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <h2 className="text-2xl font-bold text-white">
                          {category.title}
                        </h2>
                        <p className="text-sm text-slate-400">
                          {category.templates.length} templates
                        </p>
                      </div>
                    </div>
                    <div className={`text-orange-500 transition-transform ${
                      expandedCategory === category.key ? 'rotate-180' : ''
                    }`}>
                      ▼
                    </div>
                  </button>

                  {/* Templates List */}
                  {expandedCategory === category.key && (
                    <div className="border-t border-slate-800 divide-y divide-slate-800">
                      {category.templates.map((template, idx) => {
                        const templateId = `${category.key}-${idx}`
                        const isDownloading = downloadingId === templateId
                        
                        return (
                          <div
                            key={templateId}
                            className="px-6 py-4 hover:bg-slate-800/30 transition-colors flex items-center justify-between"
                          >
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {template.name}
                              </h3>
                              <p className="text-sm text-slate-400 mt-1">
                                Microsoft Word Format (.docx)
                              </p>
                            </div>
                            <button
                              onClick={() => handleDownload(template.path, template.name, templateId)}
                              disabled={isDownloading}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                isDownloading
                                  ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                                  : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
                              }`}
                            >
                              <Download className="w-4 h-4" />
                              <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 mt-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-500 mb-3">27+</div>
                <div className="text-slate-300 font-medium">Professional Templates</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-500 mb-3">6</div>
                <div className="text-slate-300 font-medium">Document Categories</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-500 mb-3">100%</div>
                <div className="text-slate-300 font-medium">Free & Customizable</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}