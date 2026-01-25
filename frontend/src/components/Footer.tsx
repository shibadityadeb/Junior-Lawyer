import { Scale } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Security', href: '#security' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Disclaimer', href: '/disclaimer' },
    ],
    Support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Status', href: '/status' },
      { name: 'API Docs', href: '/docs' },
    ],
  }

  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <Scale className="h-7 w-7 text-orange-500" />
              <span className="text-xl font-semibold text-white">AskJunior</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-6">
              AI-powered legal research assistant that transforms your documents 
              into intelligent research tools.
            </p>
            <p className="text-sm text-slate-500">
              Built for legal professionals who value precision and efficiency.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-6 text-white text-sm uppercase tracking-wider">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <p className="text-slate-400 text-sm">
              © {currentYear} AskJunior. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm">
              Not a substitute for professional legal advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}